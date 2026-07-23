export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet() {
  return json({ ok: true, service: 'sensenova-proxy' });
}

export async function onRequestPost(context) {
  const { request, params, env } = context;

  const apiKey = env.SENSENOVA_API_KEY || request.headers.get('x-client-api-key') || '';
  if (!apiKey) {
    return json({ error: 'Missing x-client-api-key header' }, 400);
  }

  const parts = Array.isArray(params.path) ? params.path : String(params.path || '').split('/').filter(Boolean);
  if (!parts.length) {
    return json({ error: 'Missing SenseNova path' }, 400);
  }

  const upstreamUrl = `https://token.sensenova.cn/${parts.join('/')}`;
  const contentType = request.headers.get('content-type') || 'application/json';
  const bodyText = await request.text();

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: bodyText,
    });
  } catch (err) {
    return json({ error: 'Upstream request failed', detail: err.message || String(err) }, 502);
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      ...corsHeaders(),
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
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
