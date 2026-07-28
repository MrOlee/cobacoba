// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const url = searchParams.get('url');
  const provider = searchParams.get('provider');
  const type = searchParams.get('type') || 'stream';

  const dramaId = searchParams.get('dramaId');
  const source = searchParams.get('source') || 'wefeed';

  if (!url || !provider) {
    return new NextResponse("Missing required parameters (url/provider)", { status: 400 });
  }

  const allowedProviders = ['filmbox', 'dramovnime', 'animekompi'];
  if (!allowedProviders.includes(provider)) {
    return new NextResponse("Provider Not Allowed", { status: 403 });
  }

  let origin = '';
  let referer = '';

  if (type === 'sub') {
    if (provider === 'filmbox') {
      origin = 'https://netfilm.world';
      referer = 'https://netfilm.world/';
    } else {
      try {
        const parsedUrl = new URL(url);
        origin = parsedUrl.origin;
        referer = parsedUrl.origin + '/';
      } catch (e) {
        origin = 'https://bcdn2.hakunaymatata.com';
        referer = 'https://bcdn2.hakunaymatata.com/';
      }
    }
  } else {
    if (source === 'filmbox' || provider === 'filmbox') {
      const subjectId = searchParams.get('episodeId')?.split('-')[0] || '';
      origin = 'https://netfilm.world';
      referer = `https://netfilm.world/spa/videoPlayPage/movies/${dramaId}?id=${subjectId}&type=/movie/detail&lang=id`;
    } else {
      try {
        const parsedUrl = new URL(url);
        origin = parsedUrl.origin;
        referer = parsedUrl.origin + '/';
      } catch (e) {
        origin = '';
        referer = '';
      }
    }
  }

  const headers = new Headers();
  if (origin) headers.set('Origin', origin);
  if (referer) headers.set('Referer', referer);
  headers.set('User-Agent', req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36');

  try {
    if (type === 'sub') {
      const upstreamRes = await fetch(url, { headers });
      if (!upstreamRes.ok) return new NextResponse("Failed to fetch subtitle", { status: upstreamRes.status });

      let body = await upstreamRes.text();
      body = body.replace(/^\uFEFF/, '').replace(/STYLE\s*[\s\S]*?::cue\([^)]*\)\s*\{[^}]*\}/g, '');

      if (!body.trim().startsWith('WEBVTT')) {
        body = body.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
        const lines = body.split(/\r?\n/);
        const outLines = lines.filter(line => !/^\d+$/.test(line.trim()));
        body = "WEBVTT\n\n" + outLines.join('\n').trim();
      }

      return new NextResponse(body, {
        headers: {
          'Content-Type': 'text/vtt; charset=UTF-8',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      headers.set('Connection', 'keep-alive');
      const range = req.headers.get('range');
      if (range) headers.set('Range', range);

      const upstreamResponse = await fetch(url, { method: 'GET', headers });
      if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
        return new NextResponse(`Upstream error: ${upstreamResponse.statusText}`, { status: upstreamResponse.status });
      }

      const responseHeaders = new Headers();
      ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach(key => {
        const val = upstreamResponse.headers.get(key);
        if (val) responseHeaders.set(key, val);
      });

      responseHeaders.set('access-control-allow-origin', '*');
      responseHeaders.set('access-control-expose-headers', 'Content-Length, Content-Range');
      responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate');

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    }
  } catch (error: any) {
    return new NextResponse(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
