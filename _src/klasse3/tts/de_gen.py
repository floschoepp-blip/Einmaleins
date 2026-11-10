import sys, json, re, os, wave, subprocess, difflib
import numpy as np
import de
W=int(sys.argv[1]); NW=int(sys.argv[2])
import asr_de
S=json.load(open('de_strings.json'))
def h(t):
    x=5381; b=t.encode('utf-16-le')
    for i in range(0,len(b),2): x=((x<<5)+x+(b[i]|(b[i+1]<<8)))&0xFFFFFFFF
    return '%08x'%x
def raw(text,ls):
    t=de.norm(text); ids=[]
    for ch in t:
        if ch in de.tok: ids.append(de.tok[ch])
        elif ch.lower() in de.tok: ids.append(de.tok[ch.lower()])
    if not ids: return np.zeros(0)
    x=[3]
    for i in ids: x+=[i,3]
    a=de.sess.run(None,{'input':np.array([x],dtype=np.int64),'input_lengths':np.array([len(x)],dtype=np.int64),'scales':np.array([0.5,ls,0.7],dtype=np.float32),'sid':np.array([0],dtype=np.int64),'langid':np.array([0],dtype=np.int64)})[0].reshape(-1).astype(np.float64)
    n=len(a)//220
    if n<3: return np.zeros(0)
    e=np.sqrt(np.mean(a[:n*220].reshape(-1,220)**2,axis=1)); idx=np.where(e>e.max()*0.02)[0]
    a=a[max(0,idx[0]-5)*220:min(n,idx[-1]+12)*220]; f=min(len(a),1500); a[-f:]*=np.linspace(1,0,f); a[:220]*=np.linspace(0,1,220)
    return a/max(1e-6,np.abs(a).max())*0.89
def full(text,ls=1.08):
    parts=[p.strip() for p in re.split(r'(?<=[.!?:])\s+|\n+',text) if p.strip()]
    out=[np.zeros(1100)]
    for p in parts:
        if not re.search(r'[A-Za-zÄÖÜäöüß0-9]',p): continue
        a=raw(p,ls)
        if len(a): out+= [a,np.zeros(5500)]
    return np.concatenate(out)
def write(a,path):
    with wave.open('d.%d.wav'%W,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','d.%d.wav'%W,'-ar','22050','-ac','1','-b:a','32k',path],check=True)
def score(text,carrier=''):
    hyp=asr_de.norm(asr_de.transcribe('d.%d.wav'%W)); ref=asr_de.norm(de.norm(text)); 
    return difflib.SequenceMatcher(None,ref.replace(' ',''),hyp.replace(' ','')).ratio(), hyp
os.makedirs('mp3de',exist_ok=True)
jobs=[('w','§'+w,'Schreibe das Wort '+w+'.') for w in S['words']]+[('t',t,t) for t in S['texts']]+[('h',t,t) for t in S['htmls']]+[('c',t,t) for t in S['cards']]
log=open('de_gen.%d.log'%W,'w')
for i,(kind,key,text) in enumerate(jobs):
    if i%NW!=W: continue
    path='mp3de/'+h(key)+'.mp3'
    if os.path.exists(path): continue
    if kind!='w':
        write(full(text),path); log.write(json.dumps([kind,key,None,''],ensure_ascii=False)+'\n'); log.flush(); continue
    best=None
    for tr in range(4 if kind in 'wt' else 2):
        a=full(text, 1.08 if tr<2 else 1.16)
        with wave.open('d.%d.wav'%W,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
        sc,hyp=score(text)
        if best is None or sc>best[0]: best=(sc,hyp,a)
        if sc>=0.9: break
    write(best[2],path); log.write(json.dumps([kind,key,round(best[0],2),best[1]],ensure_ascii=False)+'\n'); log.flush()
log.write('DONE\n'); log.close()
