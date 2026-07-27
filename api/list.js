module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const channelId = String(req.query.channelId || req.body?.channelId || "2");
  const page = String(req.query.page || req.body?.page || "1");

  // Tab ID: 2 = Anime, 1 = Drama, 0 = All
  const tabId = channelId === "1" ? "1" : "2";

  // Header Mobile Android OkHttp (Kunci Utama Lolos Cloudflare)
  const androidHeaders = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "User-Agent": "okhttp/4.12.0",
    "Accept": "application/json, text/plain, */*"
  };

  async function tryFetch(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json && (json.data || json.list || json.items || Array.isArray(json))) {
          return { ok: true, data: json };
        }
        return { ok: false };
      } catch (e) {
        return { ok: false };
      }
    } catch (err) {
      clearTimeout(timer);
      return { ok: false };
    }
  }

  // Percobaan 1: Endpoint GET tabsearch dengan Header Android (Sangat Cepat & Stabil)
  const tabUrl = `https://indocast.site/api/dramovnime/tabsearch?page=${page}&tabId=${tabId}`;
  let res1 = await tryFetch(tabUrl, { method: "GET", headers: androidHeaders });
  if (res1.ok) return res.status(200).json(res1.data);

  // Percobaan 2: Endpoint POST list dengan Header Android
  const listUrl = "https://indocast.site/api/dramovnime/list";
  const listPayload = JSON.stringify({
    channelId: channelId,
    page: page,
    perPage: "24",
    sort: "ForYou",
    genre: "All",
    country: "All"
  });
  let res2 = await tryFetch(listUrl, { method: "POST", headers: androidHeaders, body: listPayload });
  if (res2.ok) return res.status(200).json(res2.data);

  // Percobaan 3: Relay via CORS Proxy
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tabUrl)}`;
  let res3 = await tryFetch(proxyUrl, { method: "GET", headers: { "x-api-key": apiKey } });
  if (res3.ok) return res.status(200).json(res3.data);

  return res.status(200).json({
    success: false,
    message: "Server Indocast tidak merespon dari Vercel. Mengalihkan ke browser...",
    data: []
  });
};
