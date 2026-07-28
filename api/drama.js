module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';
  const { 
    action = 'home', 
    page = '0', 
    perPage = '18', 
    keyword = '', 
    detailPath = '', 
    id = '', 
    subjectId = '', 
    se = '0', 
    ep = '0' 
  } = req.query;

  let url = '';
  let method = 'GET';
  let body = null;

  switch(action) {
    case 'home':
      url = 'https://indocast.site/api/filmbox/home';
      break;
    case 'trending':
      url = `https://indocast.site/api/filmbox/trending?page=${page}&perPage=${perPage}`;
      break;
    case 'search':
      url = 'https://indocast.site/api/filmbox/search';
      method = 'POST';
      body = JSON.stringify({
        keyword,
        page: String(page),
        perPage: String(perPage),
        subjectType: '2'
      });
      break;
    case 'details':
      url = `https://indocast.site/api/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`;
      break;
    case 'getplay':
      const targetId = subjectId || id;
      url = `https://indocast.site/api/filmbox/getplay?subjectId=${targetId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}&lang=in_id`;
      break;
    default:
      return res.status(400).json({ error: 'Action tidak valid' });
  }

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (body) {
      options.body = body;
    }

    const response = await fetch(url, options);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(200).json({ 
        success: false, 
        raw: text,
        note: 'Response bukan JSON valid'
      });
    }

  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
};
