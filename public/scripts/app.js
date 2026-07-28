const App = {
  currentCategory: 'anime',
  currentData: null,
  currentMeta: null,

  init() {
    this.bindEvents();
    this.loadCategory('anime');
  },

  bindEvents() {
    // Nav tabs
    document.querySelectorAll('.main-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadCategory(category);
      });
    });

    // Search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          this.search(query);
        }
      }
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
      this.showCatalog();
    });
  },

  async loadCategory(category) {
    this.currentCategory = category;
    this.showCatalog();

    const subNav = document.getElementById('subNav');
    if (category === 'anime') {
      subNav.innerHTML = `
        <button data-action="home" class="active">🏠 Home</button>
        <button data-action="list">📜 Daftar</button>
        <button data-action="schedule">📅 Jadwal</button>
        <button data-action="genres">🏷️ Genre</button>
      `;
    } else {
      subNav.innerHTML = `
        <button data-action="home" class="active">🏠 Home</button>
        <button data-action="trending">🔥 Trending</button>
      `;
    }

    // Sub-nav click
    subNav.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        subNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const action = btn.dataset.action;
        if (category === 'anime') {
          this.loadAnime(action);
        } else {
          this.loadDrama(action);
        }
      });
    });

    // Load default
    if (category === 'anime') {
      this.loadAnime('home');
    } else {
      this.loadDrama('home');
    }
  },

  async loadAnime(action, params = {}) {
    const grid = document.getElementById('catalog');
    grid.innerHTML = '<div class="loading">Memuat anime...</div>';

    try {
      const result = await API.anime(action, { page: '1', ...params });
      this.currentData = result.data || [];
      this.renderGrid(this.currentData, 'anime');
    } catch (error) {
      grid.innerHTML = `<div class="empty">${error.message}<br><button onclick="App.loadAnime('home')">Coba Lagi</button></div>`;
    }
  },

  async loadDrama(action, params = {}) {
    const grid = document.getElementById('catalog');
    grid.innerHTML = '<div class="loading">Memuat drama...</div>';

    try {
      const result = await API.drama(action, { page: '0', perPage: '18', ...params });
      this.currentData = result.data || [];
      this.renderGrid(this.currentData, 'drama');
    } catch (error) {
      grid.innerHTML = `<div class="empty">${error.message}<br><button onclick="App.loadDrama('home')">Coba Lagi</button></div>`;
    }
  },

  renderGrid(items, type) {
    const grid = document.getElementById('catalog');
    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="empty">Tidak ada data ditemukan</div>';
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="card" data-id="${item.id}" data-path="${item.path}" data-type="${type}">
        <img class="poster" src="${item.poster || 'https://via.placeholder.com/300x400/141a24/00d4ff?text=No+Cover'}" 
             alt="${item.title}" loading="lazy" 
             onerror="this.src='https://via.placeholder.com/300x400/141a24/00d4ff?text=No+Cover'">
        <div class="title">${item.title}</div>
        ${item.year ? `<div class="meta">${item.year}</div>` : ''}
      </div>
    `).join('');

    // Click handler
    grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        const path = card.dataset.path;
        const title = card.querySelector('.title').textContent;
        const id = card.dataset.id;
        if (type === 'anime') {
          this.openAnimeDetail(path, title);
        } else {
          this.openDramaDetail(path, id, title);
        }
      });
    });
  },

  async openAnimeDetail(path, title) {
    this.showPlayer();
    document.getElementById('playerTitle').textContent = title;
    const epList = document.getElementById('episodeList');
    epList.innerHTML = '<div class="loading">Memuat episode...</div>';

    try {
      const result = await API.anime('detail', { path });
      const data = result.data || {};
      const episodes = data.episode_list || data.episodes || [];
      
      if (episodes.length === 0) {
        epList.innerHTML = '<div class="empty">Tidak ada episode</div>';
        return;
      }

      epList.innerHTML = `
        <h3>Episode</h3>
        <div class="episode-grid">
          ${episodes.map((ep, i) => `
            <button data-id="${ep.episode_id || ep.id || ep.path}" data-index="${i}">
              ${i + 1}
            </button>
          `).join('')}
        </div>
      `;

      // Play first episode
      const firstId = episodes[0].episode_id || episodes[0].id || episodes[0].path;
      this.playAnime(firstId);

      // Episode click
      epList.querySelectorAll('.episode-grid button').forEach(btn => {
        btn.addEventListener('click', () => {
          epList.querySelectorAll('.episode-grid button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.playAnime(btn.dataset.id);
        });
      });

    } catch (error) {
      epList.innerHTML = `<div class="empty">${error.message}</div>`;
    }
  },

  async playAnime(episodeId) {
    const iframe = document.getElementById('playerIframe');
    iframe.src = 'about:blank';

    try {
      const result = await API.anime('play', { episode_id: episodeId });
      if (result.stream) {
        iframe.src = result.stream;
      } else {
        throw new Error('Link stream tidak ditemukan');
      }
    } catch (error) {
      iframe.src = 'about:blank';
      alert('Gagal memutar: ' + error.message);
    }
  },

  async openDramaDetail(path, id, title) {
    this.showPlayer();
    document.getElementById('playerTitle').textContent = title;
    const epList = document.getElementById('episodeList');
    epList.innerHTML = '<div class="loading">Memuat episode...</div>';

    try {
      const result = await API.drama('details', { detailPath: path, id });
      const data = result.data || {};
      const episodes = data.episodes || data.chapterList || data.resourceList || [];

      if (episodes.length === 0) {
        epList.innerHTML = '<div class="empty">Episode tidak tersedia</div>';
        // Try play anyway
        this.playDrama(path, id, 0);
        return;
      }

      epList.innerHTML = `
        <h3>Episode</h3>
        <div class="episode-grid">
          ${episodes.map((ep, i) => `
            <button data-index="${i}">${i + 1}</button>
          `).join('')}
        </div>
      `;

      this.playDrama(path, id, 0);

      epList.querySelectorAll('.episode-grid button').forEach(btn => {
        btn.addEventListener('click', () => {
          epList.querySelectorAll('.episode-grid button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.playDrama(path, id, parseInt(btn.dataset.index));
        });
      });

    } catch (error) {
      epList.innerHTML = `<div class="empty">${error.message}</div>`;
    }
  },

  async playDrama(path, id, epIndex) {
    const iframe = document.getElementById('playerIframe');
    iframe.src = 'about:blank';

    try {
      const result = await API.drama('getplay', { 
        detailPath: path, 
        id, 
        se: '0', 
        ep: String(epIndex) 
      });

      if (result.stream) {
        iframe.src = result.stream;
      } else {
        throw new Error('Link stream tidak ditemukan');
      }
    } catch (error) {
      iframe.src = 'about:blank';
      alert('Gagal memutar episode: ' + error.message);
    }
  },

  async search(query) {
    this.showCatalog();
    const grid = document.getElementById('catalog');
    grid.innerHTML = '<div class="loading">Mencari...</div>';

    try {
      const result = await API.search(query);
      const allData = [...(result.anime || []), ...(result.drama || [])];
      if (allData.length === 0) {
        grid.innerHTML = '<div class="empty">Tidak ditemukan hasil untuk "' + query + '"</div>';
        return;
      }
      this.renderGrid(allData, 'all');
    } catch (error) {
      grid.innerHTML = `<div class="empty">${error.message}</div>`;
    }
  },

  showCatalog() {
    document.getElementById('catalog').style.display = 'grid';
    document.getElementById('player').style.display = 'none';
  },

  showPlayer() {
    document.getElementById('catalog').style.display = 'none';
    document.getElementById('player').style.display = 'block';
    document.getElementById('episodeList').innerHTML = '';
  }
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());
