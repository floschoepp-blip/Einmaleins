# Erzeugt ein synthetisches "Foto" (Katze auf Wiese mit Schatten, Rauschen, Unschärfe) zum Testen
import sys, random
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
W,H = 900,675
im = Image.new('RGB',(W,H),(170,210,240))
d = ImageDraw.Draw(im)
for y in range(H//2, H):  # Wiese mit Verlauf
    g = int(150 - (y-H//2)*0.15)
    d.line([(0,y),(W,y)], fill=(70,g,60))
d.ellipse([700,40,820,160], fill=(255,230,120))          # Sonne
d.rectangle([80,250,300,470], fill=(190,120,90))         # Haus
d.polygon([(60,250),(190,150),(320,250)], fill=(120,50,40))
d.rectangle([160,360,220,470], fill=(80,50,30))          # Tür
d.rectangle([110,290,150,330], fill=(220,240,255))       # Fenster
d.ellipse([480,330,700,520], fill=(200,140,70))          # Katzenkörper
d.ellipse([430,250,560,370], fill=(210,150,80))          # Kopf
d.polygon([(440,270),(450,200),(490,255)], fill=(210,150,80))   # Ohren
d.polygon([(500,255),(545,200),(555,275)], fill=(210,150,80))
d.ellipse([460,290,485,312], fill=(30,30,30)); d.ellipse([510,290,535,312], fill=(30,30,30))  # Augen
d.polygon([(485,325),(500,325),(492,335)], fill=(230,100,120))  # Nase
d.ellipse([560,470,760,540], fill=(40,90,40))            # Schatten
d.line([(690,420),(780,330),(800,300)], fill=(200,140,70), width=22)  # Schwanz
rng = random.Random(3)
for _ in range(900):  # Grashalme
    x=rng.randint(0,W); y=rng.randint(H//2+10,H); d.line([(x,y),(x+rng.randint(-6,6),y-rng.randint(8,22))], fill=(40,rng.randint(110,170),50), width=2)
for yy in range(255,470,18):  # Backsteine
    off = 0 if (yy//18)%2 else 20
    d.line([(80,yy),(300,yy)], fill=(120,70,50), width=2)
    for xx in range(80+off,300,40): d.line([(xx,yy),(xx,yy+18)], fill=(120,70,50), width=2)
for k in range(6):  # Katzenstreifen
    d.arc([500+k*18,340,560+k*18,420],200,340,fill=(120,70,30),width=5)
for k in range(3):  # Schnurrhaare
    d.line([(470,320+k*6),(410,312+k*14)],fill=(240,240,240),width=2); d.line([(525,320+k*6),(590,312+k*14)],fill=(240,240,240),width=2)
im = im.filter(ImageFilter.GaussianBlur(1.2))
a = np.asarray(im).astype(np.float32)
a += np.random.default_rng(1).normal(0,4,a.shape)
Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(sys.argv[1], quality=90)
