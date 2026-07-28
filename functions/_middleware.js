const BLOCKED_PREFIXES = [
  '/riservato',
  '/investors',
  '/control-center',
  '/backup_paule'
];

const BLOCKED_PATHS = new Set([
  '/admin.html',
  '/privato.html',
  '/private-scenario.html'
]);

const PRIVATE_LINK_PATTERN = /<a\b[^>]*href=["'](?:\.\/|\/)?(?:privato\.html|private-scenario\.html|investors(?:\/|\/index\.html)?|riservato(?:\/[^"']*)?)["'][^>]*>[\s\S]*?<\/a>/gi;

function securityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return headers;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  const blocked = BLOCKED_PATHS.has(path) || BLOCKED_PREFIXES.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (blocked) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer'
      }
    });
  }

  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('text/html')) {
    const headers = securityHeaders(new Headers(response.headers));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const html = await response.text();
  const cleanedHtml = html.replace(PRIVATE_LINK_PATTERN, '');
  const headers = securityHeaders(new Headers(response.headers));
  headers.delete('content-length');

  return new Response(cleanedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
