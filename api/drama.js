const { ApiFetcher } = require('./_lib/fetcher');
const { DataTransformer } = require('./_lib/transformers');
const { CONFIG } = require('./_lib/config');

const fetcher = new ApiFetcher();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
    } = { ...req.query, ...req.body };

    let endpoint = '';
    let params = {};
    let body = null;

    switch (action) {
      case 'home':
        endpoint = `${CONFIG.baseUrls.drama}/home`;
        break;
      case 'trending':
        endpoint = `${CONFIG.baseUrls.drama}/trending`;
        params = { page, perPage };
        break;
      case 'search':
        endpoint = `${CONFIG.baseUrls.drama}/search`;
        body = {
          keyword,
          page: String(page),
          perPage: String(perPage),
          subjectType: '2'
        };
        break;
      case 'details':
        endpoint = `${CONFIG.baseUrls.drama}/details`;
        params = { detailPath, id };
        break;
      case 'getplay':
        const targetId = subjectId || id;
        endpoint = `${CONFIG.baseUrls.drama}/getplay`;
        params = { 
          subjectId: targetId, 
          detailPath, 
          se, 
          ep, 
          lang: 'in_id' 
        };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const data = await fetcher.fetch(endpoint, { params, body: body || undefined, method: body ? 'POST' : 'GET' });

    // Transform response
    let response;
    if (action === 'details' || action === 'getplay') {
      const streamUrl = DataTransformer.extractStreamUrl(data);
      response = { 
        success: true, 
        data: data.data || data,
        stream: streamUrl
      };
    } else if (action === 'search') {
      const items = DataTransformer.extractItems(data);
      response = { 
        success: true, 
        data: items.map(item => DataTransformer.normalizeItem(item, 'drama')),
        total: items.length
      };
    } else {
      const items = DataTransformer.extractItems(data);
      response = { 
        success: true, 
        data: items.map(item => DataTransformer.normalizeItem(item, 'drama')),
        total: items.length
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Drama API Error:', error.message);
    return res.status(200).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
