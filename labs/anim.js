/* «Мэдлэгийн Мөр» — Хөдөлгөөнт зургийн студи (GIF). AnimLab.mount(el,{onSave}) */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const W=480,H=360,PAL=['#14213d','#ffffff','#c1121f','#e85d04','#f4a261','#ffd166','#2a9d8f','#06d6a0','#118ab2','#7b2cbf','#ff70a6','#8d6e63','#6c757d','#000000'];
let root,O={},S;
function fresh(){return {frames:[blank()],cur:0,tool:'pen',color:'#14213d',size:6,fps:6,onion:true,playing:false,loop:true,name:'hodolgoont',undo:[]}}
function isBlank(c){const d=c.getContext('2d').getImageData(0,0,W,H).data;for(let i=0;i<d.length;i+=64)if(d[i]<250||d[i+1]<250||d[i+2]<250)return false;return true}
function blank(){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);return c}
function clone(c){const n=blank();n.getContext('2d').drawImage(c,0,0);return n}
/* ---------- GIF кодлогч ---------- */
function palette(){const p=[];for(let r=0;r<6;r++)for(let g=0;g<6;g++)for(let b=0;b<6;b++)p.push([r*51,g*51,b*51]);for(let i=0;i<40;i++){const v=Math.round(i*255/39);p.push([v,v,v])}return p}
const GP=palette();
function idx(r,g,b){if(Math.abs(r-g)<10&&Math.abs(g-b)<10&&Math.abs(r-b)<10)return 216+Math.round((r+g+b)/3/255*39);return Math.round(r/51)*36+Math.round(g/51)*6+Math.round(b/51)}
function lzw(px,minSize){const out=[];let cur=0,bits=0;const put=(code,size)=>{cur|=code<<bits;bits+=size;while(bits>=8){out.push(cur&255);cur>>=8;bits-=8}};
 const clear=1<<minSize,eoi=clear+1;let size=minSize+1,next=eoi+1,dict=new Map();put(clear,size);let w=px[0];
 for(let i=1;i<px.length;i++){const k=px[i],key=w*4096+k;if(dict.has(key)){w=dict.get(key);continue}put(w,size);if(next<4096){dict.set(key,next++);if(next>(1<<size)&&size<12)size++}else{put(clear,size);dict=new Map();size=minSize+1;next=eoi+1}w=k}
 put(w,size);put(eoi,size);if(bits>0)out.push(cur&255);return out}
function gif(frames,delay,loop){const b=[];const s=t=>{for(const c of t)b.push(c.charCodeAt(0))},w16=v=>b.push(v&255,(v>>8)&255);
 s('GIF89a');w16(W);w16(H);b.push(0xF7,0,0);GP.forEach(c=>b.push(...c));
 if(loop){b.push(0x21,0xFF,11);s('NETSCAPE2.0');b.push(3,1,0,0,0)}
 for(const f of frames){const d=f.getContext('2d').getImageData(0,0,W,H).data;const px=new Uint8Array(W*H);for(let i=0,j=0;i<d.length;i+=4,j++)px[j]=idx(d[i],d[i+1],d[i+2]);
  b.push(0x21,0xF9,4,0);w16(delay);b.push(0,0);b.push(0x2C);w16(0);w16(0);w16(W);w16(H);b.push(0);b.push(8);
  const data=lzw(px,8);for(let i=0;i<data.length;i+=255){const ch=data.slice(i,i+255);b.push(ch.length,...ch)}b.push(0)}
 b.push(0x3B);return new Uint8Array(b)}
