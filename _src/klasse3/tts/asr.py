import numpy as np, onnxruntime as ort, subprocess, base64, json, sys, re, os
import os
NAME=os.environ.get('WH','tiny.en'); W='sherpa-onnx-whisper-'+NAME+'/'
so=ort.SessionOptions(); so.intra_op_num_threads=1
enc=ort.InferenceSession(W+NAME+'-encoder.int8.onnx',so,providers=['CPUExecutionProvider'])
dec=ort.InferenceSession(W+NAME+'-decoder.int8.onnx',so,providers=['CPUExecutionProvider'])
MM=dec.get_inputs()[1].shape; NL,NS=MM[0],MM[3]
id2=[None]*51864
for l in open(W+NAME+'-tokens.txt'):
    a,b=l.split(); id2[int(b)]=base64.b64decode(a)
def hz2mel(f):
    f=np.asarray(f,dtype=np.float64); m=f/(200/3); ls=np.log(6.4)/27
    return np.where(f>=1000, 15+np.log(np.maximum(f,1e-9)/1000)/ls, m)
def mel2hz(m):
    m=np.asarray(m,dtype=np.float64); ls=np.log(6.4)/27
    return np.where(m>=15, 1000*np.exp(ls*(m-15)), m*200/3)
def melfb(sr=16000,n_fft=400,n_mels=80):
    fft=np.linspace(0,sr/2,n_fft//2+1); pts=mel2hz(np.linspace(hz2mel(0),hz2mel(sr/2),n_mels+2))
    fb=np.zeros((n_mels,len(fft)))
    for i in range(n_mels):
        lo,c,hi=pts[i],pts[i+1],pts[i+2]
        fb[i]=np.maximum(0,np.minimum((fft-lo)/(c-lo),(hi-fft)/(hi-c)))*2/(hi-lo)
    return fb
FB=melfb()
def logmel(x):
    x=np.concatenate([x,np.zeros(480000-len(x))])[:480000]
    x=np.pad(x,200,mode='reflect'); win=np.hanning(401)[:-1]
    n=1+(len(x)-400)//160
    idx=np.arange(400)[None,:]+160*np.arange(n)[:,None]
    S=np.abs(np.fft.rfft(x[idx]*win,axis=1))**2
    S=S[:-1].T
    m=np.log10(np.maximum(FB@S,1e-10)); m=np.maximum(m,m.max()-8); return ((m+4)/4).astype(np.float32)
def transcribe(path):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True).stdout
    x=np.frombuffer(raw,dtype=np.int16).astype(np.float64)/32768
    x=np.concatenate([np.zeros(4800),x,np.zeros(4800)])
    ck,cv=enc.run(None,{'mel':logmel(x)[None]})
    k=np.zeros((NL,1,448,NS),np.float32); v=np.zeros((NL,1,448,NS),np.float32)
    toks=np.array([[50257,50362]],dtype=np.int64); off=0; out=[]
    for _ in range(40):
        lg,k,v=dec.run(None,{'tokens':toks,'in_n_layer_self_k_cache':k,'in_n_layer_self_v_cache':v,'n_layer_cross_k':ck,'n_layer_cross_v':cv,'offset':np.array([off],dtype=np.int64)})
        off+=toks.shape[1]; t=int(lg[0,-1].argmax())
        if t==50256: break
        out.append(t); toks=np.array([[t]],dtype=np.int64)
    return b''.join(id2[t] for t in out if t<50256).decode('utf8','replace').strip()
def norm(s): return re.sub(r"[^a-z0-9 ]",'',s.lower().replace('-',' ')).strip()
if __name__=='__main__':
    man=json.load(open(sys.argv[1])); d=sys.argv[2]; bad=[]
    for it,sl in man.items():
        p=d+'/'+sl+'.mp3'
        if not os.path.exists(p): continue
        h=transcribe(p)
        if norm(h)!=norm(it): bad.append((it,h))
    print(len(man),'checked; mismatches',len(bad))
    for b in bad: print('  ',b)
