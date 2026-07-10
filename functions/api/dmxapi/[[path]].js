export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return onRequestOptions();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = env.DMXAPI_KEY || request.headers.get('x-client-api-key') || '';
  if (!apiKey) return json({ error: 'DMXAPI_KEY is not configured' }, 500);

  const parts = Array.isArray(params.path) ? params.path : String(params.path || '').split('/').filter(Boolean);
  const version = parts.shift();
  if (version !== 'v1' && version !== 'v1beta') return json({ error: 'Invalid DMXAPI version' }, 400);
  if (!parts.length) return json({ error: 'Missing DMXAPI path' }, 400);

  const upstreamUrl = `https://www.dmxapi.com/${version}/${parts.join('/')}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  if (version === 'v1beta') headers.set('x-goog-api-key', apiKey);
  else headers.set('Authorization', `Bearer ${apiKey}`);

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: request.body,
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
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,x-client-api-key',
  };
}
