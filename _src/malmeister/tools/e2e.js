// End-to-End-Test im emulierten iPhone (Chrome/Playwright). Aufruf: NODE_PATH=$(npm root -g) node tools/e2e.js <foto.jpg> <ausgabeordner>
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), photo = process.argv[2], outDir = process.argv[3] || '/tmp/e2e';
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(8099);
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'allow' });
  const p = await ctx.newPage(); const problems = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) problems.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  await p.goto('http://localhost:8099/'); await p.waitForSelector('#h-home');
  await p.screenshot({ path: outDir + '/01-home.png' });
  await p.check(`input[value="${process.env.LEVEL || 'profi'}"]`, { force: true });
  await p.setInputFiles('#in-pick', photo);   // simuliert: Foto aus Galerie
  await p.waitForSelector('#s-crop:not([hidden])'); await p.waitForTimeout(400); await p.screenshot({ path: outDir + '/01b-crop.png' });
  await p.fill('#crop-zoom', '2'); await p.dispatchEvent('#crop-zoom', 'input'); await p.waitForTimeout(200); await p.screenshot({ path: outDir + '/01c-crop-zoom.png' });
  await p.click('#btn-crop-ok');
  await p.waitForSelector('#s-guide:not([hidden])', { timeout: 30000 });
  const steps = { leicht: 4, mittel: 5, profi: 6 }[process.env.LEVEL || 'profi'];
  for (let i = 0; i < steps; i++) {
    await p.waitForTimeout(250);
    await p.screenshot({ path: `${outDir}/02-step${i}.png`, fullPage: true });
    if (i === 1) {                              // Feld-Lupe testen
      await p.click('#stage', { position: { x: 200, y: 160 } }); await p.waitForSelector('#dlg-cell[open]');
      await p.waitForTimeout(200); await p.screenshot({ path: outDir + '/03-lupe.png' });
      await p.click('#cell-next'); await p.click('#dlg-cell [data-close]');
    }
    if (i < steps - 1) await p.click('#btn-next');
  }
  // Ergebnis fotografieren (simuliert mit dem Testfoto) und speichern
  p.once('dialog', d => d.dismiss());
  await p.evaluate(() => { document.getElementById('btn-next').click(); });
  await p.setInputFiles('#in-cam', photo);
  await p.waitForSelector('#s-result:not([hidden])', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.screenshot({ path: outDir + '/04-result.png', fullPage: true });
  await p.click('#btn-save-app'); await p.waitForFunction(() => document.getElementById('btn-save-app').disabled);
  await p.screenshot({ path: outDir + '/05-saved.png', fullPage: true });
  await p.click('#btn-new'); await p.click('#btn-gallery'); await p.waitForSelector('.tile'); await p.waitForTimeout(500);
  await p.screenshot({ path: outDir + '/06-gallery.png' });
  await p.click('.tile'); await p.waitForSelector('#dlg-view[open]'); await p.waitForTimeout(200);
  await p.screenshot({ path: outDir + '/07-view.png' });
  // Offline-Fähigkeit: Service Worker aktiv?
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { active: !!r.active, caches: await caches.keys() }; });
  console.log('Service Worker:', JSON.stringify(sw));
  const man = await p.evaluate(() => fetch('manifest.webmanifest').then(r => r.json()).then(j => j.name));
  console.log('Manifest:', man);
  console.log('Konsole/Fehler:', problems.length ? problems.join('\n') : 'keine');
  await b.close(); srv.close();
})().catch(e => { console.error('TESTFEHLER', e); process.exit(1); });
