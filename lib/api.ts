// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://indocast.site/api';
const FILMBOX_KEY = process.env.NEXT_PUBLIC_FILMBOX_API_KEY || '849332c4d5ba58d0d5e9563380f5472de70c74bb598f2c5cbbb5f6c274063a51';
const ANIMEKOMPI_KEY = process.env.NEXT_PUBLIC_ANIMEKOMPI_API_KEY || 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

// DATA CADANGAN (FALLBACK) SAAT API INDOCAST DOWN / BLOCKED
const FALLBACK_ANIME_DATABASE = [
  {
    id: 'jujutsu-kaisen-season-2',
    title: 'Jujutsu Kaisen Season 2',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1792/138022.jpg',
    episode: 'Episode 23',
    path: 'jujutsu-kaisen-season-2',
    detailPath: 'jujutsu-kaisen-s2',
    provider: 'animekompi',
  },
  {
    id: 'jujutsu-kaisen-0-movie',
    title: 'Jujutsu Kaisen 0 Movie',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1121/119044.jpg',
    episode: 'Movie',
    path: 'jujutsu-kaisen-0',
    detailPath: 'jujutsu-kaisen-0',
    provider: 'filmbox',
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
    episode: 'Episode 1100+',
    path: 'one-piece',
    detailPath: 'one-piece',
    provider: 'animekompi',
  },
  {
    id: 'demon-slayer-kimetsu-no-yaiba-hashira-geiko-hen',
    title: 'Demon Slayer: Hashira Training Arc',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1261/141318.jpg',
    episode: 'Episode 8',
    path: 'demon-slayer-hashira-training',
    detailPath: 'demon-slayer-hashira-training',
    provider: 'animekompi',
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling (Ore dake Level Up na Ken)',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1208/140276.jpg',
    episode: 'Episode 12',
    path: 'solo-leveling',
    detailPath: 'solo-leveling',
    provider: 'animekompi',
  },
  {
    id: 'naruto-shippuden',
    title: 'Naruto Shippuden',
    thumbnail: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg',
    episode: 'Episode 500',
    path: 'naruto-shippuden',
    detailPath: 'naruto-shippuden',
    provider: 'filmbox',
  },
];

/**
 * Universal Fetcher dengan timeout dan auto-handling
 */
async function fetcher(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // Timeout 6 detik

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-api-key': apiKey,
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API Warning] ${endpoint} Status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[Fetch Failed] ${endpoint}:`, error);
    return null;
  }
}

// ==========================================
// 1. FILMBOX API ENDPOINTS
// ==========================================
export const filmboxAPI = {
  getHome: async () => {
    const res = await fetcher('/filmbox/home', FILMBOX_KEY);
    if (res) return res;
    // Fallback jika API gagal
    return { data: { list: FALLBACK_ANIME_DATABASE } };
  },

  search: async (keyword: string, page: string | number = '1', perPage: string | number = '28') => {
    const res = await fetcher('/filmbox/search', FILMBOX_KEY, {
      method: 'POST',
      body: JSON.stringify({
        keyword: keyword,
        page: String(page),
        perPage: String(perPage),
        subjectType: '2',
      }),
    });

    if (res) return res;

    // Fallback Search Lokal dari Database Cadangan
    const filtered = FALLBACK_ANIME_DATABASE.filter((item) =>
      item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    return { data: { list: filtered } };
  },

  getDetails: (detailPath: string, id: string) =>
    fetcher(`/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`, FILMBOX_KEY),

  getPlay: (subjectId: string, detailPath: string, se: number | string = 0, ep: number | string = 0, lang = 'in_id') =>
    fetcher(
      `/filmbox/getplay?subjectId=${subjectId}&detailPath=${encodeURIComponent(
        detailPath
      )}&se=${se}&ep=${ep}&lang=${lang}`,
      FILMBOX_KEY
    ),
};

// ==========================================
// 2. ANIMEKOMPI API ENDPOINTS
// ==========================================
export const animeKompiAPI = {
  getHome: async (page: number | string = 1) => {
    const res = await fetcher(`/animekompi/home?page=${page}`, ANIMEKOMPI_KEY);
    if (res) return res;
    // Fallback jika API gagal
    return { data: FALLBACK_ANIME_DATABASE };
  },

  getSchedule: () => 
    fetcher('/animekompi/schedule', ANIMEKOMPI_KEY),

  getGenres: () => 
    fetcher('/animekompi/genres', ANIMEKOMPI_KEY),

  getGenreDetail: (genre: string, page: number | string = 1) =>
    fetcher(`/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`, ANIMEKOMPI_KEY),

  getList: async () => {
    const res = await fetcher('/animekompi/list', ANIMEKOMPI_KEY);
    if (res) return res;
    return { data: FALLBACK_ANIME_DATABASE };
  },

  getDetail: (path: string) => 
    fetcher(`/animekompi/detail?path=${encodeURIComponent(path)}`, ANIMEKOMPI_KEY),

  getPlay: (episodeId: string) => 
    fetcher(`/animekompi/play?episode_id=${encodeURIComponent(episodeId)}`, ANIMEKOMPI_KEY),
};
