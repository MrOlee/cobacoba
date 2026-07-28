import { filmboxAPI } from '@/lib/api';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q || '';
  let results: any[] = [];

  if (query.trim()) {
    try {
      const filmboxRes = await filmboxAPI.search(query.trim());
      
      // Mengambil array hasil dari response API Filmbox
      const rawList = filmboxRes?.data?.list || filmboxRes?.list || filmboxRes?.data || [];
      
      if (Array.isArray(rawList)) {
        results = rawList.map((item: any) => ({
          id: item.id || item.subjectId,
          title: item.title || item.name,
          thumbnail: item.cover || item.poster || item.image,
          detailPath: item.detailPath || '',
        }));
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
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
              href={`/watch?subjectId=${item.id}&detailPath=${encodeURIComponent(item.detailPath)}&provider=filmbox&title=${encodeURIComponent(item.title)}`}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition group"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-800">
                <img
                  src={item.thumbnail || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
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
        <div className="py-16 text-center text-gray-400">
          <p>{query ? 'Tidak ada hasil ditemukan.' : 'Masukkan kata kunci pencarian di atas.'}</p>
        </div>
      )}
    </div>
  );
}
