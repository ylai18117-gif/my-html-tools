export async function onRequest(context) {
  const { request, params } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-client-api-key',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const apiKey = request.headers.get('x-client-api-key') || '';
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing x-client-api-key header' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const pathStr = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  const url = `https://token-plan.cn-beijing.maas.aliyuncs.com/${pathStr}`;

  const contentType = request.headers.get('content-type') || 'application/json';
  const bodyText = request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined;

  try {
    const resp = await fetch(url, {
      method: request.method,
      headers: {
        'Content-Type': contentType,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: bodyText,
    });

    const responseText = await resp.text();
    return new Response(responseText, {
      status: resp.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': resp.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Qwen Proxy error', detail: err.message || String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
