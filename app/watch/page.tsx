'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { animeKompiAPI, filmboxAPI } from '@/lib/api';

function WatchContent() {
  const searchParams = useSearchParams();
  const epId = searchParams.get('ep');
  const directUrl = searchParams.get('url');
  const provider = searchParams.get('provider') || 'animekompi';
  const title = searchParams.get('title') || 'Streaming Video';

  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      try {
        if (directUrl) {
          setStreamUrl(`/api/proxy?url=${encodeURIComponent(directUrl)}&provider=${provider}&type=stream`);
        } else if (epId) {
          if (provider === 'animekompi') {
            const data = await animeKompiAPI.getPlay(epId);
            const videoSrc = data?.stream_url || data?.url || data?.data?.stream_url;
            if (videoSrc) {
              setStreamUrl(`/api/proxy?url=${encodeURIComponent(videoSrc)}&provider=animekompi&type=stream`);
            } else {
              setError('Gagal mendapatkan tautan streaming dari server.');
            }
          } else if (provider === 'filmbox') {
            const subjectId = searchParams.get('subjectId') || '';
            const detailPath = searchParams.get('detailPath') || '';
            const data = await filmboxAPI.getPlay(subjectId, detailPath);
            const videoSrc = data?.data?.playUrl || data?.playUrl;
            if (videoSrc) {
              setStreamUrl(`/api/proxy?url=${encodeURIComponent(videoSrc)}&provider=filmbox&type=stream`);
            } else {
              setError('Gagal mendapatkan tautan streaming Filmbox.');
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memproses streaming.');
      } finally {
        setLoading(false);
      }
    }

    loadStream();
  }, [epId, directUrl, provider, searchParams]);

  return (
    <div className="space-y-6">
      <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl aspect-video relative flex items-center justify-center">
        {loading ? (
          <div className="text-purple-400 font-medium text-sm animate-pulse">Memuat pemutar video...</div>
        ) : error ? (
          <div className="text-red-400 text-sm p-4 text-center">{error}</div>
        ) : streamUrl ? (
          <video src={streamUrl} controls autoPlay className="w-full h-full object-contain">
            Browser Anda tidak mendukung pemutar video.
          </video>
        ) : (
          <div className="text-gray-400 text-sm">Tautan video tidak tersedia.</div>
        )}
      </div>

      <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-2">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-xs text-gray-400">
          Provider: <span className="uppercase font-semibold text-purple-400">{provider}</span>
        </p>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}
