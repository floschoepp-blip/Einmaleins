// Node-Test: Analyse + Darstellung; schreibt PPM-Dateien (zur Sichtprüfung) und prüft Grunddaten
const fs=require('fs'); require('../imaging.js');
const [,, rawFile, w, h, level, outDir] = process.argv;
const buf=fs.readFileSync(rawFile); const W=+w,H=+h;
const t0=Date.now(); const m=MS.analyze(new Uint8ClampedArray(buf),W,H,level); const t1=Date.now();
console.log(level,'analyse ms',t1-t0,'size',m.w,m.h,'grid',m.cols+'x'+m.rows,'cm',m.cellCm);
m.layers.forEach((l,i)=>{let c=0;for(const v of l)c+=v;console.log(' layer',i,'pixels',c,(100*c/(m.w*m.h)).toFixed(2)+'%')});
const specs={photo:{mode:'photo',grid:true},l1:{mode:'lines',upto:1,grid:true},l2:{mode:'lines',upto:2,grid:true},l3:{mode:'lines',upto:3,grid:true},shade:{mode:'shade',grid:true},final:{mode:'final'}};
fs.mkdirSync(outDir,{recursive:true});
for(const [k,s] of Object.entries(specs)){
  if(s.upto>m.layers.length||(k==='shade'&&!m.tones)) continue;
  const t=Date.now(); const r=MS.renderStep(m,s,2);
  const rgb=Buffer.alloc(r.w*r.h*3); for(let i=0;i<r.w*r.h;i++){rgb[i*3]=r.data[i*4];rgb[i*3+1]=r.data[i*4+1];rgb[i*3+2]=r.data[i*4+2];}
  fs.writeFileSync(`${outDir}/${k}.ppm`,Buffer.concat([Buffer.from(`P6\n${r.w} ${r.h}\n255\n`),rgb]));
  console.log(' render',k,r.w+'x'+r.h,'ms',Date.now()-t);
}
