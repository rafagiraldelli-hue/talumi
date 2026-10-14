/* Service worker do Contador de Contrações.
   Guarda o app inteiro no aparelho na primeira visita: depois disso ele
   abre sem internet. A cada visita busca uma versao nova em segundo plano,
   entao a atualizacao aparece na abertura seguinte. */
var CACHE = 'talumi-contracoes-v3';
var ARQUIVOS = ['./', './index.html', './icon-192.png', './apple-touch-icon.png', './manifest.json'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(nomes){
      /* apaga so as versoes antigas DESTE app: o outro app do site usa o mesmo endereco e tem o proprio cache */
      return Promise.all(nomes.map(function(n){ return (n.indexOf('talumi-contracoes-')===0 && n!==CACHE) ? caches.delete(n) : null; }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(guardado){
      var rede = fetch(e.request).then(function(resp){
        if(resp && resp.status === 200 && resp.type === 'basic'){
          var copia = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        }
        return resp;
      }).catch(function(){ return guardado; });
      return guardado || rede;
    })
  );
});
