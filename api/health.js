const { CONFIG } = require('./_lib/config');
const { ApiFetcher } = require('./_lib/fetcher');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const fetcher = new ApiFetcher();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    apis: {
      anime: { status: 'unknown' },
      drama: { status: 'unknown' }
    }
  };

  // Test anime API
  try {
    await fetcher.fetch(`${CONFIG.baseUrls.anime}/home`, { params: { page: 1 }, useCache: false });
    health.apis.anime.status = 'connected';
  } catch (e) {
    health.apis.anime.status = 'error';
    health.apis.anime.error = e.message;
  }

  // Test drama API
  try {
    await fetcher.fetch(`${CONFIG.baseUrls.drama}/home`, { useCache: false });
    health.apis.drama.status = 'connected';
  } catch (e) {
    health.apis.drama.status = 'error';
    health.apis.drama.error = e.message;
  }

  const allConnected = health.apis.anime.status === 'connected' && health.apis.drama.status === 'connected';
  health.status = allConnected ? 'healthy' : 'degraded';

  return res.status(200).json(health);
};
