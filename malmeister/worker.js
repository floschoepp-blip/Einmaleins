/* Malmeister – Web Worker: rechnet die Bildanalyse, ohne die Oberfläche zu blockieren */
'use strict';
importScripts('imaging.js');

self.onmessage = function (e) {
  var d = e.data;
  try {
    var m = self.MS.analyze(new Uint8ClampedArray(d.buf), d.w, d.h, d.level, d.opts);
    var transfer = [m.rgb.buffer];
    m.layers.forEach(function (l) { transfer.push(l.buffer); });
    if (m.tones) transfer.push(m.tones.buffer);
    self.postMessage({ ok: true, model: m }, transfer);
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message || err) });
  }
};