/* ---------- UI ---------- */
function render(){root.innerHTML=`<div class="anl"><div class="anl-top"><div class="anl-brand"><span>🎞️</span><div><b>Хөдөлгөөнт зургийн студи</b><small>Кадр бүрээр зурж, GIF болгон хадгална</small></div></div>
 <div class="anl-acts"><button class="anl-b" data-a="play">${S.playing?'⏸ Зогсоох':'▶ Тоглуулах'}</button><button class="anl-b gold" data-a="gif">💾 GIF хадгалах</button><button class="anl-b ghost" data-a="tobin" title="Видео засварлагчид клип болгох">🎬 Видеод ашиглах</button><button class="anl-b ghost" data-a="png">PNG кадр</button><button class="anl-b ghost ${S.ask?'red':''}" data-a="new">${S.ask?'❗ Тийм, арилгах':'🗋 Шинэ'}</button></div></div>
 <div class="anl-main"><div class="anl-tools">${[['pen','✏️','Үзэг'],['brush','🖌️','Багс'],['eraser','🧽','Баллуур'],['line','╱','Шугам'],['rect','▭','Тэгш өнцөгт'],['ellipse','◯','Эллипс'],['fill','🪣','Будах'],['text','A','Бичвэр'],['move','✥','Зөөх']].map(([k,i,t])=>`<button class="${S.tool===k?'on':''}" data-tool="${k}" title="${t}"><span>${i}</span><small>${t}</small></button>`).join('')}
  <div class="anl-pal">${PAL.map(c=>`<button style="background:${c}" class="${S.color===c?'on':''}" data-col="${c}" aria-label="${c}"></button>`).join('')}<input type="color" value="${S.color}" data-a="col" title="Өөр өнгө"></div>
  <label class="anl-l">Зузаан <b>${S.size}</b><input type="range" min="1" max="40" value="${S.size}" data-a="size"></label>
  <label class="anl-chk"><input type="checkbox" data-a="onion" ${S.onion?'checked':''}> 🧅 Өмнөх кадрын сүүдэр</label></div>
 <div class="anl-stagewrap"><div class="anl-stage"><canvas class="anl-onion" width="${W}" height="${H}"></canvas><canvas class="anl-cv" width="${W}" height="${H}"></canvas></div>
  <div class="anl-info">Кадр <b>${S.cur+1}</b> / ${S.frames.length} · ${S.fps} кадр/сек · үргэлжлэх хугацаа ${(S.frames.length/S.fps).toFixed(1)} сек</div></div></div>
 <div class="anl-frames">${S.frames.map((f,i)=>`<button class="anl-fr ${i===S.cur?'on':''}" data-fr="${i}"><img src="${f.toDataURL('image/png')}" alt=""><span>${i+1}</span></button>`).join('')}<button class="anl-fr add" data-a="add" title="Хоосон кадр">＋</button></div>
 <div class="anl-row"><button class="anl-b" data-a="dup">⧉ Кадр хувилах</button><button class="anl-b ghost" data-a="add">＋ Хоосон кадр</button><button class="anl-b ghost" data-a="left">◀ Зөөх</button><button class="anl-b ghost" data-a="right">Зөөх ▶</button><button class="anl-b ghost" data-a="undo">↶ Буцаах</button><button class="anl-b ghost" data-a="clear">Кадр цэвэрлэх</button><button class="anl-b ghost red" data-a="del">🗑 Кадр устгах</button>
  <label class="anl-l">Хурд <b>${S.fps}</b> кадр/сек<input type="range" min="1" max="24" value="${S.fps}" data-a="fps"></label><label class="anl-chk"><input type="checkbox" data-a="loop" ${S.loop?'checked':''}> Давтах</label><label class="anl-l">Файлын нэр<input data-a="name" value="${esc(S.name)}" maxlength="30"></label>
  <label class="anl-b ghost anl-imp">🖼 Зураг оруулах (энэ кадрт)<input type="file" accept="image/*" data-a="imp" hidden></label><label class="anl-b ghost anl-imp">🗂 Олон зургийг кадр болгох<input type="file" accept="image/*" multiple data-a="impm" hidden></label></div>
 ${S.msg?`<div class="anl-msg">${S.msg}</div>`:''}
 <p class="anl-hint">💡 <b>Хөдөлгөөнт зураг</b> нь бага зэрэг ялгаатай олон кадрыг дараалан хурдан харуулахад үүсдэг. «⧉ Кадр хувилах»-аар өмнөх кадраа хуулж, дүрсээ бага зэрэг хөдөлгөөд дараагийн кадраа хий. 🧅 сүүдэр нь өмнөх кадрыг бүдэг харуулна. Секундэд 12 ба түүнээс дээш кадр харуулбал хөдөлгөөн жигд харагдана.</p></div>`;bind();paintOnion();paintCur()}
