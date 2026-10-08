const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {create}=require('./runtime.cjs');
async function serve(){const app=await create();const port=Number(process.env.PORT||8765);let serial=Promise.resolve();const server=http.createServer(async(req,res)=>{function reply(status,data,mime='application/json'){const body=mime==='application/json'?Buffer.from(JSON.stringify(data)):data;res.writeHead(status,{'Content-Type':mime,'Content-Length':body.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(body)}
if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return reply(403,{error:'Invalid host'});
if(req.method==='GET'&&req.url==='/')return reply(200,fs.readFileSync(path.join(__dirname,'index.html')),'text/html; charset=utf-8');
if(req.method==='GET'&&req.url==='/api/state'){try{return reply(200,await app.state())}catch{return reply(500,{error:'Local chain unavailable'})}}
if(req.method!=='POST'||!req.url.startsWith('/api/'))return reply(404,{error:'Not found'});
if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)return reply(403,{error:'Invalid origin'});
let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>10000){reply(413,{error:'Request too large'});req.destroy();return}chunks.push(chunk)}
let data;try{data=JSON.parse(Buffer.concat(chunks));if(!data||Array.isArray(data)||typeof data!=='object')throw Error()}catch{return reply(400,{error:'JSON object required'})}
const operation=serial.then(()=>app.action(req.url,data));serial=operation.catch(()=>{});try{reply(200,await operation)}catch(e){reply(400,{error:e.shortMessage||e.message||'Transaction rejected'})}});server.listen(port,'127.0.0.1',()=>console.log('Local EVM demo: http://127.0.0.1:'+port));const stop=()=>server.close(async()=>{await app.close();process.exit(0)});process.on('SIGINT',stop);process.on('SIGTERM',stop)}
serve().catch(e=>{console.error(e.message);process.exitCode=1});
