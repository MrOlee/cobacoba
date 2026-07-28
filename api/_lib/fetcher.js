const { CONFIG } = require('./config');

class ApiFetcher {
  constructor() {
    this.keyIndex = 0;
    this.cache = new Map();
  }

  getNextKey() {
    const key = CONFIG.apiKeys[this.keyIndex % CONFIG.apiKeys.length];
    this.keyIndex++;
    return key;
  }

  async fetch(endpoint, options = {}) {
    const { method = 'GET', body, params, useCache = true, ttl = 60000 } = options;
    
    // Build URL dengan params
    const url = new URL(endpoint);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const cacheKey = url.toString() + JSON.stringify(body || {});
    
    // Cek cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Retry logic dengan rotation key
    for (let attempt = 0; attempt < CONFIG.retries; attempt++) {
      try {
        const apiKey = this.getNextKey();
        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'User-Agent': CONFIG.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
          'Origin': 'https://indocast.site',
          'Referer': 'https://indocast.site/'
        };

        const fetchOptions = {
          method,
          headers,
          signal: AbortSignal.timeout(CONFIG.timeout)
        };

        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), fetchOptions);
        
        if (response.status === 401) {
          // Key expired, coba key berikutnya
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Simpan ke cache
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }

        return data;

      } catch (error) {
        if (attempt === CONFIG.retries - 1) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { ApiFetcher };
