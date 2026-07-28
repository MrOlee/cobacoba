// Konfigurasi pusat untuk semua endpoint
const CONFIG = {
  baseUrls: {
    anime: 'https://indocast.site/api/animekompi',
    drama: 'https://indocast.site/api/filmbox'
  },
  apiKeys: [
    process.env.INDOCAST_API_KEY_1 || 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c',
    process.env.INDOCAST_API_KEY_2 || '',
    process.env.INDOCAST_API_KEY_3 || ''
  ].filter(Boolean),
  timeout: 8000,
  retries: 3,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

module.exports = { CONFIG };
