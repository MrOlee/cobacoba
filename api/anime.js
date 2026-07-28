const { ApiFetcher } = require('./_lib/fetcher');
const { DataTransformer } = require('./_lib/transformers');
const { CONFIG } = require('./_lib/config');

const fetcher = new ApiFetcher();

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action = 'home', page = '1', genre = '', path = '', episode_id = '' } = { ...req.query, ...req.body };

    // Mapping action ke endpoint
    const endpointMap = {
      home: `${CONFIG.baseUrls.anime}/home`,
      schedule: `${CONFIG.baseUrls.anime}/schedule`,
      genres: `${CONFIG.baseUrls.anime}/genres`,
      genredetail: `${CONFIG.baseUrls.anime}/genre-detail`,
      list: `${CONFIG.baseUrls.anime}/list`,
      detail: `${CONFIG.baseUrls.anime}/detail`,
      play: `${CONFIG.baseUrls.anime}/play`
    };

    const baseEndpoint = endpointMap[action];
    if (!baseEndpoint) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    // Build params
    const params = { page };
    if (action === 'genredetail') params.genre = genre;
    if (action === 'detail') params.path = path;
    if (action === 'play') params.episode_id = episode_id;

    // Fetch data
    const data = await fetcher.fetch(baseEndpoint, { params });

    // Transform response
    let response;
    if (action === 'genres') {
      const items = DataTransformer.extractItems(data);
      response = { success: true, data: items.map(g => g.name || g.title || g) };
    } else if (action === 'detail' || action === 'play') {
      const streamUrl = DataTransformer.extractStreamUrl(data);
      response = { 
        success: true, 
        data: data.data || data,
        stream: streamUrl
      };
    } else {
      const items = DataTransformer.extractItems(data);
      response = { 
        success: true, 
        data: items.map(item => DataTransformer.normalizeItem(item, 'anime')),
        total: items.length
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Anime API Error:', error.message);
    return res.status(200).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
