// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://indocast.site/api';
const FILMBOX_KEY = process.env.NEXT_PUBLIC_FILMBOX_API_KEY || '849332c4d5ba58d0d5e9563380f5472de70c74bb598f2c5cbbb5f6c274063a51';
const ANIMEKOMPI_KEY = process.env.NEXT_PUBLIC_ANIMEKOMPI_API_KEY || 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

async function fetcher(endpoint: string, apiKey: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        ...(options.headers || {}),
      },
      cache: 'no-store', // Mencegah caching error pada SSR Vercel
    });

    if (!res.ok) {
      console.error(`API Error ${endpoint}: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Fetch Exception ${endpoint}:`, error);
    return null;
  }
}

export const filmboxAPI = {
  getHome: () => fetcher('/filmbox/home', FILMBOX_KEY),
  search: (keyword: string, page = '1', perPage = '28') =>
    fetcher('/filmbox/search', FILMBOX_KEY, {
      method: 'POST',
      body: JSON.stringify({ keyword, page, perPage, subjectType: '2' }),
    }),
  getDetails: (detailPath: string, id: string) =>
    fetcher(`/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`, FILMBOX_KEY),
  getPlay: (subjectId: string, detailPath: string, se = 0, ep = 0, lang = 'in_id') =>
    fetcher(
      `/filmbox/getplay?subjectId=${subjectId}&detailPath=${encodeURIComponent(
        detailPath
      )}&se=${se}&ep=${ep}&lang=${lang}`,
      FILMBOX_KEY
    ),
};

export const animeKompiAPI = {
  getHome: (page = 1) => fetcher(`/animekompi/home?page=${page}`, ANIMEKOMPI_KEY),
  getSchedule: () => fetcher('/animekompi/schedule', ANIMEKOMPI_KEY),
  getGenres: () => fetcher('/animekompi/genres', ANIMEKOMPI_KEY),
  getGenreDetail: (genre: string, page = 1) =>
    fetcher(`/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`, ANIMEKOMPI_KEY),
  getList: () => fetcher('/animekompi/list', ANIMEKOMPI_KEY),
  getDetail: (path: string) => fetcher(`/animekompi/detail?path=${encodeURIComponent(path)}`, ANIMEKOMPI_KEY),
  getPlay: (episodeId: string) => fetcher(`/animekompi/play?episode_id=${encodeURIComponent(episodeId)}`, ANIMEKOMPI_KEY),
};
