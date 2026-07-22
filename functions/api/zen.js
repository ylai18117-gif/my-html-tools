export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet() {
  return json({ ok: true, service: 'zen-opencode-proxy' });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Use configured environment key or hardcoded fallback key
  const apiKey = env.ZEN_API_KEY || 'sk-lEXaCfXGjqIlHH7eY31Og3pLfr7y6KduiLY6MshY7PygUWEEdWzV9FkGRr0m1WZX';

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'Content-Type must be application/json' }, 415);
  }

  const raw = await request.text();
  if (!raw || raw.length > 2_500_000) {
    return json({ error: 'Invalid request body size' }, 413);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (_) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Ensure default model is mimo-v2.5-free if not specified
  if (!payload.model) {
    payload.model = 'mimo-v2.5-free';
  }

  try {
    const upstream = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
  } catch (err) {
    return json({ error: 'Upstream OpenCode Zen API request failed', detail: err.message || String(err) }, 502);
  }
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
