import { animeKompiAPI } from '@/lib/api';
import Link from 'next/link';

export default async function AnimeDetailPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  let detailData: any = null;

  try {
    const res = await animeKompiAPI.getDetail(slug);
    detailData = res?.data || res;
  } catch (e) {
    console.error('Failed to load anime detail', e);
  }

  if (!detailData) {
    return (
      <div className="py-20 text-center text-gray-400">
        <h1 className="text-2xl font-bold text-white mb-2">Anime Tidak Ditemukan</h1>
        <p>Gagal memuat informasi anime ini.</p>
      </div>
    );
  }

  const episodes = detailData.episodes || detailData.episode_list || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
        <img
          src={detailData.thumbnail || detailData.poster || detailData.cover}
          alt={detailData.title}
          className="w-full md:w-64 aspect-[3/4] object-cover rounded-xl shadow-lg border border-gray-700"
        />
        <div className="space-y-4 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{detailData.title}</h1>
          <div className="flex flex-wrap gap-2 text-xs text-purple-300">
            {detailData.genres?.map((g: any, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-purple-900/50 border border-purple-700/50 rounded-md">
                {g.name || g}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{detailData.synopsis || detailData.description || 'Tidak ada sinopsis.'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-5 bg-cyan-400 rounded-full"></span> Daftar Episode ({episodes.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {episodes.map((ep: any, idx: number) => {
            const epId = ep.id || ep.episode_id || ep.slug || ep.path;
            return (
              <Link
                key={idx}
                href={`/watch?ep=${encodeURIComponent(epId)}&provider=animekompi&title=${encodeURIComponent(detailData.title + ' - ' + (ep.title || `Episode ${idx + 1}`))}`}
                className="bg-gray-800/60 hover:bg-purple-600/80 border border-gray-700 hover:border-purple-400 p-3 rounded-xl text-center text-xs font-semibold text-gray-200 hover:text-white transition"
              >
                {ep.title || `Episode ${idx + 1}`}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
