import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action') || 'home';
  const page = searchParams.get('page') || '0';
  const perPage = searchParams.get('perPage') || '18';
  const keyword = searchParams.get('keyword') || '';
  const detailPath = searchParams.get('detailPath') || '';
  const id = searchParams.get('id') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const se = searchParams.get('se') || '0';
  const ep = searchParams.get('ep') || '0';

  const API_KEY = process.env.DRAMA_API_KEY || '849332c4d5ba58d0d5e9563380f5472de70c74bb598f2c5cbbb5f6c274063a51';

  let url = '';
  let method = 'GET';
  let body = null;

  switch (action) {
    case 'home':
      url = 'https://indocast.site/api/filmbox/home';
      break;
    case 'trending':
      url = `https://indocast.site/api/filmbox/trending?page=${page}&perPage=${perPage}`;
      break;
    case 'search':
      url = 'https://indocast.site/api/filmbox/search';
      method = 'POST';
      body = JSON.stringify({ keyword, page, perPage, subjectType: '2' });
      break;
    case 'details':
      url = `https://indocast.site/api/filmbox/details?detailPath=${encodeURIComponent(detailPath)}&id=${id}`;
      break;
    case 'getplay':
      const targetId = subjectId || id;
      url = `https://indocast.site/api/filmbox/getplay?subjectId=${targetId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}&lang=in_id`;
      break;
    default:
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  }

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    if (body) options.body = body;

    const res = await fetch(url, options);
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
