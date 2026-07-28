const { ApiFetcher } = require('./_lib/fetcher');
const { DataTransformer } = require('./_lib/transformers');
const { CONFIG } = require('./_lib/config');

const fetcher = new ApiFetcher();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, error: 'Keyword minimal 2 karakter' });
    }

    const results = {
      anime: [],
      drama: [],
      total: 0
    };

    // Search anime
    if (type === 'all' || type === 'anime') {
      try {
        const animeData = await fetcher.fetch(`${CONFIG.baseUrls.anime}/home`, { params: { page: 1 } });
        const items = DataTransformer.extractItems(animeData);
        const filtered = items
          .filter(item => {
            const title = item.title || item.name || item.caption || '';
            return title.toLowerCase().includes(q.toLowerCase());
          })
          .map(item => ({ ...DataTransformer.normalizeItem(item, 'anime'), source: 'anime' }));
        results.anime = filtered.slice(0, 20);
      } catch (e) {
        // Silent fail untuk anime
      }
    }

    // Search drama
    if (type === 'all' || type === 'drama') {
      try {
        const dramaData = await fetcher.fetch(`${CONFIG.baseUrls.drama}/search`, {
          method: 'POST',
          body: { keyword: q, page: '1', perPage: '20', subjectType: '2' }
        });
        const items = DataTransformer.extractItems(dramaData);
        const normalized = items
          .slice(0, 20)
          .map(item => ({ ...DataTransformer.normalizeItem(item, 'drama'), source: 'drama' }));
        results.drama = normalized;
      } catch (e) {
        // Silent fail untuk drama
      }
    }

    results.total = results.anime.length + results.drama.length;

    return res.status(200).json({ success: true, ...results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
