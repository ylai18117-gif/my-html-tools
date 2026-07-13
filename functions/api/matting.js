export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const token = env.HF_TOKEN;
  if (!token) return json({ error: 'HF_TOKEN is not configured' }, 500);

  const contentType = request.headers.get('content-type') || '';
  let imageBytes;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) return json({ error: 'No image file provided' }, 400);
    imageBytes = await file.arrayBuffer();
  } else if (contentType.includes('application/json')) {
    const body = await request.json();
    if (!body.image) return json({ error: 'No image data provided' }, 400);
    imageBytes = base64ToArrayBuffer(body.image);
  } else {
    imageBytes = await request.arrayBuffer();
    if (!imageBytes || imageBytes.byteLength === 0) return json({ error: 'No image data' }, 400);
  }

  if (imageBytes.byteLength > 10 * 1024 * 1024) return json({ error: 'Image too large (max 10MB)' }, 413);

  let response;
  try {
    response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType.includes('multipart') ? contentType : 'application/octet-stream',
      },
      body: imageBytes,
    });
  } catch (err) {
    return json({ error: 'Upstream request failed', detail: err.message || String(err) }, 502);
  }

  if (response.status === 503) {
    return json({ error: 'Model is loading, please retry in a few seconds' }, 503);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    return json({ error: `Hugging Face API error (${response.status})`, detail: errBody.slice(0, 500) }, 502);
  }

  const resultBytes = await response.arrayBuffer();
  if (!resultBytes || resultBytes.byteLength < 100) {
    return json({ error: 'Model returned empty result. The model may still be loading, please retry.' }, 502);
  }

  return new Response(resultBytes, {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
}

function base64ToArrayBuffer(base64) {
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
