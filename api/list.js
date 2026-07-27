module.exports = async (req, res) => {
  // Selalu aktifkan Header CORS paling awal
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const channelId = String(req.query.channelId || (req.body && req.body.channelId) || "2");
  const page = String(req.query.page || (req.body && req.body.page) || "1");

  const targetUrl = "https://indocast.site/api/dramovnime/list";
  const payload = {
    channelId: channelId,
    page: page,
    perPage: "24",
    sort: "ForYou",
    genre: "All",
    country: "All"
  };

  async function doFetch(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return { ok: response.ok, status: response.status, data: json };
      } catch (e) {
        return { ok: false, status: response.status, raw: text };
      }
    } catch (err) {
      clearTimeout(timeout);
      return { ok: false, error: err.message };
    }
  }

  // Attempt 1: Direct Fetch dari Vercel ke Indocast API
  let result = await doFetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: JSON.stringify(payload)
  });

  if (result.ok && result.data) {
    return res.status(200).json(result.data);
  }

  // Attempt 2: Format Integer Payload
  const numericPayload = {
    channelId: parseInt(channelId, 10),
    page: parseInt(page, 10),
    perPage: 24,
    sort: "ForYou",
    genre: "All",
    country: "All"
  };

  result = await doFetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15"
    },
    body: JSON.stringify(numericPayload)
  });

  if (result.ok && result.data) {
    return res.status(200).json(result.data);
  }

  // Attempt 3: Server-side Proxy Routing (jika Vercel AWS IP diblokir Cloudflare)
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  result = await doFetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  if (result.ok && result.data) {
    return res.status(200).json(result.data);
  }

  // Return JSON yang aman tanpa crash CORS di browser
  return res.status(200).json({
    success: false,
    message: "Gagal terhubung ke API Indocast (Server Timeout / Cloudflare Block).",
    data: []
  });
};
