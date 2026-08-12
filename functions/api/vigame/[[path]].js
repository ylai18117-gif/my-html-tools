export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return onRequestOptions();
  if (request.method !== 'POST' && request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const apiKey = env.VIGAME_KEY || request.headers.get('x-client-api-key') || 'sk-36iRD3QO8zdHde4aK5EwvVhXgvJn20LTw39anidiDtXXLtKo';
  if (!apiKey) return json({ error: 'VIGAME_KEY is not configured' }, 500);

  const parts = Array.isArray(params.path) ? params.path : String(params.path || '').split('/').filter(Boolean);
  const version = parts.shift() || 'v1';
  if (!parts.length) return json({ error: 'Missing VIGAME path' }, 400);

  const upstreamUrl = `https://dn-api-ai.vigame.cn/${version}/${parts.join('/')}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Authorization', `Bearer ${apiKey}`);

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? request.body : undefined,
    });
  } catch (err) {
    return json({ error: 'Upstream request failed', detail: err.message || String(err) }, 502);
  }

  const resHeaders = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(corsHeaders())) resHeaders.set(k, v);
  resHeaders.set('Cache-Control', 'no-store');
  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,x-client-api-key',
  };
}
