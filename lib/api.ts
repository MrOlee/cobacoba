// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://indocast.site/api';
const FILMBOX_KEY = process.env.NEXT_PUBLIC_FILMBOX_API_KEY || '849332c4d5ba58d0d5e9563380f5472de70c74bb598f2c5cbbb5f6c274063a51';
const ANIMEKOMPI_KEY = process.env.NEXT_PUBLIC_ANIMEKOMPI_API_KEY || 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

/**
 * Helper fetcher universal untuk menangani semua request API
 */
async function fetcher(endpoint: string, apiKey: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        ...(options.headers || {}),
      },
      cache: 'no-store', // Mencegah caching error saat di-build di Vercel
    });

    if (!res.ok) {
      console.error(`[API Error] ${endpoint} Status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[Fetch Exception] ${endpoint}:`, error);
    return null;
  }
}

// ==========================================
// 1. FILMBOX API ENDPOINTS
// ==========================================
export const filmboxAPI = {
  // Get Home Content
  getHome: () => fetcher('/filmbox/home', FILMBOX_KEY),

  // Search Anime/Movie (POST Request)
  search: (keyword: string, page: string | number = '1', perPage: string | number = '28') =>
    fetcher('/filmbox/search', FILMBOX_KEY, {
      method: 'POST',
      body: JSON.stringify({
        keyword: keyword,
        page: String(page),
        perPage: String(perPage),
        subjectType: '2', // 2 = Anime / Serial
      }),
    }),

  // Get Detail Drama/Anime
  getDetails: (detailPath: string, id: string) =>
    fetcher(`/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`, FILMBOX_KEY),

  // Get Play / Streaming Link
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
  // Get Home Anime List
  getHome: (page: number | string = 1) => 
    fetcher(`/animekompi/home?page=${page}`, ANIMEKOMPI_KEY),

  // Get Schedule
  getSchedule: () => 
    fetcher('/animekompi/schedule', ANIMEKOMPI_KEY),

  // Get All Genres
  getGenres: () => 
    fetcher('/animekompi/genres', ANIMEKOMPI_KEY),

  // Get Anime by Genre
  getGenreDetail: (genre: string, page: number | string = 1) =>
    fetcher(`/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`, ANIMEKOMPI_KEY),

  // Get Anime A-Z List
  getList: () => 
    fetcher('/animekompi/list', ANIMEKOMPI_KEY),

  // Get Anime Detail by Path
  getDetail: (path: string) => 
    fetcher(`/animekompi/detail?path=${encodeURIComponent(path)}`, ANIMEKOMPI_KEY),

  // Get Streaming Play Link
  getPlay: (episodeId: string) => 
    fetcher(`/animekompi/play?episode_id=${encodeURIComponent(episodeId)}`, ANIMEKOMPI_KEY),
};
