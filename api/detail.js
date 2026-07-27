module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const channelId = String(req.query.channelId || req.body?.channelId || "2");
  const page = String(req.query.page || req.body?.page || "1");

  const targetUrl = "https://indocast.site/api/dramovnime/list";
  const payload = JSON.stringify({
    channelId: channelId,
    page: page,
    perPage: "24",
    sort: "ForYou",
    genre: "All",
    country: "All"
  });

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://indocast.site/",
        "Origin": "https://indocast.site"
      },
      body: payload
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(502).json({ error: "Indocast merespon non-JSON", raw: text.substring(0, 100) });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
