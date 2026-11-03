import { defineConfig } from 'vite';

// Génère sw.js avec la liste exacte des fichiers du build (hors-ligne complet).
function serviceWorker() {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const fichiers = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const statiques = ['./', 'index.html', 'manifest.webmanifest', 'icones/icone.svg', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/icone-maskable-512.png'];
      const liste = [...new Set([...statiques, ...fichiers])];
      const version = Date.now().toString(36);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE = 'scythe-automa-${version}';
const FICHIERS = ${JSON.stringify(liste)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('index.html', { ignoreVary: true })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreVary: true }).then((r) => r || fetch(e.request)));
});
`,
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
  build: { target: 'es2020' },
  test: { include: ['tests/unit/**/*.test.js'] },
});
