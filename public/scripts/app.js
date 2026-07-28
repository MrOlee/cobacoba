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
    grid
