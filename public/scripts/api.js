const API = {
  base: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.base}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Gagal memuat data');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  anime(action, params = {}) {
    const query = new URLSearchParams({ action, ...params });
    return this.request(`/anime?${query}`);
  },

  drama(action, params = {}) {
    const query = new URLSearchParams({ action, ...params });
    return this.request(`/drama?${query}`);
  },

  search(keyword, type = 'all') {
    return this.request(`/search?q=${encodeURIComponent(keyword)}&type=${type}`);
  }
};
