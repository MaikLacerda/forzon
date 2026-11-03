import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
const origin = 'https://forzon.test';
function setup({stored={},offline=false,quota=false}={}) {
  const handlers={},store=new Map(Object.entries(stored).map(([url,body])=>[new URL(url,origin).href,new Response(body)]));
  const requests=[],deleted=[];
  const key = request=>new URL(typeof request==='string'?request:request.url,origin).href;
  const caches = {
    match:async request=>store.get(key(request))?.clone(),
    open:async()=>({put:async(request,response)=>{if(quota)throw Error('Quota');store.set(key(request),response);}}),
    keys:async()=>['stryde-cache-v1','forzon-cache-v1','forzon-cache-v2','unrelated-cache'],
    delete:async name=>{deleted.push(name);return true;},
  };
  vm.runInNewContext(source,{URL,Response,console,caches,
    self:{location:{origin},addEventListener:(name,handler)=>{handlers[name]=handler;},clients:{claim:async()=>{}},skipWaiting:async()=>{}},
    fetch:async(request,options)=>{requests.push({request,options});if(offline)throw Error('Offline');return new Response('new-document');},
  });
  async function dispatch(path,{navigation=false,range}={}) {
    let result; const pending=[];
    const headers=new Headers(navigation?{accept:'text/html'}:{});
    if(range)headers.set('Range',range);
    handlers.fetch({request:{url:new URL(path,origin).href,method:'GET',mode:navigation?'navigate':'cors',headers},
      respondWith:promise=>{result=Promise.resolve(promise);},waitUntil:promise=>pending.push(promise)});
    const response=result?await result:undefined;
    await Promise.all(pending);
    return response;
  }
  return {dispatch,requests,handlers,deleted};
}
test('navigation fetches the new document instead of returning a stale cached index',async()=>{
  const context=setup({stored:{'/':'old-document'}});
  assert.equal(await (await context.dispatch('/',{navigation:true})).text(),'new-document');
  assert.equal(context.requests[0].options.cache,'no-cache');
});
test('offline navigation can fall back to index.html when the root is absent',async()=>{
  const context=setup({stored:{'/index.html':'offline-shell'},offline:true});
  assert.equal(await (await context.dispatch('/treinos',{navigation:true})).text(),'offline-shell');
});
test('video and Range requests are left to the browser network stack',async()=>{
  const context=setup();
  assert.equal(await context.dispatch('/assets/demo.mp4?v=1'),undefined);
  assert.equal(await context.dispatch('/assets/anything',{range:'bytes=0-31'}),undefined);
  assert.equal(context.requests.length,0);
});
test('offline static assets still use their exact cached URL',async()=>{
  const context=setup({stored:{'/assets/known.js':'cached-js'},offline:true});
  assert.equal(await (await context.dispatch('/assets/known.js')).text(),'cached-js');
});
test('cache quota failure does not break a successful online response',async()=>{
  const context=setup({quota:true});
  assert.equal(await (await context.dispatch('/assets/new.js')).text(),'new-document');
});
test('activation removes obsolete FORZON caches and preserves unrelated caches',async()=>{
  const context=setup();let pending;
  context.handlers.activate({waitUntil:promise=>{pending=promise;}});
  await pending;
  assert.deepEqual(context.deleted,['stryde-cache-v1','forzon-cache-v1','forzon-cache-v2']);
});

test('development modules and refresh clients bypass the cache',async()=>{
  const context=setup();
  for(const path of ['/src/App.tsx','/src/components/layout/Header.tsx','/node_modules/.vite/deps/react.js','/@react-refresh','/@vite/client']){
    assert.equal(await context.dispatch(path),undefined);
  }
  assert.equal(context.requests.length,0);
});
