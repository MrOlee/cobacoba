import { animeKompiAPI, filmboxAPI } from '@/lib/api';
import Link from 'next/link';

export default async function HomePage() {
  let animeList: any[] = [];
  let sourceProvider = 'AnimeKompi';

  try {
    // 1. Coba Ambil dari AnimeKompi Home
    const kompiRes = await animeKompiAPI.getHome(1);
    
    if (kompiRes) {
      if (Array.isArray(kompiRes.data)) animeList = kompiRes.data;
      else if (Array.isArray(kompiRes.results)) animeList = kompiRes.results;
      else if (Array.isArray(kompiRes.list)) animeList = kompiRes.list;
      else if (Array.isArray(kompiRes)) animeList = kompiRes;
    }

    // 2. Fallback: Jika AnimeKompi Kosong, Ambil dari Filmbox Home
    if (animeList.length === 0) {
      const filmboxRes = await filmboxAPI.getHome();
      if (filmboxRes) {
        let rawFilmbox = filmboxRes.data?.list || filmboxRes.data || filmboxRes.list || [];
        if (Array.isArray(rawFilmbox)) {
          animeList = rawFilmbox;
          sourceProvider = 'Filmbox';
        }
      }
    }
  } catch (err) {
    console.error("Error loading homepage data:", err);
  }

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-800/40 p-8 sm:p-12">
        <div className="max-w-xl space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
            Streaming Terlengkap
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white">
            Nonton Anime & Drama Favorit Tanpa Batas.
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Nikmati ribuan judul anime dan drama Asia dengan subtitle Indonesia gratis dan lancar.
          </p>
          <div className="pt-2 flex gap-4">
            <Link href="/search?q=Jujutsu" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition">
              Mulai Nonton
            </Link>
            <Link href="/schedule" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl border border-gray-700 transition">
              Jadwal Rilis
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Anime Latest Release */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full"></span> Anime Terbaru ({sourceProvider})
          </h2>
        </div>

        {animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.map((item: any, idx: number) => {
              const path = item.path || item.slug || item.id || item.param;
              const title = item.title || item.name || item.subjectName;
              const image = item.thumbnail || item.cover || item.poster || item.image;
              const episode = item.episode || item.latest_episode;
              const detailPath = item.detailPath || '';

              const linkHref = sourceProvider === 'Filmbox' 
                ? `/watch?subjectId=${item.id}&detailPath=${encodeURIComponent(detailPath)}&provider=filmbox&title=${encodeURIComponent(title)}`
                : `/anime/${encodeURIComponent(path)}`;

              return (
                <Link key={idx} href={linkHref} className="group relative bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition">
                  <div className="aspect-[3/4] overflow-hidden relative bg-gray-800">
                    <img src={image || '/placeholder.jpg'} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {episode && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                        {episode}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-purple-400 transition">
                      {title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
            <p className="text-sm font-medium">Sedang menghubungkan ke server anime...</p>
            <p className="text-xs text-gray-500 mt-1">Gunakan fitur **Katalog** atau **Pencarian** pada menu di atas untuk menelusuri anime.</p>
          </div>
        )}
      </section>
    </div>
  );
}
