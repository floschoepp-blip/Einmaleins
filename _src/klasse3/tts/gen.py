import re,json,os,subprocess,sys,wave
import numpy as np, onnxruntime as ort
M='kokoro-multi-lang-v1_0/'
tok={}
for l in open(M+'tokens.txt',encoding='utf8'):
    l=l.rstrip('\n')
    if not l: continue
    s,i=l.rsplit(' ',1); tok[s]=int(i)
lex={}
for l in open(M+'lexicon-gb-en.txt',encoding='utf8'):
    p=l.rstrip('\n').split(' '); lex.setdefault(p[0],p[1:])
lex['a']=['ə']; lex['an']=['ə','n']; lex["what's"]=['w','ˈ','ɒ','t','s']; lex['tv']=['t','ˌ','i','ː','v','ˈ','i','ː']
def slug(t): return re.sub(r'[^a-z0-9]+','-',t.lower().replace("'",'')).strip('-')
def tokens(text):
    out=[]; parts=re.findall(r"[A-Za-z'\-]+|[.,!?]",text)
    for p in parts:
        if p in '.,!?': out.append(tok[p]); continue
        w=p.lower()
        ph=lex.get(w)
        if ph is None:
            ph=[]
            for i,x in enumerate(w.split('-')):
                ph+=lex[x]
        if out and out[-1]!=tok[' ']: out.append(tok[' '])
        elif out: pass
        out+=[tok[x] for x in ph]
    return out
if __name__=='__main__':
    items=json.load(open('items.json'))
    for w in ['read','to','an','can','are','from','you','your','got','have','picture','toilet','tomorrow','t-shirt']: print(w,' '.join(lex.get(w,['??'])))
    sess=ort.InferenceSession(M+'model.onnx',providers=['CPUExecutionProvider'])
    voices=np.fromfile(M+'voices.bin',dtype=np.float32).reshape(54,510,256)
    sid=int(sys.argv[1]) if len(sys.argv)>1 else 21
    os.makedirs('wav',exist_ok=True); os.makedirs('mp3',exist_ok=True)
    man={}; lim=int(sys.argv[2]) if len(sys.argv)>2 else 10**9
    for it in items[:lim]:
        text=it if re.search(r'[.!?]$',it) else it+'.'
        ids=tokens(text); sl=slug(it); man[it]=sl
        if os.path.exists('mp3/'+sl+'.mp3'): continue
        a,dur=sess.run(None,{'tokens':np.array([[0]+ids+[0]],dtype=np.int64),'style':voices[sid][len(ids)][None,:],'speed':np.array([1.0],dtype=np.float32)})
        a=a.astype(np.float64)
        st=max(0,(int(dur[0])-3)*600); en=min(len(a),(int(dur[:-2].sum())+2)*600)
        a=a[st:en]; f=min(len(a),1920); a[-f:]*=np.linspace(1,0,f); a[:240]*=np.linspace(0,1,240)
        a=a/np.abs(a).max()*0.89
        a=np.concatenate([np.zeros(1200),a,np.zeros(2400)])
        pcm=(a*32767).astype(np.int16)
        with wave.open('wav/'+sl+'.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg','-loglevel','error','-y','-i','wav/'+sl+'.wav','-ar','24000','-ac','1','-b:a','48k','mp3/'+sl+'.mp3'],check=True)
    json.dump(man,open('manifest.json','w'),ensure_ascii=False)
    print(len(man),'done')
