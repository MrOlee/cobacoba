module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'home', page = '1', genre = '', path = '', episode_id = '' } = req.query;
  const API_KEY = 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';
  
  let url = '';
  
  switch(action) {
    case 'home':
      url = `https://indocast.site/api/animekompi/home?page=${page}`;
      break;
    case 'schedule':
      url = 'https://indocast.site/api/animekompi/schedule';
      break;
    case 'genres':
      url = 'https://indocast.site/api/animekompi/genres';
      break;
    case 'genredetail':
      url = `https://indocast.site/api/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`;
      break;
    case 'list':
      url = 'https://indocast.site/api/animekompi/list';
      break;
    case 'detail':
      url = `https://indocast.site/api/animekompi/detail?path=${encodeURIComponent(path)}`;
      break;
    case 'play':
      url = `https://indocast.site/api/animekompi/play?episode_id=${encodeURIComponent(episode_id)}`;
      break;
    default:
      return res.status(400).json({ error: 'Action tidak valid' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        'Origin': 'https://indocast.site',
        'Referer': 'https://indocast.site/'
      }
    });

    const text = await response.text();
    
    // Coba parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(200).json({ 
        success: false, 
        error: 'Response bukan JSON',
        raw: text.slice(0, 500)
      });
    }
    
    // KIRIM DATA LENGKAP KE FRONTEND
    return res.status(200).json({
      success: true,
      data: data,
      debug: {
        hasData: !!data,
        keys: Object.keys(data || {}),
        sample: JSON.stringify(data).slice(0, 300)
      }
    });

  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
};
