// Rendert icons/icon.svg mit Chrome (Playwright) in alle PNG-Größen. Aufruf: node tools/make_icons.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../icons/icon.svg'), 'utf8');
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
  async function render(size, out, scale) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    const inner = scale && scale < 1 ? `<div style="position:absolute;inset:0;background:#6b78ff"></div><div style="position:absolute;left:${(1-scale)/2*100}%;top:${(1-scale)/2*100}%;width:${scale*100}%;height:${scale*100}%">${svg}</div>` : svg;
    await p.setContent(`<html><body style="margin:0;position:relative;width:${size}px;height:${size}px;overflow:hidden">${inner.replace('<svg ', '<svg width="100%" height="100%" ')}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, '../icons', out) });
    await p.close();
  }
  await render(192, 'icon-192.png');
  await render(512, 'icon-512.png');
  await render(512, 'icon-maskable-512.png', 0.8);
  await render(180, 'apple-touch-icon.png');
  await render(32, 'favicon-32.png');
  await b.close();
})();
