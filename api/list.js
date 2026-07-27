module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const channelId = String(req.query.channelId || req.body?.channelId || "2");
  const page = String(req.query.page || req.body?.page || "1");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "User-Agent": "okhttp/4.12.0",
    "Accept": "application/json, text/plain, */*"
  };

  async function tryRequest(url, method = "GET", body = null) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const opts = { method, headers, signal: controller.signal };
      if (body) opts.body = body;
      const response = await fetch(url, opts);
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
    } catch (e) {
      clearTimeout(timer);
      return { ok: false };
    }
  }

  // 1. Ambil dari POST /list (Katalog Anime Utama)
  const listUrl = "https://indocast.site/api/dramovnime/list";
  const listPayloadStr = JSON.stringify({
    channelId: channelId,
    page: page,
    perPage: "18",
    sort: "ForYou",
    genre: "All",
    country: "All"
  });

  let res1 = await tryRequest(listUrl, "POST", listPayloadStr);
  if (res1.ok) return res.status(200).json(res1.data);

  // 2. Format Integer Fallback
  const listPayloadInt = JSON.stringify({
    channelId: parseInt(channelId, 10),
    page: parseInt(page, 10),
    perPage: 18,
    sort: "ForYou",
    genre: "All",
    country: "All"
  });
  let res2 = await tryRequest(listUrl, "POST", listPayloadInt);
  if (res2.ok) return res.status(200).json(res2.data);

  // 3. Fallback GET /tabsearch
  const tabId = channelId === "1" ? "1" : "2";
  const tabUrl = `https://indocast.site/api/dramovnime/tabsearch?page=${page}&tabId=${tabId}`;
  let res3 = await tryRequest(tabUrl, "GET");
  if (res3.ok) return res.status(200).json(res3.data);

  return res.status(200).json({ success: false, data: [] });
};
