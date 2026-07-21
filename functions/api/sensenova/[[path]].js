// Proxy for SenseNova API — reads key from x-client-api-key header (page XOR-encrypted)
export async function onRequest(context) {
  const { request, params } = context;
  const path = (params.path || []).join('/');
  const apiKey = request.headers.get('x-client-api-key') || '';
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-client-api-key', 'Access-Control-Max-Age': '86400' }
    });
  }
  
  const url = `https://token.sensenova.cn/${path}`;
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  headers.delete('x-client-api-key');
  
  const resp = await fetch(url, { method: request.method, headers, body: request.body });
  const respHeaders = new Headers(resp.headers);
  respHeaders.set('Access-Control-Allow-Origin', '*');
  respHeaders.set('Cache-Control', 'no-store');
  
  return new Response(resp.body, { status: resp.status, headers: respHeaders });
}