function paintCur(){const cv=root.querySelector('.anl-cv'),x=cv.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(S.frames[S.cur],0,0)}
function paintOnion(){const o=root.querySelector('.anl-onion').getContext('2d');o.clearRect(0,0,W,H);if(S.onion&&S.cur>0&&!S.playing){o.globalAlpha=.3;o.drawImage(S.frames[S.cur-1],0,0);o.globalAlpha=1}}
function thumbs(){const b=root.querySelector(`[data-fr="${S.cur}"] img`);if(b)b.src=S.frames[S.cur].toDataURL('image/png');const inf=root.querySelector('.anl-info');if(inf)inf.innerHTML=`Кадр <b>${S.cur+1}</b> / ${S.frames.length} · ${S.fps} кадр/сек · үргэлжлэх хугацаа ${(S.frames.length/S.fps).toFixed(1)} сек`}
function snap(){S.undo.push([S.cur,clone(S.frames[S.cur])]);if(S.undo.length>30)S.undo.shift()}
function flood(ctx,x,y,col){const im=ctx.getImageData(0,0,W,H),d=im.data;const i0=(y*W+x)*4,t=[d[i0],d[i0+1],d[i0+2]];const c=document.createElement('canvas').getContext('2d');c.fillStyle=col;c.fillRect(0,0,1,1);const f=c.getImageData(0,0,1,1).data;
 if(Math.abs(t[0]-f[0])+Math.abs(t[1]-f[1])+Math.abs(t[2]-f[2])<8)return;const st=[[x,y]],seen=new Uint8Array(W*H),ok=i=>Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])<60;
 while(st.length){const [px,py]=st.pop();if(px<0||py<0||px>=W||py>=H)continue;const k=py*W+px;if(seen[k])continue;seen[k]=1;const i=k*4;if(!ok(i))continue;d[i]=f[0];d[i+1]=f[1];d[i+2]=f[2];d[i+3]=255;st.push([px+1,py],[px-1,py],[px,py+1],[px,py-1])}ctx.putImageData(im,0,0)}
function bind(){const q=s=>root.querySelectorAll(s);
 q('[data-tool]').forEach(b=>b.onclick=()=>{S.tool=b.dataset.tool;q('[data-tool]').forEach(x=>x.classList.toggle('on',x===b))});
 q('[data-col]').forEach(b=>b.onclick=()=>{S.color=b.dataset.col;q('[data-col]').forEach(x=>x.classList.toggle('on',x===b))});
 q('[data-fr]').forEach(b=>b.onclick=()=>{stop();S.cur=+b.dataset.fr;render()});
 q('[data-a]').forEach(el=>{const a=el.dataset.a;const ev=el.tagName==='INPUT'?(el.type==='range'||el.type==='text'||!el.type?'oninput':'onchange'):'onclick';el[ev]=()=>act(a,el)});
 const cv=root.querySelector('.anl-cv');let drag=null;
 const pos=e=>{const r=cv.getBoundingClientRect();return [Math.round((e.clientX-r.left)*W/r.width),Math.round((e.clientY-r.top)*H/r.height)]};
 cv.onpointerdown=e=>{if(S.playing)return;e.preventDefault();cv.setPointerCapture(e.pointerId);const [x,y]=pos(e),ctx=S.frames[S.cur].getContext('2d');snap();
  if(S.tool==='fill'){flood(ctx,x,y,S.color);paintCur();thumbs();return}
  if(S.tool==='text'){const t=prompt('Бичвэр:');if(t){ctx.fillStyle=S.color;ctx.font=`bold ${S.size*4+10}px Georgia, serif`;ctx.fillText(t,x,y)}paintCur();thumbs();return}
  drag={x0:x,y0:y,lx:x,ly:y,base:clone(S.frames[S.cur])};if(['pen','brush','eraser'].includes(S.tool))line(ctx,x,y,x,y)};
 cv.onpointermove=e=>{if(!drag)return;const [x,y]=pos(e),ctx=S.frames[S.cur].getContext('2d');
  if(['pen','brush','eraser'].includes(S.tool)){line(ctx,drag.lx,drag.ly,x,y);drag.lx=x;drag.ly=y}
  else{ctx.drawImage(drag.base,0,0);if(S.tool==='move'){ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.drawImage(drag.base,x-drag.x0,y-drag.y0)}else shape(ctx,drag.x0,drag.y0,x,y,e.shiftKey)}paintCur()};
 cv.onpointerup=()=>{if(drag){drag=null;thumbs()}}}
