'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { filmboxAPI } from '@/lib/api';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    async function fetchSearch() {
      setLoading(true);
      try {
        const filmboxRes = await filmboxAPI.search(query);
        const data = filmboxRes?.data?.list || filmboxRes?.list || [];
        const items = data.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          thumbnail: item.cover || item.poster,
          detailPath: item.detailPath,
          provider: 'filmbox',
        }));
        setResults(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSearch();
  }, [query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Hasil Pencarian: <span className="text-purple-400">"{query}"</span>
      </h1>

      {loading ? (
        <div className="text-gray-400 py-10 text-center animate-pulse">Mencari anime/drama...</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item, idx) => (
            <Link
              key={idx}
              href={`/watch?subjectId=${item.id}&detailPath=${encodeURIComponent(item.detailPath || '')}&provider=filmbox&title=${encodeURIComponent(item.title)}`}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition group"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-200 line-clamp-2">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 py-10 text-center">Tidak ada hasil ditemukan.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
