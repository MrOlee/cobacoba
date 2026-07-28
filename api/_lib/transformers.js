// Normalisasi response dari berbagai API
class DataTransformer {
  static extractItems(data) {
    if (!data) return [];
    
    // Cari array di berbagai level
    const searchPaths = [
      'data.list', 'data.items', 'data.records', 'data.results',
      'data.subjectList', 'data.subject_list', 'data.searchResultList',
      'data.data.list', 'data.data.items',
      'list', 'items', 'records', 'results'
    ];

    for (const path of searchPaths) {
      const value = this.getValueByPath(data, path);
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }

    // Jika data adalah array langsung
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;

    return [];
  }

  static getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static normalizeItem(item, type = 'anime') {
    return {
      id: item.id || item.subjectId || item.subject_id || item.slug || '',
      title: item.title || item.name || item.caption || item.subjectName || item.bookName || 'Tanpa Judul',
      path: item.path || item.slug || item.detailPath || item.detail_path || '',
      poster: this.extractPoster(item),
      year: item.year || item.releaseYear || '',
      genre: item.genre || item.genres || [],
      rating: item.rating || item.score || ''
    };
  }

  static extractPoster(item) {
    const candidates = [
      item.cover, item.poster, item.coverUrl, item.verticalCover,
      item.img, item.thumb, item.coverPath, item.image,
      item.picture, item.posterPath, item.cover_path,
      item.vertical_cover, item.horizontal_cover
    ];

    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'string') {
        let url = c.trim();
        if (url.startsWith('//')) return 'https:' + url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return 'https://indocast.site' + url;
        return url;
      }
      if (typeof c === 'object' && c !== null) {
        const nested = c.url || c.path || c.link || c.src || '';
        if (typeof nested === 'string' && nested.trim()) {
          let url = nested.trim();
          if (url.startsWith('//')) return 'https:' + url;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          return url;
        }
      }
    }
    return '';
  }

  static extractStreamUrl(data) {
    if (!data) return null;

    // Priority search paths untuk stream URL
    const priorityPaths = [
      'data.playUrl', 'data.url', 'data.mediaUrl', 'data.play_url',
      'data.videoUrl', 'data.stream', 'data.hls', 'data.m3u8',
      'data.link', 'data.embedUrl', 'data.embed_url', 'data.embed'
    ];

    for (const path of priorityPaths) {
      const value = this.getValueByPath(data, path);
      if (this.isValidStreamUrl(value)) {
        return this.normalizeUrl(value);
      }
    }

    // Recursive search
    return this.deepSearch(data);
  }

  static deepSearch(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = this.deepSearch(item);
        if (result) return result;
      }
      return null;
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (this.isValidStreamUrl(value)) {
        return this.normalizeUrl(value);
      }
      if (typeof value === 'object') {
        const result = this.deepSearch(value);
        if (result) return result;
      }
    }
    return null;
  }

  static isValidStreamUrl(value) {
    if (typeof value !== 'string') return false;
    const url = value.trim();
    if (!url) return false;
    if (url.startsWith('//') || url.startsWith('http://') || url.startsWith('https://')) {
      const extensions = ['.m3u8', '.mp4', '.mkv', '.webm'];
      const keywords = ['stream', 'embed', 'play', 'video', 'hls', 'manifest'];
      const lower = url.toLowerCase();
      return extensions.some(ext => lower.includes(ext)) || 
             keywords.some(kw => lower.includes(kw));
    }
    return false;
  }

  static normalizeUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('//')) return 'https:' + trimmed;
    return trimmed;
  }
}

module.exports = { DataTransformer };