function line(ctx,a,b,c,d){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=S.tool==='eraser'?'#fff':S.color;ctx.lineWidth=S.tool==='pen'?Math.max(1,S.size/2):S.tool==='eraser'?S.size*2:S.size;ctx.globalAlpha=S.tool==='brush'?.85:1;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();ctx.globalAlpha=1}
function shape(ctx,x0,y0,x,y,sh){ctx.strokeStyle=S.color;ctx.lineWidth=S.size;ctx.lineCap='round';let w=x-x0,h=y-y0;if(sh){const m=Math.max(Math.abs(w),Math.abs(h));w=Math.sign(w||1)*m;h=Math.sign(h||1)*m}ctx.beginPath();
 if(S.tool==='line'){ctx.moveTo(x0,y0);ctx.lineTo(x0+w,y0+h)}else if(S.tool==='rect')ctx.rect(x0,y0,w,h);else ctx.ellipse(x0+w/2,y0+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);ctx.stroke()}
let timer=null;
function stop(){clearInterval(timer);timer=null;if(S)S.playing=false}
function act(a,el){if(a!=='new'&&S.ask){S.ask=false}if(!['size','fps','col','onion','loop','name'].includes(a))S.msg='';
 if(a==='size'){S.size=+el.value;el.previousElementSibling.textContent=S.size;return}
 if(a==='fps'){S.fps=+el.value;el.previousElementSibling.textContent=S.fps;thumbs();if(S.playing){stop();act('play')}return}
 if(a==='col'){S.color=el.value;return}if(a==='onion'){S.onion=el.checked;paintOnion();return}if(a==='loop'){S.loop=el.checked;return}if(a==='name'){S.name=el.value.replace(/[^\wА-Яа-яЁёӨөҮү-]/g,'_')||'hodolgoont';return}
 if(a==='play'){if(S.playing){stop();render();return}S.playing=true;render();let i=0;timer=setInterval(()=>{if(!root.isConnected)return stop();S.cur=i;paintCur();i++;if(i>=S.frames.length){if(S.loop)i=0;else{stop();render()}}},1000/S.fps);return}
 stop();
 if(a==='add'){S.frames.splice(S.cur+1,0,blank());S.cur++}
 if(a==='dup'){S.frames.splice(S.cur+1,0,clone(S.frames[S.cur]));S.cur++}
 if(a==='del'){if(S.frames.length<2)return;S.frames.splice(S.cur,1);S.cur=Math.max(0,S.cur-1)}
 if(a==='left'&&S.cur>0){[S.frames[S.cur-1],S.frames[S.cur]]=[S.frames[S.cur],S.frames[S.cur-1]];S.cur--}
 if(a==='right'&&S.cur<S.frames.length-1){[S.frames[S.cur+1],S.frames[S.cur]]=[S.frames[S.cur],S.frames[S.cur+1]];S.cur++}
 if(a==='clear'){snap();S.frames[S.cur]=blank()}
 if(a==='undo'){const u=S.undo.pop();if(u){S.cur=Math.min(u[0],S.frames.length-1);S.frames[S.cur]=u[1]}}
 if(a==='new'){if(!S.ask){S.ask=true;S.msg='Одоогийн ажил арилна. Дахин «❗ Тийм, арилгах» дарвал шинээр эхэлнэ.';render();clearTimeout(window._anAsk);window._anAsk=setTimeout(()=>{if(S.ask){S.ask=false;S.msg='';if(root.isConnected)render()}},5000);return}S=fresh()}
 if(a==='impm'){const fs=[...el.files];MM.resetInput(el);if(!fs.length)return;let k=0;const next=()=>{if(k>=fs.length){S.msg=`✅ ${fs.length} зураг кадр болж орлоо.`;render();return}const im=new Image();im.onload=()=>{const c=blank(),x=c.getContext('2d'),q=Math.min(W/im.width,H/im.height);x.drawImage(im,(W-im.width*q)/2,(H-im.height*q)/2,im.width*q,im.height*q);const empty=S.frames.length===1&&isBlank(S.frames[0]);if(empty)S.frames[0]=c;else S.frames.splice(++S.cur,0,c);if(empty)S.cur=0;k++;next()};im.onerror=()=>{k++;next()};im.src=URL.createObjectURL(fs[k])};next();return}
 if(a==='imp'){const f=el.files[0];MM.resetInput(el);if(!f)return;const im=new Image();im.onerror=()=>{S.msg='⚠️ Зургийг уншиж чадсангүй (JPG, PNG сонгоно уу).';render()};im.onload=()=>{snap();const x=S.frames[S.cur].getContext('2d');const k=Math.min(W/im.width,H/im.height);x.drawImage(im,(W-im.width*k)/2,(H-im.height*k)/2,im.width*k,im.height*k);render()};im.src=URL.createObjectURL(f);return}
 if(a==='tobin'){MM.bin.add({kind:'anim',name:S.name,frames:S.frames.map(clone),fps:S.fps,dur:S.frames.length/S.fps});S.msg='✅ Медиа санд нэмэгдлээ. Видео засварлагч → «🎞 Хөдөлгөөнт зураг»-аас сонгоно.';render();return}
 if(a==='gif'){S.msg='⏳ GIF үүсгэж байна…';const blob=new Blob([gif(S.frames,Math.round(100/S.fps),S.loop)],{type:'image/gif'});S.msg='';MM.save(blob,S.name+'.gif',{toBin:()=>MM.bin.add({kind:'anim',name:S.name,frames:S.frames.map(clone),fps:S.fps,dur:S.frames.length/S.fps})});if(O.onSave)O.onSave({frames:S.frames.length,fps:S.fps});return}
 if(a==='png'){S.frames[S.cur].toBlob(b=>MM.save(b,`${S.name}_${S.cur+1}.png`));return}
 render()}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const css=document.createElement('style');css.textContent=`
.anl{--an:#14213d;--ag:#b08d3a;--al:#e6dfcf;background:#fffdf8;border:1px solid var(--al);border-radius:14px;overflow:hidden;color:#1d2433}
.anl-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#14213d,#3a2a5d);color:#fff}
.anl-brand{display:flex;gap:10px;align-items:center}.anl-brand span{font-size:28px}.anl-brand small{display:block;opacity:.8;font-size:12px}.anl-acts{display:flex;gap:6px;flex-wrap:wrap}
.anl-b{min-height:36px;padding:6px 12px;border-radius:9px;border:1.5px solid var(--an);background:var(--an);color:#fff;font-weight:700;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;gap:4px}.anl-b.ghost{background:#fff;color:var(--an)}.anl-b.gold{background:var(--ag);border-color:var(--ag)}.anl-b.red{color:#b0413e;border-color:#e2b3b1}
.anl-top .anl-b.ghost{background:transparent;color:#fff;border-color:#ffffff88}
.anl-main{display:grid;grid-template-columns:200px 1fr;gap:12px;padding:12px}
@media(max-width:760px){.anl-main{grid-template-columns:1fr}.anl-tools{order:2}}
.anl-tools{display:flex;flex-direction:column;gap:8px}.anl-tools>button,.anl-tools{font-size:13px}

.anl-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;align-content:start}
.anl-tools [data-tool]{display:flex;flex-direction:column;align-items:center;gap:1px;border:1.5px solid var(--al);background:#fff;border-radius:10px;padding:6px 2px;cursor:pointer;min-height:52px;font:inherit}.anl-tools [data-tool] span{font-size:19px}.anl-tools [data-tool] small{font-size:10.5px;font-weight:700;color:#4a5470}.anl-tools [data-tool].on{border-color:var(--ag);background:#fbf4e2}
.anl-pal{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.anl-pal button{aspect-ratio:1;border-radius:6px;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer;min-height:0;padding:0}.anl-pal button.on{box-shadow:0 0 0 2px var(--ag)}.anl-pal input{grid-column:span 2;width:100%;height:28px;padding:0;border:0}
.anl-l{grid-column:1/-1;display:flex;flex-direction:column;font-size:12.5px;font-weight:700;gap:2px;color:#3b4560}.anl-l input[type=range]{width:100%}.anl-l input:not([type=range]){min-height:34px;border:1px solid var(--al);border-radius:8px;padding:4px 8px;font:inherit}
.anl-chk{grid-column:1/-1;display:flex!important;gap:6px;align-items:center;font-size:13px;font-weight:600;margin:0!important}.anl-chk input{width:18px;min-height:18px}
.anl-stagewrap{min-width:0}.anl-stage{position:relative;width:100%;max-width:720px;aspect-ratio:4/3;margin:0 auto;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(20,33,61,.15);background:#fff;border:1px solid var(--al)}
.anl-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}.anl-cv{mix-blend-mode:multiply;cursor:crosshair}
.anl-info{text-align:center;font-size:13px;color:#5b6276;margin-top:6px}
.anl-frames{display:flex;gap:8px;overflow-x:auto;padding:6px 12px;background:#f4efe3;border-top:1px solid var(--al);border-bottom:1px solid var(--al)}
.anl-fr{flex:none;position:relative;width:96px;border:2px solid var(--al);border-radius:8px;background:#fff;padding:0;cursor:pointer;overflow:hidden}.anl-fr img{display:block;width:100%;aspect-ratio:4/3}.anl-fr span{position:absolute;left:3px;top:2px;font-size:11px;font-weight:800;background:#14213dcc;color:#fff;border-radius:4px;padding:0 4px}.anl-fr.on{border-color:var(--ag);box-shadow:0 0 0 2px #f3d27a}.anl-fr.add{font-size:26px;color:var(--an);min-height:74px}
.anl-row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;padding:10px 12px}.anl-row .anl-l{min-width:150px}
.anl-hint{font-size:13px;color:#5b6276;margin:0;padding:0 12px 12px}
.anl-msg{margin:0 12px 10px;padding:8px 12px;border-radius:10px;background:#fbf4e2;font-weight:700;font-size:14px}
@media(max-width:640px){.anl-top{padding:10px}.anl-acts{display:grid;grid-template-columns:1fr 1fr;width:100%}.anl-acts .anl-b{justify-content:center;min-height:44px}.anl-main{padding:8px}.anl-tools{grid-template-columns:repeat(5,1fr)!important}.anl-tools [data-tool]{min-height:48px}.anl-pal{grid-column:1/-1}.anl-l,.anl-chk{grid-column:1/-1}.anl-row .anl-b{flex:1 1 45%;justify-content:center;min-height:42px}.anl-fr{width:74px!important}}
`;
document.head.appendChild(css);
window.AnimLab={mount(el,o={}){stop();root=el;O=o;if(!S)S=fresh();S.playing=false;render()},_gif:gif};
})();
