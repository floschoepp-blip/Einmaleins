import os; os.environ['WH']='small.en'
import numpy as np, onnxruntime as ort, wave, json, re, sys
import gen, asr
M='kokoro-multi-lang-v1_0/'
sess=ort.InferenceSession(M+'model.onnx',providers=['CPUExecutionProvider'])
voices=np.fromfile(M+'voices.bin',dtype=np.float32).reshape(54,510,256)
T=[t for t in json.load(open('sub.json')).keys() if not re.search(r'[.!?]$',t)]
def synth(text,carrier,out='x.wav'):
    t=re.sub(r'[.!?]$','',text)
    ids=gen.tokens(t); st_tok=0
    if carrier:
        pre=gen.tokens(carrier)+[gen.tok[' ']]
        st_tok=len(pre); ids=pre+ids
    a,d=sess.run(None,{'tokens':np.array([[0]+ids+[0]],dtype=np.int64),'style':voices[21][len(ids)][None,:],'speed':np.array([1.0],dtype=np.float32)})
    a=a.astype(np.float64); d=[int(x) for x in d]
    if carrier:
        lo=sum(d[:st_tok-1])*600; hi=sum(d[:st_tok+2])*600; pk=np.sqrt(np.mean(a.reshape(-1)[:len(a)//240*240].reshape(-1,240)**2,axis=1)).max()
        n=(hi-lo)//240; e=[np.sqrt(np.mean(a[lo+i*240:lo+(i+1)*240]**2)) for i in range(n)]
        i0=next((i for i in range(n) if e[i]<0.012*pk), int(np.argmin(e)))
        i1=i0
        while i1+1<n and e[i1+1]<0.006*pk: i1+=1
        st=lo+max(i0+1,i1-12)*240
    if not carrier: st=max(0,(d[0]-3)*600)
    en=(sum(d[:-1])+2)*600
    a=a[st:min(len(a),en)]; f=min(len(a),1920); a[-f:]*=np.linspace(1,0,f); a[:240]*=np.linspace(0,1,240)
    a=a/np.abs(a).max()*0.89; a=np.concatenate([np.zeros(1200),a,np.zeros(2400)])
    with wave.open(out,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes((a*32767).astype(np.int16).tobytes())
    return d
if __name__=='__main__':
    for car in [None]:
        bad=[]
        for t in T:
            synth(t,car); h=asr.transcribe('x.wav')
            if asr.norm(h)!=asr.norm(t): bad.append((t,h))
        print(car,len(bad),'/',len(T),bad,flush=True)
