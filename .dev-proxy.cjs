// Local dev proxy: /api/dmxapi/ + /api/agnes/ + /api/sensenova/ + /api/qwen/
const http=require('http');
const fs=require('fs');
const path=require('path');

const XOR_KEY='aR7mK2';
function decryptXor(b64,key){const b=Buffer.from(b64,'base64');let r='';for(let i=0;i<b.length;i++)r+=String.fromCharCode(b[i]^key.charCodeAt(i%key.length));return r}

const ENC_DMX='EjkaXQBcUBZlKi4HKhteDwB5WTlZFRh6DCADXQpfNAFfDxJHExdPKgdGNR10XTFKDQFQ';
const ENC_AGNES='EjkaKnJ7FDFVABx/Dz5bGAp7EgNVOCprOxl6G3xXKhtPPB5dJzNBNQhIWTlSLyp/BApU';
const ENC_SENSENOVA='EjkaVQ8HKwVlVSlaEhhlFAVGCmFnIX5kJjBmFApgNSRZXgQ=';
const ENC_QWEN='EjkaHjsfKXxyPQ9rJXxOXS8LTx9yNAh7MBEPICpzVyBCBzNZNDdED31tF2dGKhsDNBt7CDtENTFdKD5QCDtTAQhkKiJAJCNzLSJaB3t4BBMPHRtZVjFEOhFzJBsaGQADKjVYKHpECBcFLBJtEGpyLxpTBw==';

const KEYS={
  dmx:decryptXor(ENC_DMX,XOR_KEY),
  agnes:decryptXor(ENC_AGNES,XOR_KEY),
  sensenova:decryptXor(ENC_SENSENOVA,XOR_KEY),
  qwen:decryptXor(ENC_QWEN,XOR_KEY)
};

// Route config: prefix -> {upstream base, auth style}
const ROUTES={
  '/api/dmxapi/v1beta/':{base:'https://www.dmxapi.com/v1beta/',auth:'x-goog-api-key',key:'dmx'},
  '/api/dmxapi/v1/':{base:'https://www.dmxapi.com/v1/',auth:'bearer',key:'dmx'},
  '/api/agnes/':{base:'https://apihub.agnes-ai.com/',auth:'bearer',key:'agnes'},
  '/api/sensenova/':{base:'https://token.sensenova.cn/',auth:'bearer',key:'sensenova'},
  '/api/qwen/':{base:'https://token-plan.cn-beijing.maas.aliyuncs.com/',auth:'bearer',key:'qwen'},
  '/api/zen':{base:'https://opencode.ai/zen/v1/chat/completions',auth:'direct-key',key:'sk-lEXaCfXGjqIlHH7eY31Og3pLfr7y6KduiLY6MshY7PygUWEEdWzV9FkGRr0m1WZX'},
};

const MIME={'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
const ROOT=__dirname;

http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');

  // CORS preflight
  if(req.method==='OPTIONS'){
    res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,x-client-api-key'});
    res.end();return;
  }

  // Proxy routes
  for(const[prefix,cfg]of Object.entries(ROUTES)){
    if(url.pathname.startsWith(prefix)){
      const upstreamUrl=cfg.base+url.pathname.slice(prefix.length);
      const headers={'Content-Type':req.headers['content-type']||'application/json'};
      const key=cfg.auth==='direct-key'?cfg.key:KEYS[cfg.key];
      if(cfg.auth==='x-goog-api-key')headers['x-goog-api-key']=key;
      else headers['Authorization']=`Bearer ${key}`;
      try{
        const chunks=[];
        for await(const c of req)chunks.push(c);
        const body=Buffer.concat(chunks);
        const up=await fetch(upstreamUrl,{method:req.method,headers,body:body.length?body:undefined});
        const respHeaders={'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'};
        const ct=up.headers.get('content-type');if(ct)respHeaders['Content-Type']=ct;
        const buf=Buffer.from(await up.arrayBuffer());
        res.writeHead(up.status,respHeaders);
        res.end(buf);
        console.log(`[proxy] ${req.method} ${url.pathname} -> ${up.status} (${buf.length} bytes)`);
      }catch(e){
        console.error('[proxy] error:',e.message);
        res.writeHead(502);res.end(JSON.stringify({error:'proxy error',detail:e.message}));
      }
      return;
    }
  }

  // Static files
  let fp=path.join(ROOT,url.pathname==='/'?'aiimage/stable.html':url.pathname);
  if(!fs.existsSync(fp)||!fs.statSync(fp).isFile()){res.writeHead(404);res.end('not found');return}
  res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});
  fs.createReadStream(fp).pipe(res);
}).listen(8787,()=>console.log('Dev server on http://localhost:8787 (stable.html)'));
