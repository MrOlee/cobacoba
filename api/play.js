module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { id = "", se = "1", ep = "1", detailPath = "" } = req.query;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "User-Agent": "okhttp/4.12.0"
  };

  try {
    const getplayUrl = `https://indocast.site/api/dramovnime/getplay?id=${id}&se=${se}&ep=${ep}&lang=in_id&detailPath=${encodeURIComponent(detailPath)}`;
    const response = await fetch(getplayUrl, { method: "GET", headers });
    const text = await response.text();
    const data = JSON.parse(text);
    if (data?.data?.playUrl || data?.playUrl || data?.url) {
      return res.status(200).json(data);
    }
  } catch (e) {}

  try {
    const playUrl = `https://indocast.site/api/dramovnime/play?se=${se}&ep=${ep}`;
    const response = await fetch(playUrl, { method: "GET", headers });
    const text = await response.text();
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (e) {}

  return res.status(200).json({ success: false });
};
