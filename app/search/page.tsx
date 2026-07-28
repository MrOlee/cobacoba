import { filmboxAPI, animeKompiAPI } from '@/lib/api';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q || '';
  let results: any[] = [];

  if (query.trim()) {
    const cleanQuery = query.trim().toLowerCase();

    // ==========================================
    // 1. CARI VIA FILMBOX API (PENGECEKAN DINAMIS)
    // ==========================================
    try {
      const filmboxRes = await filmboxAPI.search(query.trim());
      
      let rawList: any[] = [];
      if (filmboxRes) {
        if (Array.isArray(filmboxRes.data?.list)) rawList = filmboxRes.data.list;
        else if (Array.isArray(filmboxRes.data?.items)) rawList = filmboxRes.data.items;
        else if (Array.isArray(filmboxRes.data?.searchResults)) rawList = filmboxRes.data.searchResults;
        else if (Array.isArray(filmboxRes.data)) rawList = filmboxRes.data;
        else if (Array.isArray(filmboxRes.list)) rawList = filmboxRes.list;
        else if (Array.isArray(filmboxRes.results)) rawList = filmboxRes.results;
      }

      if (rawList.length > 0) {
        results = rawList.map((item: any) => ({
          id: item.id || item.subjectId,
          title: item.title || item.name || item.subjectName,
          thumbnail: item.cover || item.poster || item.image || item.coverImg,
          provider: 'filmbox',
          href: `/watch?subjectId=${item.id || item.subjectId}&detailPath=${encodeURIComponent(item.detailPath || '')}&provider=filmbox&title=${encodeURIComponent(item.title || item.name || '')}`
        }));
      }
    } catch (err) {
      console.error("Filmbox search error:", err);
    }

    // ==========================================
    // 2. FALLBACK: CARI VIA ANIMEKOMPI LIST
    // ==========================================
    if (results.length === 0) {
      try {
        const kompiListRes = await animeKompiAPI.getList();
        let kompiList: any[] = [];

        if (kompiListRes) {
          if (Array.isArray(kompiListRes.data)) kompiList = kompiListRes.data;
          else if (Array.isArray(kompiListRes.results)) kompiList = kompiListRes.results;
          else if (Array.isArray(kompiListRes)) kompiList = kompiListRes;
        }

        const matchedKompi = kompiList.filter((item: any) => {
          const title = (item.title || item.name || '').toLowerCase();
          return title.includes(cleanQuery);
        });

        if (matchedKompi.length > 0) {
          results = matchedKompi.map((item: any) => ({
            id: item.path || item.slug || item.id,
            title: item.title || item.name,
            thumbnail: item.thumbnail || item.cover || item.poster || '/placeholder.jpg',
            provider: 'animekompi',
            href: `/anime/${encodeURIComponent(item.path || item.slug || item.id)}`
          }));
        }
      } catch (err) {
        console.error("AnimeKompi fallback error:", err);
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Hasil Pencarian: <span className="text-purple-400">"{query}"</span>
      </h1>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition group"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-800">
                <img
                  src={item.thumbnail || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700/50">
                  {item.provider}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-purple-400 transition">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 space-y-2">
          <p>{query ? 'Tidak ada hasil ditemukan.' : 'Masukkan kata kunci pencarian di atas.'}</p>
          <p className="text-xs text-gray-500">Coba gunakan kata kunci seperti "Jujutsu", "One Piece", atau "Naruto".</p>
        </div>
      )}
    </div>
  );
}
