module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { 
    action = "home", 
    page = "1", 
    perPage = "18", 
    keyword = "", 
    detailPath = "", 
    id = "", 
    subjectId = "", 
    se = "0", 
    ep = "0" 
  } = { ...req.query, ...req.body };

  let targetUrl = "";
  let options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "User-Agent": "okhttp/4.12.0",
      "Accept": "application/json, text/plain, */*"
    }
  };

  if (action === "home") {
    targetUrl = `https://indocast.site/api/filmbox/home`;
  } else if (action === "trending") {
    targetUrl = `https://indocast.site/api/filmbox/trending?page=${page}&perPage=${perPage}`;
  } else if (action === "search") {
    targetUrl = `https://indocast.site/api/filmbox/search`;
    options.method = "POST";
    options.body = JSON.stringify({
      keyword: keyword,
      page: String(page),
      perPage: String(perPage),
      subjectType: "2"
    });
  } else if (action === "details") {
    targetUrl = `https://indocast.site/api/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`;
  } else if (action === "getplay") {
    targetUrl = `https://indocast.site/api/filmbox/getplay?subjectId=${subjectId || id}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}&lang=in_id`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    options.signal = controller.signal;
    const response = await fetch(targetUrl, options);
    clearTimeout(timer);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(200).json({ success: false, raw: text });
    }
  } catch (err) {
    clearTimeout(timer);
    return res.status(200).json({ success: false, error: err.message });
  }
};
