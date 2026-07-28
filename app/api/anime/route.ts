import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action') || 'home';
  const page = searchParams.get('page') || '1';
  const genre = searchParams.get('genre') || '';
  const path = searchParams.get('path') || '';
  const episode_id = searchParams.get('episode_id') || '';

  // Gunakan API key dari environment, dengan fallback
  const API_KEY = process.env.ANIME_API_KEY || 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

  let url = '';
  switch (action) {
    case 'home':
      url = `https://indocast.site/api/animekompi/home?page=${page}`;
      break;
    case 'schedule':
      url = 'https://indocast.site/api/animekompi/schedule';
      break;
    case 'genres':
      url = 'https://indocast.site/api/animekompi/genres';
      break;
    case 'genredetail':
      url = `https://indocast.site/api/animekompi/genre-detail?genre=${encodeURIComponent(genre)}&page=${page}`;
      break;
    case 'list':
      url = 'https://indocast.site/api/animekompi/list';
      break;
    case 'detail':
      url = `https://indocast.site/api/animekompi/detail?path=${encodeURIComponent(path)}`;
      break;
    case 'play':
      url = `https://indocast.site/api/animekompi/play?episode_id=${encodeURIComponent(episode_id)}`;
      break;
    default:
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const data = await res.json();
    
    // Kirim response dengan status sukses
    return NextResponse.json({ 
      success: true, 
      data: data,
      // Kirim juga info debug
      _debug: {
        url,
        apiKeyUsed: API_KEY ? 'present' : 'missing',
        status: res.status,
        ok: res.ok
      }
    });
  } catch (error: any) {
    console.error('Anime API Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
