import os; os.environ['WH']='small.en'
import numpy as np, wave, json, re, ast, subprocess, shutil
import exp3
gen=exp3.gen; asr=exp3.asr; sess=exp3.sess; voices=exp3.voices
HOM={'grey':['gray'],'six':['6'],'four':['4','for','fore'],'eight':['8','ate'],'tea':['t','tee'],'sun':['son'],'riding':['writing'],'pear':['pair','pare'],'bear':['bare'],'board':['bored'],'week':['weak'],'schoolbag':['school bag'],'hair':['hare'],'eye':['i','aye'],'knee':['nee'],'living room':['livingroom'],'year':['year']}
def ok(word,h):
    n=asr.norm(h); return n==asr.norm(word) or n in HOM.get(word,[])
def synth(text,off,speed,out):
    ids=gen.tokens(text)
    a,d=sess.run(None,{'tokens':np.array([[0]+ids+[0]],dtype=np.int64),'style':voices[21][min(509,len(ids)+off)][None,:],'speed':np.array([speed],dtype=np.float32)})
    a=a.astype(np.float64); d=[int(x) for x in d]
    st=max(0,(d[0]-3)*600); en=(sum(d[:-1])+2)*600
    a=a[st:min(len(a),en)]; f=min(len(a),1920); a[-f:]*=np.linspace(1,0,f); a[:240]*=np.linspace(0,1,240)
    a=a/np.abs(a).max()*0.89; a=np.concatenate([np.zeros(1200),a,np.zeros(2400)])
    with wave.open(out,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes((a*32767).astype(np.int16).tobytes())
L=[ast.literal_eval(l.strip()) for l in open('final.log') if l.startswith('   (')]
words=[x[0] for x in L if not re.search(r'[.!?]$',x[0]) and not re.fullmatch(r'\d+',x[1]) and not ok(x[0],x[1])]
print(len(words),'to fix',flush=True)
VAR=[(o,s) for s in (1.0,0.92,1.08) for o in (8,16,30,60,3,100,45,150)]
fixed=0; left=[]
for w in words:
    hit=None
    for o,s in VAR[:14]:
        synth(w,o,s,'f.wav'); h=asr.transcribe('f.wav')
        if ok(w,h): hit=(o,s); break
    if hit:
        fixed+=1
        subprocess.run(['ffmpeg','-loglevel','error','-y','-i','f.wav','-ar','24000','-ac','1','-b:a','48k','mp3/'+gen.slug(w)+'.mp3'],check=True)
    else: left.append(w)
    print(w,hit,flush=True)
print('FIXED',fixed,'LEFT',left,flush=True)
