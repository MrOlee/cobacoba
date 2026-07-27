module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { detailPath = "", se = "0" } = req.query;

  if (!detailPath) return res.status(200).json({ success: false });

  const targetUrl = `https://indocast.site/api/dramovnime/detaildata?se=${se}&detailPath=${encodeURIComponent(detailPath)}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "okhttp/4.12.0"
      }
    });
    const text = await response.text();
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  }
};
