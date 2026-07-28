'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [category, setCategory] = useState<'anime' | 'drama'>('anime');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogView, setCatalogView] = useState(true);
  const [playerData, setPlayerData] = useState<{ title: string; episodes: any[]; path: string; id: string } | null>(null);

  // ==================== EKSTRAKTOR ====================
  const extractTitle = (item: any) => {
    if (!item) return 'No Title';
    return item.title || item.name || item.caption || item.subjectName || 'No Title';
  };

  const extractPoster = (item: any) => {
    if (!item) return '';
    const candidates = ['cover_url', 'cover', 'poster', 'coverUrl', 'image', 'img', 'thumb'];
    for (const key of candidates) {
      const val = item[key];
      if (typeof val === 'string' && val.trim()) {
        let url = val.trim();
        if (url.startsWith('//')) return 'https:' + url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return 'https://indocast.site' + url;
        return url;
      }
    }
    return '';
  };

  const extractPath = (item: any) => {
    if (!item) return '';
    return item.path || item.slug || item.detailPath || item.detail_path || '';
  };

  const extractId = (item: any) => {
    if (!item) return '';
    return item.id || item.subjectId || item.subject_id || '';
  };

  // ==================== FETCH FUNCTIONS ====================
  const fetchAnime = async (action: string, params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ action, ...params });
      const res = await fetch(`/api/anime?${qs}`);
      const json = await res.json();
      console.log('[ANIME RESPONSE]', json);

      if (!json.success) {
        throw new Error(json.error || 'Gagal fetch anime');
      }

      let rawItems: any[] = [];
      const data = json.data;
      if (Array.isArray(data)) rawItems = data;
      else if (data?.data) rawItems = Array.isArray(data.data) ? data.data : [];
      else if (data?.list) rawItems = data.list || [];
      else if (data?.items) rawItems = data.items || [];
      else rawItems = [];

      setItems(rawItems);
    } catch (err: any) {
      console.error('[ANIME ERROR]', err);
      setError(err.message || 'Terjadi kesalahan');
      setItems([]);
    }
    setLoading(false);
  };

  const fetchDrama = async (action: string, params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ action, ...params });
      const res = await fetch(`/api/drama?${qs}`);
      const json = await res.json();
      console.log('[DRAMA RESPONSE]', json);

      if (!json.success) {
        throw new Error(json.error || 'Gagal fetch drama');
      }

      let rawItems: any[] = [];
      const data = json.data;
      if (Array.isArray(data)) rawItems = data;
      else if (data?.data) rawItems = Array.isArray(data.data) ? data.data : [];
      else if (data?.list) rawItems = data.list || [];
      else if (data?.items) rawItems = data.items || [];
      else rawItems = [];

      setItems(rawItems);
    } catch (err: any) {
      console.error('[DRAMA ERROR]', err);
      setError(err.message || 'Terjadi kesalahan');
      setItems([]);
    }
    setLoading(false);
  };

  // ==================== EFFECT ====================
  useEffect(() => {
    if (category === 'anime') {
      fetchAnime('home', { page: '1' });
    } else {
      fetchDrama('home');
    }
  }, [category]);

  // ==================== NAVIGASI ====================
  const switchCategory = (cat: 'anime' | 'drama') => {
    setCategory(cat);
    setCatalogView(true);
    setPlayerData(null);
  };

  // ==================== CARD CLICK ====================
  const handleCardClick = (item: any) => {
    const title = extractTitle(item);
    const path = extractPath(item);
    const id = extractId(item);

    if (category === 'anime') {
      if (path) openAnimeDetail(path, title);
      else alert('Path tidak ditemukan untuk anime ini');
    } else {
      if (path && id) openDramaDetail(path, id, title);
      else if (path) openDramaDetail(path, path, title); // fallback id = path
      else alert('Data tidak lengkap untuk drama ini');
    }
  };

  // ==================== ANIME DETAIL ====================
  const openAnimeDetail = async (path: string, title: string) => {
    setCatalogView(false);
    setPlayerData({ title, episodes: [], path, id: '' });
    try {
      const res = await fetch(`/api/anime?action=detail&path=${encodeURIComponent(path)}`);
      const json = await res.json();
      console.log('[ANIME DETAIL]', json);
      if (json.success) {
        const data = json.data;
        let eps: any[] = [];
        if (data?.episode_list) eps = data.episode_list;
        else if (data?.episodes) eps = data.episodes;
        else if (Array.isArray(data)) eps = data;
        setPlayerData(prev => ({ ...prev!, episodes: eps }));
        if (eps.length > 0) {
          const firstId = eps[0]?.episode_id || eps[0]?.id || eps[0]?.path || '';
          if (firstId) playAnime(firstId);
        }
      }
    } catch (e) { console.error(e); }
  };

  const playAnime = async (epId: string) => {
    const iframe = document.getElementById('playerIframe') as HTMLIFrameElement | null;
    if (!iframe) return;
    iframe.src = 'about:blank';
    try {
      const res = await fetch(`/api/anime?action=play&episode_id=${encodeURIComponent(epId)}`);
      const json = await res.json();
      console.log('[ANIME PLAY]', json);
      if (json.success) {
        const stream = findStreamUrl(json.data);
        if (stream) iframe.src = stream;
        else alert('Link stream tidak ditemukan');
      }
    } catch (e) { console.error(e); }
  };

  // ==================== DRAMA DETAIL ====================
  const openDramaDetail = async (path: string, id: string, title: string) => {
    setCatalogView(false);
    setPlayerData({ title, episodes: [], path, id });
    try {
      const res = await fetch(`/api/drama?action=details&detailPath=${encodeURIComponent(path)}&id=${id}`);
      const json = await res.json();
      console.log('[DRAMA DETAIL]', json);
      if (json.success) {
        const data = json.data;
        let eps: any[] = [];
        if (data?.episodes) eps = data.episodes;
        else if (data?.chapterList) eps = data.chapterList;
        else if (data?.resourceList) eps = data.resourceList;
        else if (Array.isArray(data)) eps = data;
        setPlayerData(prev => ({ ...prev!, episodes: eps }));
        if (eps.length > 0) {
          playDrama(path, id, 0);
        } else {
          playDrama(path, id, 0); // coba langsung
        }
      }
    } catch (e) { console.error(e); }
  };

  const playDrama = async (path: string, id: string, epIndex: number) => {
    const iframe = document.getElementById('playerIframe') as HTMLIFrameElement | null;
    if (!iframe) return;
    iframe.src = 'about:blank';
    try {
      const res = await fetch(`/api/drama?action=getplay&detailPath=${encodeURIComponent(path)}&id=${id}&se=0&ep=${epIndex}`);
      const json = await res.json();
      console.log('[DRAMA PLAY]', json);
      if (json.success) {
        const stream = findStreamUrl(json.data);
        if (stream) {
          iframe.src = stream;
          return;
        }
      }
      // fallback ep=1
      if (epIndex === 0) {
        const res2 = await fetch(`/api/drama?action=getplay&detailPath=${encodeURIComponent(path)}&id=${id}&se=0&ep=1`);
        const json2 = await res2.json();
        if (json2.success) {
          const stream2 = findStreamUrl(json2.data);
          if (stream2) iframe.src = stream2;
        }
      }
      if (!iframe.src || iframe.src === 'about:blank') {
        alert('Link stream tidak ditemukan');
      }
    } catch (e) { console.error(e); }
  };

  // ==================== STREAM FINDER ====================
  const findStreamUrl = (obj: any): string | null => {
    if (!obj) return null;
    if (typeof obj === 'string') {
      if (obj.startsWith('http') || obj.startsWith('//')) {
        if (obj.includes('.m3u8') || obj.includes('.mp4') || obj.includes('stream') || obj.includes('play')) {
          return obj.startsWith('//') ? 'https:' + obj : obj;
        }
      }
      return null;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const r = findStreamUrl(item);
        if (r) return r;
      }
      return null;
    }
    if (typeof obj === 'object') {
      const priority = ['playUrl', 'url', 'mediaUrl', 'play_url', 'videoUrl', 'stream', 'hls', 'm3u8', 'link', 'embedUrl', 'embed'];
      for (const key of priority) {
        if (obj[key] !== undefined && obj[key] !== null) {
          const r = findStreamUrl(obj[key]);
          if (r) return r;
        }
      }
      for (const key of Object.keys(obj)) {
        const r = findStreamUrl(obj[key]);
        if (r) return r;
      }
    }
    return null;
  };

  // ==================== RENDER ====================
  const renderItems = () => {
    if (loading) {
      return <div className="status">⏳ Memuat...</div>;
    }
    if (error) {
      return <div className="status error">❌ {error}<br /><button onClick={() => category === 'anime' ? fetchAnime('home', { page: '1' }) : fetchDrama('home')} style={{ marginTop: 12, padding: '8px 20px', background: '#00d4ff', color: '#0a0e14', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Coba Lagi</button></div>;
    }
    if (!items || items.length === 0) {
      return <div className="status">Tidak ada data ditemukan</div>;
    }

    return items.map((item, idx) => {
      const title = extractTitle(item);
      const poster = extractPoster(item);
      return (
        <div key={idx} className="card" onClick={() => handleCardClick(item)}>
          {poster ? (
            <img className="poster" src={poster} alt={title} loading="lazy" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x400/1a212c/00d4ff?text=No+Cover')} />
          ) : (
            <div className="poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a212c', color: '#6b7a8f', fontSize: 12, padding: 20 }}>No Cover</div>
          )}
          <div className="title">{title}</div>
        </div>
      );
    });
  };

  // ==================== UI ====================
  return (
    <div style={{ background: '#0a0e14', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: '#141a24', padding: 20, textAlign: 'center', borderBottom: '3px solid #00d4ff' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>RAYLIZIIE<span style={{ color: '#00d4ff' }}>DESU</span></div>
        <div style={{ fontSize: 11, color: '#00d4ff', marginTop: 4, letterSpacing: 2 }}>ANIME & DRAMA SUBTITLE INDONESIA</div>
      </header>

      <div style={{ display: 'flex', background: '#141a24', borderBottom: '1px solid #2a2f3a' }}>
        <button onClick={() => switchCategory('anime')} style={{ flex: 1, padding: 12, background: category === 'anime' ? '#00d4ff' : 'transparent', color: category === 'anime' ? '#0a0e14' : '#6b7a8f', border: 'none', fontWeight: 700, cursor: 'pointer' }}>🎌 ANIME</button>
        <button onClick={() => switchCategory('drama')} style={{ flex: 1, padding: 12, background: category === 'drama' ? '#00d4ff' : 'transparent', color: category === 'drama' ? '#0a0e14' : '#6b7a8f', border: 'none', fontWeight: 700, cursor: 'pointer' }}>🎬 DRAMA</button>
      </div>

      <div style={{ padding: '12px 20px', background: '#141a24' }}>
        <input
          id="searchInput"
          placeholder="🔍 Cari judul..."
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const q = (e.target as HTMLInputElement).value.trim();
              if (q.length < 2) return alert('Minimal 2 karakter');
              setLoading(true);
              setError(null);
              setCatalogView(true);
              let allResults: any[] = [];
              // Search di anime (filter lokal)
              try {
                const res = await fetch(`/api/anime?action=home&page=1`);
                const json = await res.json();
                if (json.success) {
                  let data = json.data;
                  let raw: any[] = [];
                  if (Array.isArray(data)) raw = data;
                  else if (data?.data) raw = Array.isArray(data.data) ? data.data : [];
                  else if (data?.list) raw = data.list || [];
                  else if (data?.items) raw = data.items || [];
                  const filtered = raw.filter(item => extractTitle(item).toLowerCase().includes(q.toLowerCase()));
                  allResults = allResults.concat(filtered);
                }
              } catch (e) {}
              // Search di drama (pakai endpoint)
              try {
                const res = await fetch(`/api/drama?action=search&keyword=${encodeURIComponent(q)}&page=1&perPage=20`);
                const json = await res.json();
                if (json.success) {
                  let data = json.data;
                  let raw: any[] = [];
                  if (Array.isArray(data)) raw = data;
                  else if (data?.data) raw = Array.isArray(data.data) ? data.data : [];
                  else if (data?.list) raw = data.list || [];
                  else if (data?.items) raw = data.items || [];
                  allResults = allResults.concat(raw);
                }
              } catch (e) {}
              setItems(allResults);
              setLoading(false);
              if (allResults.length === 0) alert('Tidak ditemukan hasil untuk "' + q + '"');
            }
          }}
          style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto', padding: '12px 20px', borderRadius: 25, border: '2px solid #2a2f3a', background: '#1a212c', color: '#e2e8f0', fontSize: 14, outline: 'none', textAlign: 'center' }}
        />
      </div>

      <div style={{ padding: '10px 20px', background: '#141a24', display: 'flex', gap: 8, overflowX: 'auto' }}></div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        {catalogView ? (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {renderItems()}
          </div>
        ) : (
          <div id="player">
            <button onClick={() => { setCatalogView(true); setPlayerData(null); }} style={{ padding: '8px 20px', background: '#1a212c', color: '#e2e8f0', border: '1px solid #2a2f3a', borderRadius: 6, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>← KEMBALI</button>
            <h2 style={{ fontSize: 24, color: '#00d4ff', marginBottom: 16 }}>{playerData?.title || 'Loading...'}</h2>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <iframe id="playerIframe" src="about:blank" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
            </div>
            <div id="episodeList">
              {playerData?.episodes && playerData.episodes.length > 0 && (
                <>
                  <h3 style={{ margin: '16px 0 10px', color: '#00d4ff' }}>📺 DAFTAR EPISODE</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                    {playerData.episodes.map((ep, i) => {
                      const epId = ep.episode_id || ep.id || ep.path || i;
                      const epTitle = ep.title || `Eps ${i+1}`;
                      return (
                        <button key={i} onClick={() => {
                          if (category === 'anime') playAnime(epId);
                          else playDrama(playerData.path, playerData.id, i);
                        }} style={{ padding: 10, background: '#1a212c', color: '#8b9bb5', border: '1px solid #2a2f3a', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{epTitle}</button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card { background: #141a24; border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid #1a212c; transition: transform .2s; }
        .card:hover { transform: translateY(-4px); border-color: #00d4ff; }
        .card .poster { width: 100%; aspect-ratio: 3/4; background: #1a212c; object-fit: cover; display: block; }
        .card .title { padding: 10px 12px; font-size: 13px; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
        .status { text-align: center; padding: 60px 20px; color: #6b7a8f; grid-column: 1 / -1; }
        .status.error { color: #ff6b6b; }
        .status button { background: #00d4ff; color: #0a0e14; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
}
