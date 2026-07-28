import { animeKompiAPI, filmboxAPI } from '@/lib/api';
import Link from 'next/link';

export default async function HomePage() {
  let animeList: any[] = [];
  let filmboxHome: any = null;

  try {
    const [kompiRes, filmboxRes] = await Promise.allSettled([
      animeKompiAPI.getHome(1),
      filmboxAPI.getHome(),
    ]);

    if (kompiRes.status === 'fulfilled') animeList = kompiRes.value?.data || kompiRes.value?.results || [];
    if (filmboxRes.status === 'fulfilled') filmboxHome = filmboxRes.value?.data || filmboxRes.value;
  } catch (err) {
    console.error("Error loading home data", err);
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
            <span className="w-2 h-6 bg-purple-500 rounded-full"></span> Anime Terbaru (AnimeKompi)
          </h2>
        </div>

        {animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.map((item: any, idx: number) => {
              const path = item.path || item.slug || item.id;
              const title = item.title || item.name;
              const image = item.thumbnail || item.cover || item.poster;
              const episode = item.episode || item.latest_episode;

              return (
                <Link key={idx} href={`/anime/${encodeURIComponent(path)}`} className="group relative bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition">
                  <div className="aspect-[3/4] overflow-hidden relative">
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
          <p className="text-gray-400 text-sm">Sedang memuat data anime...</p>
        )}
      </section>
    </div>
  );
}
