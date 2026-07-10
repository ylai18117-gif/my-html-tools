export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet() {
  return json({ ok: true, service: 'stepfun-proxy' });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STEPFUN_API_KEY) {
    return json({ error: 'STEPFUN_API_KEY is not configured' }, 500);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'Content-Type must be application/json' }, 415);
  }

  const raw = await request.text();
  if (!raw || raw.length > 1_500_000) {
    return json({ error: 'Invalid request body size' }, 413);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (_) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isAllowedPayload(payload)) {
    return json({ error: 'Invalid StepFun payload' }, 400);
  }

  const upstream = await fetch('https://api.stepfun.com/step_plan/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.STEPFUN_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

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

function isAllowedPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.model !== 'step-3.7-flash') return false;
  if (!Array.isArray(payload.messages) || payload.messages.length < 1 || payload.messages.length > 4) return false;
  if (payload.max_tokens && payload.max_tokens > 8000) return false;
  return true;
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
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
