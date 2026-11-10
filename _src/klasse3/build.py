import pathlib
d=pathlib.Path(__file__).parent
h=(d/'src/shell.html').read_text()
js=''.join((d/'src'/f).read_text()+'\n' for f in ['base.js','mascot.js','baum.js','mathe.js','deutsch.js','hsu.js','englisch.js','core.js'])
h=h.replace("'use strict';\n",'').replace('/*CLIPCSS*/',(d/'src/clips.css').read_text()).replace('/*JS*/',js)
(d/'dist/index.html').write_text(h)
print(len(h))
