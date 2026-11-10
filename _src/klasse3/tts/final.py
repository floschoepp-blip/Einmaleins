import os; os.environ['WH']='small.en'
import json,re,subprocess,sys
import exp3
items=json.load(open('items.json'))
os.makedirs('mp3',exist_ok=True); man={}
for it in items:
    sl=exp3.gen.slug(it); man[it]=sl
    phrase=bool(re.search(r'[.!?]$',it))
    exp3.synth(it, None, 'x.wav')
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','x.wav','-ar','24000','-ac','1','-b:a','48k','mp3/'+sl+'.mp3'],check=True)
json.dump(man,open('manifest.json','w'),ensure_ascii=False); print(len(man),'done',flush=True)
bad=[]
for it,sl in man.items():
    h=exp3.asr.transcribe('mp3/'+sl+'.mp3')
    if exp3.asr.norm(h)!=exp3.asr.norm(it): bad.append((it,h))
print('mismatch',len(bad),'/',len(man))
for b in bad: print('  ',b)
