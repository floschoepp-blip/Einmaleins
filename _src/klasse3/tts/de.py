import re, wave, numpy as np, onnxruntime as ort
D='vits-coqui-de-css10/'
tok={}
for l in open(D+'tokens.txt',encoding='utf8'):
    l=l.rstrip('\n')
    if not l: continue
    s,i=l.rsplit(' ',1); tok[s]=int(i)
if ' ' not in tok:
    for l in open(D+'tokens.txt',encoding='utf8'):
        if l.startswith('  '): tok[' ']=int(l.split()[-1])
so=ort.SessionOptions(); so.intra_op_num_threads=2
sess=ort.InferenceSession(D+'model.onnx',so,providers=['CPUExecutionProvider'])
E=['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn']
Z=['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig']
def num(n):
    n=int(n)
    if n<20: return E[n]
    if n<100: e=n%10; return (('ein' if e==1 else E[e])+'und' if e else '')+Z[n//10]
    if n<1000: h=n//100; r=n%100; return ('ein' if h==1 else E[h])+'hundert'+(num(r) if r else '')
    if n<1000000: t=n//1000; r=n%1000; return ('ein' if t==1 else num(t))+'tausend'+(num(r) if r else '')
    return str(n)
def norm(t):
    t=t.replace('▢',' Lücke ').replace('„','').replace('“','').replace('”','').replace('→',', dann ').replace('↔',' und ').replace('×',' mal ').replace('−',' minus ').replace('–',', ').replace('…',' ').replace('•',', ').replace('✓','').replace('🔊','den Lautsprecher')
    L={'A':'Ah','B':'Beh','C':'Zeh','D':'Deh','E':'Eh','F':'Eff','G':'Geh','H':'Hah','I':'Ih','J':'Jott','K':'Kah','L':'Ell','M':'Emm','N':'Enn','O':'Oh','P':'Peh','Q':'Kuh','R':'Err','S':'Ess','T':'Teh','U':'Uh','V':'Vau','W':'Weh','X':'Iks','Y':'Üpsilon','Z':'Zett'}
    t=t.replace('ABC','Ah Beh Zeh')
    t=re.sub(r'(?<=(?:vor|ach) )([A-Z])(?=\?)',lambda m:L[m.group(1)],t)
    t=re.sub(r'(\d),(\d)',r'\1 Komma \2',t); t=re.sub(r'(\d) : (\d)',r'\1 geteilt durch \2',t); t=t.replace(' + ',' plus ').replace(' = ',' ist gleich ').replace(' < ',' kleiner als ').replace(' > ',' größer als ')
    for a,b in [('z. B.','zum Beispiel'),(' km',' Kilometer'),(' cm',' Zentimeter'),(' mm',' Millimeter'),(' kg',' Kilogramm'),(' ml',' Milliliter'),(' min',' Minuten'),(' ct',' Cent'),('€','Euro'),('°C','Grad Celsius'),('½','ein halb'),('¼','ein viertel'),('¾','drei viertel'),('%',' Prozent'),(' H,',' Hunderter,'),(' Z,',' Zehner,'),(' E ',' Einer ')]: t=t.replace(a,b)
    t=re.sub(r'(\d+) m\b',r'\1 Meter',t); t=re.sub(r'(\d+) g\b',r'\1 Gramm',t); t=re.sub(r'(\d+) l\b',r'\1 Liter',t); t=re.sub(r'(\d+) t\b',r'\1 Tonnen',t)
    t=re.sub(r'(\d+)\. ',lambda m:num(m.group(1))+'tens, ' if int(m.group(1))<13 else m.group(0),t)
    t=re.sub(r'\d+',lambda m:num(m.group(0)),t)
    t=t.replace('\n',' ').replace('(',', ').replace(')',', ').replace('/',' oder ')
    return re.sub(r'\s+',' ',t).strip()
def synth(text,out,ls=1.08):
    t=norm(text); ids=[]
    for ch in t:
        if ch in tok: ids.append(tok[ch])
        elif ch.lower() in tok: ids.append(tok[ch.lower()])
    x=[3]
    for i in ids: x+=[i,3]
    a=sess.run(None,{'input':np.array([x],dtype=np.int64),'input_lengths':np.array([len(x)],dtype=np.int64),'scales':np.array([0.5,ls,0.7],dtype=np.float32),'sid':np.array([0],dtype=np.int64),'langid':np.array([0],dtype=np.int64)})[0].reshape(-1).astype(np.float64)
    n=len(a)//220; e=np.sqrt(np.mean(a[:n*220].reshape(-1,220)**2,axis=1)); idx=np.where(e>e.max()*0.02)[0]
    a=a[max(0,idx[0]-5)*220:min(n,idx[-1]+12)*220]; f=min(len(a),1500); a[-f:]*=np.linspace(1,0,f); a[:220]*=np.linspace(0,1,220)
    a=a/np.abs(a).max()*0.89; a=np.concatenate([np.zeros(1100),a,np.zeros(2200)])
    with wave.open(out,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((a*32767).astype(np.int16).tobytes())
    return t
if __name__=='__main__':
    import sys
    print(norm('3 × 4 = 12, z. B. 1,5 m und 345 ct. 2. Regel: 1000 g'))
    for i,t in enumerate(['Messer','Schlüssel','Fahrrad','Bäume','Der kleine Hund bellt im Garten.','Welche Wortart ist das markierte Wort?','Nomen schreibt man groß. Man kann der, die oder das davorsetzen.','Wie viele Zähne hat ein vollständiges Milchgebiss?']):
        print(synth(t,'de%d.wav'%i))
