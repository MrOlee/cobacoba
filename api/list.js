module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { 
    type = "list", 
    channelId = "2", 
    page = "1", 
    tabId = "2", 
    filterItemVer = "v3", 
    genre = "All", 
    sort = "ForYou",
    country = "All",
    query = ""
  } = { ...req.query, ...req.body };

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "User-Agent": "okhttp/4.12.0",
    "Accept": "application/json, text/plain, */*"
  };

  async function fetchApi(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timer);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return { ok: true, data: json };
      } catch (e) {
        return { ok: false, raw: text };
      }
    } catch (err) {
      clearTimeout(timer);
      return { ok: false, error: err.message };
    }
  }

  let targetUrl = "";
  let fetchOptions = { method: "GET" };

  if (type === "tabsearch") {
    targetUrl = `https://indocast.site/api/dramovnime/tabsearch?page=${page}&tabId=${tabId}${query ? '&q=' + encodeURIComponent(query) : ''}`;
  } else if (type === "filteritems") {
    targetUrl = `https://indocast.site/api/dramovnime/filteritems?tabId=${tabId}&filterItemVer=${filterItemVer}`;
  } else if (type === "info") {
    targetUrl = `https://indocast.site/api/dramovnime/info`;
  } else if (type === "tab") {
    targetUrl = `https://indocast.site/api/dramovnime/tab`;
  } else {
    // Default POST List
    targetUrl = "https://indocast.site/api/dramovnime/list";
    fetchOptions = {
      method: "POST",
      body: JSON.stringify({
        channelId: String(channelId),
        page: String(page),
        perPage: "24",
        sort: sort,
        genre: genre,
        country: country
      })
    };
  }

  const result = await fetchApi(targetUrl, fetchOptions);

  if (result.ok) {
    return res.status(200).json(result.data);
  } else {
    // Fallback: jika Vercel Serverless diblokir, kembalikan objek penanda untuk Client Fallback
    return res.status(200).json({ success: false, fallbackRequired: true, targetUrl, method: fetchOptions.method });
  }
};
