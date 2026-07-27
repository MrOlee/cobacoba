module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const channelId = String(req.query.channelId || (req.body && req.body.channelId) || "2");
  const page = String(req.query.page || (req.body && req.body.page) || "1");

  const targetUrl = "https://indocast.site/api/dramovnime/list";
  const payloadStr = JSON.stringify({
    channelId: channelId,
    page: page,
    perPage: "24",
    sort: "ForYou",
    genre: "All",
    country: "All"
  });

  const headers = {
    "Host": "indocast.site",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "Origin": "https://indocast.site",
    "Referer": "https://indocast.site/",
    "Sec-Ch-Ua": '"Chromium";v="124", "Android WebView";v="124"',
    "Sec-Ch-Ua-Mobile": "?1",
    "Sec-Ch-Ua-Platform": '"Android"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
  };

  async function tryFetch(url, customHeaders = headers, method = "POST", body = payloadStr) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const opts = { method, headers: customHeaders, signal: controller.signal };
      if (method === "POST" && body) opts.body = body;
      const response = await fetch(url, opts);
      clearTimeout(timer);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json && (json.data || json.list || json.items || Array.isArray(json))) {
          return { success: true, data: json };
        }
        return { success: false, raw: text };
      } catch (e) {
        return { success: false, raw: text };
      }
    } catch (err) {
      clearTimeout(timer);
      return { success: false, error: err.message };
    }
  }

  // Jalur 1: Direct Request dengan Header Chrome Android
  let res1 = await tryFetch(targetUrl);
  if (res1.success) return res.status(200).json(res1.data);

  // Jalur 2: Payload Integer Format
  const payloadIntStr = JSON.stringify({
    channelId: parseInt(channelId, 10),
    page: parseInt(page, 10),
    perPage: 24,
    sort: "ForYou",
    genre: "All",
    country: "All"
  });
  let res2 = await tryFetch(targetUrl, headers, "POST", payloadIntStr);
  if (res2.success) return res.status(200).json(res2.data);

  // Jalur 3: Relay Proxy AllOrigins
  const p3Url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  let res3 = await tryFetch(p3Url, { "Content-Type": "application/json", "x-api-key": apiKey });
  if (res3.success) return res.status(200).json(res3.data);

  // Jalur 4: Relay Proxy CodeTabs
  const p4Url = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
  let res4 = await tryFetch(p4Url, { "Content-Type": "application/json", "x-api-key": apiKey });
  if (res4.success) return res.status(200).json(res4.data);

  return res.status(200).json({
    success: false,
    message: "Cloudflare memblokir Vercel IP. Mengalihkan ke proxy klien...",
    data: []
  });
};
