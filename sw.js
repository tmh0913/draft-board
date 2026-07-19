const CACHE="draft-board-v1";
const ASSETS=["./","index.html","manifest.json","icon-192.png","icon-512.png","icon-maskable-512.png","icon-180.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const isNav=req.mode==="navigate"||(req.headers.get("accept")||"").includes("text/html");
  if(isNav){
    e.respondWith(
      fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put("index.html",copy));return res;})
        .catch(()=>caches.match(req).then(r=>r||caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r=>r||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;}))
  );
});
