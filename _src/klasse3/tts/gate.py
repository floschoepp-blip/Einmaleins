import numpy as np, subprocess, wave, sys, os, glob
FR=220
def load(path):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-f','s16le','-ac','1','-ar','22050','-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float64)/32768
def gate(a, maxpause=28):
    n=len(a)//FR; f=a[:n*FR].reshape(-1,FR)
    e=np.sqrt(np.mean(f**2,axis=1)); pk=np.percentile(e,97) or 1e-9; r=e/pk
    z=np.mean(np.abs(np.diff(np.sign(f),axis=1))>0,axis=1)
    quiet=(r<0.055)
    g=np.ones(n); i=0; removed=0; runs=[]
    while i<n:
        if quiet[i]:
            j=i
            while j<n and quiet[j]: j+=1
            edge_l = 0 if i==0 else 3; edge_r = 0 if j==n else (10 if i==0 else 3)
            if j-i>=12 or i==0 or j==n:
                s,t=i+edge_l,j-edge_r
                if t>s: g[s:t]=0; removed+=t-s; runs.append((s,t))
            i=j
        else: i+=1
    # sample-level gain with 15 ms ramps
    gs=np.repeat(g,FR); k=330; ker=np.ones(k)/k; gs=np.convolve(gs,ker,mode='same'); gs=np.minimum(gs,np.repeat(g,FR)*0+gs)
    out=a[:n*FR]*gs
    # shorten long silent pauses to maxpause frames
    keep=np.ones(n,bool)
    for s,t in runs:
        if s>0 and t<n and t-s>maxpause: keep[s+maxpause//2:t-maxpause//2]=False
    out=out.reshape(-1,FR)[keep].reshape(-1)
    # trim leading/trailing silence
    nz=np.where(np.abs(out)>0.004)[0]
    if len(nz): out=out[max(0,nz[0]-660):min(len(out),nz[-1]+1100)]
    out=out/max(1e-6,np.abs(out).max())*0.89
    return np.concatenate([np.zeros(1100),out,np.zeros(2200)]), removed*10
def save(a,path,tmp):
    with wave.open(tmp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp,'-ar','22050','-ac','1','-b:a','40k',path],check=True)
if __name__=='__main__':
    src,dst=sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True); tot=0; dur=0
    for i,f in enumerate(sorted(glob.glob(src+'/*.mp3'))):
        a=load(f); o,rm=gate(a); tot+=rm; dur+=len(a)/22.05
        save(o,dst+'/'+os.path.basename(f),'g.wav')
    print('files',i+1,'removed %.0f s of %.0f s'%(tot/1000,dur/1000))
