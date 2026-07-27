module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { detailPath = "", se = "0" } = req.query;

  if (!detailPath) {
    return res.status(200).json({ success: false, error: "detailPath kosong" });
  }

  const targetUrl = `https://indocast.site/api/dramovnime/detaildata?se=${se}&detailPath=${encodeURIComponent(detailPath)}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "x-api-key": apiKey,
    "Accept": "application/json, text/plain, */*"
  };

  async function tryFetch(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(url, { method: "GET", headers, signal: controller.signal });
      clearTimeout(timer);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json && (json.data || json.chapterList || json.episodes)) return { success: true, data: json };
        return { success: false };
      } catch (e) {
        return { success: false };
      }
    } catch (err) {
      clearTimeout(timer);
      return { success: false };
    }
  }

  let r1 = await tryFetch(targetUrl);
  if (r1.success) return res.status(200).json(r1.data);

  let p2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  let r2 = await tryFetch(p2);
  if (r2.success) return res.status(200).json(r2.data);

  let p3 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
  let r3 = await tryFetch(p3);
  if (r3.success) return res.status(200).json(r3.data);

  return res.status(200).json({ success: false, message: "Gagal memuat detail." });
};
