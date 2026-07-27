module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { id = "", se = "1", ep = "1", detailPath = "" } = req.query;

  const targetUrl = `https://indocast.site/api/dramovnime/getplay?id=${id}&se=${se}&ep=${ep}&lang=in_id&detailPath=${encodeURIComponent(detailPath)}`;

  async function doFetch(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      const text = await response.text();
      try {
        return { ok: response.ok, data: JSON.parse(text) };
      } catch (e) {
        return { ok: false };
      }
    } catch (err) {
      clearTimeout(timeout);
      return { ok: false };
    }
  }

  let result = await doFetch(targetUrl);
  if (result.ok && result.data) return res.status(200).json(result.data);

  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  result = await doFetch(proxyUrl);
  if (result.ok && result.data) return res.status(200).json(result.data);

  return res.status(200).json({ success: false, message: "Gagal memuat video player." });
};
