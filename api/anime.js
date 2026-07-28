module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { action = "home", page = "1", genre = "", path = "", episode_id = "" } = { ...req.query, ...req.body };

  let targetUrl = "";
  if (action === "home") targetUrl = `https://indocast.site/api/animekompi/home?page=${page}`;
  else if (action === "schedule") targetUrl = `https://indocast.site/api/animekompi/schedule`;
  else if (action === "genres") targetUrl = `https://indocast.site/api/animekompi/genres`;
  else if (action === "genredetail") targetUrl = `https://indocast.site/api/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`;
  else if (action === "list") targetUrl = `https://indocast.site/api/animekompi/list`;
  else if (action === "detail") targetUrl = `https://indocast.site/api/animekompi/detail?path=${encodeURIComponent(path)}`;
  else if (action === "play") targetUrl = `https://indocast.site/api/animekompi/play?episode_id=${encodeURIComponent(episode_id)}`;

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
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(200).json({ success: false, raw: text });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};
