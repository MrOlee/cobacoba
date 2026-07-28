'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WatchPage() {
  const searchParams = useSearchParams();
  const streamUrl = searchParams.get('url');
  const provider = searchParams.get('provider') || 'filmbox';
  const title = searchParams.get('title') || 'Streaming Video';

  const [proxiedUrl, setProxiedUrl] = useState('');

  useEffect(() => {
    if (streamUrl) {
      // Mengarahkan URL video langsung melalui Proxy API
      const encoded = encodeURIComponent(streamUrl);
      setProxiedUrl(`/api/proxy?url=${encoded}&provider=${provider}&type=stream`);
    }
  }, [streamUrl, provider]);

  return (
    <div className="space-y-6">
      <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl aspect-video relative flex items-center justify-center">
        {proxiedUrl ? (
          <video
            src={proxiedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Browser Anda tidak mendukung pemutar video HTML5.
          </video>
        ) : (
          <div className="text-gray-400 text-sm">Menyiapkan aliran video...</div>
        )}
      </div>

      <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-2">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-xs text-gray-400">Provider: <span className="uppercase font-semibold text-purple-400">{provider}</span></p>
      </div>
    </div>
  );
}
