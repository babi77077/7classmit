/* «Мэдлэгийн Мөр» — студиудын нийтлэг хэрэгсэл: дуу бичих, файл унших, хадгалах/хуваалцах, «Медиа сан» (студи хооронд дамжуулах).
   window.MM = { ac(), unlock(), recorder(), decode(blob), save(blob,name), bin:{add,list,get,remove,on}, pick(kind,cb), env() } */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let AC=null;
const ac=()=>{if(!AC){const K=window.AudioContext||window.webkitAudioContext;AC=new K()}return AC};
/* Утсан дээр аудио зөвхөн хэрэглэгчийн хүрэлтээр «сэрдэг» тул эхний хүрэлтээр сэрээнэ */
function unlock(){try{const c=ac();if(c.state!=='running')c.resume();const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}}
['pointerdown','touchend','keydown'].forEach(ev=>addEventListener(ev,unlock,{once:true,capture:true}));

/* ---------- Орчны шалгалт ---------- */
function env(){const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
 const ua=navigator.userAgent,ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 return {inFrame,ios,android:/Android/.test(ua),secure:window.isSecureContext,mic:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),rec:!!window.MediaRecorder,share:!!(navigator.canShare)}}
function micHelp(err){const E=env();const n=err&&err.name||'';
 if(!E.secure)return 'Микрофон зөвхөн <b>https://</b> хаягтай сайт дээр ажиллана.';
 if(E.inFrame&&(n==='NotAllowedError'||n==='SecurityError'))return 'Энэ урьдчилан харах цонх микрофон ашиглахыг хориглодог. Сайтаа өөрийн хаягаар (GitHub Pages) нээвэл бичлэг хийнэ. Одоохондоо утасныхаа <b>Дуу хураагуур (Voice Recorder / Voice Memos)</b>-аар бичээд «📂 Файл нээх»-ээр оруулж болно.';
 if(n==='NotAllowedError')return E.ios?'Микрофоны зөвшөөрөл хаалттай байна. <b>Тохиргоо → Safari → Микрофон → Зөвшөөрөх</b> болгоод хуудсаа дахин ачаална уу.':'Микрофоны зөвшөөрөл хаалттай байна. Хаягийн мөрний зүүн талын 🔒/ⓘ тэмдэг → <b>Микрофон → Зөвшөөрөх</b> гээд хуудсаа дахин ачаална уу.';
 if(n==='NotFoundError')return 'Микрофон олдсонгүй. Чихэвч, микрофоноо залгаад дахин оролдоно уу.';
 if(n==='NotReadableError')return 'Микрофоныг өөр программ (дуудлага, Zoom г.м.) ашиглаж байна. Тэрийг хаагаад дахин оролдоно уу.';
 return 'Микрофон нээгдсэнгүй ('+esc(n||err)+').'}

/* ---------- Дуу бичих ---------- */
const AT=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/mp4;codecs=mp4a.40.2','audio/aac','audio/ogg;codecs=opus'];
function recorder(onLevel){return new Promise((res,rej)=>{const E=env();
 if(!E.mic)return rej({name:'NoMic',message:E.secure?'Энэ хөтөч микрофон дэмжихгүй байна. Chrome эсвэл Safari-ийн шинэ хувилбар ашиглана уу.':micHelp()});
 if(!E.rec)return rej({name:'NoRec',message:'Энэ хөтөч дуу бичих (MediaRecorder) дэмжихгүй байна. iPhone дээр iOS 14.3+, эсвэл Chrome ашиглана уу.'});
 unlock();
 navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(st=>{
  const mt=AT.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}})||'';
  let r;try{r=new MediaRecorder(st,mt?{mimeType:mt}:undefined)}catch(e){r=new MediaRecorder(st)}
  const ch=[];r.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  let an=null,raf=0,t0=performance.now();
  try{const c=ac(),src=c.createMediaStreamSource(st);an=c.createAnalyser();an.fftSize=512;src.connect(an);const d=new Uint8Array(an.fftSize);
   const tick=()=>{an.getByteTimeDomainData(d);let m=0;for(const v of d)m=Math.max(m,Math.abs(v-128));onLevel&&onLevel(m/128,(performance.now()-t0)/1000);raf=requestAnimationFrame(tick)};tick()}catch(e){}
  const done=new Promise(ok=>{r.onstop=()=>{cancelAnimationFrame(raf);st.getTracks().forEach(t=>t.stop());ok(new Blob(ch,{type:r.mimeType||mt||'audio/webm'}))}});
  r.start(250);
  res({stop(){if(r.state!=='inactive')r.stop();return done},cancel(){try{r.stop()}catch(e){}cancelAnimationFrame(raf);st.getTracks().forEach(t=>t.stop())},mime:r.mimeType||mt})
 }).catch(err=>rej({name:err.name||'Err',message:micHelp(err)}))})}

/* ---------- Аудио задлах (хуучин Safari-д callback хэлбэр) ---------- */
function decode(blob){return (blob.arrayBuffer?blob.arrayBuffer():new Response(blob).arrayBuffer()).then(ab=>new Promise((ok,no)=>{const c=ac();let fin=false;
 const y=b=>{if(!fin){fin=true;ok(b)}},n=e=>{if(!fin){fin=true;no(e||new Error('decode'))}};
 try{const p=c.decodeAudioData(ab.slice(0),y,n);if(p&&p.then)p.then(y,n)}catch(e){n(e)}}))}
const AUDIO_ACCEPT='audio/*,video/mp4,video/quicktime,video/webm,.mp3,.wav,.m4a,.aac,.ogg,.oga,.opus,.webm,.flac,.mp4,.mov,.3gp,.amr';
function decodeHelp(f){const ext=(f&&f.name||'').split('.').pop().toLowerCase(),E=env();
 if(E.ios&&['ogg','oga','opus','webm'].includes(ext))return `iPhone нь <b>.${ext}</b> файлыг уншиж чаддаггүй. MP3, M4A эсвэл WAV файл сонгоно уу (Telegram-ын дуут мессеж .ogg байдаг).`;
 if(ext==='amr')return '.amr форматыг хөтөч уншдаггүй. Утасныхаа дуу хураагуурын тохиргооноос M4A/MP3 болгож бичнэ үү.';
 return `«${esc(f&&f.name||'файл')}»-ыг уншиж чадсангүй. MP3, M4A, WAV файл ашиглана уу. Файл гэмтсэн эсвэл хэт том (≈30 мин+) байж магадгүй.`}

/* ---------- Хадгалах / хуваалцах ---------- */
function save(blob,name,o={}){const E=env();const file=(()=>{try{return new File([blob],name,{type:blob.type})}catch(e){return null}})();
 const url=URL.createObjectURL(blob);
 const box=document.createElement('div');box.className='mm-save';
 const isImg=/^image\//.test(blob.type),isVid=/^video\//.test(blob.type),isAud=/^audio\//.test(blob.type);
 box.innerHTML=`<div class="mm-card" role="dialog" aria-label="Хадгалах"><b>✅ ${esc(name)} бэлэн боллоо</b><small>${(blob.size/1024/1024).toFixed(2)} МБ</small>
  ${isImg?`<img src="${url}" alt="">`:isVid?`<video src="${url}" controls playsinline></video>`:isAud?`<audio src="${url}" controls></audio>`:''}
  <div class="mm-row"><a class="mm-b" href="${url}" download="${esc(name)}">⬇️ Татаж хадгалах</a>${E.share&&file&&navigator.canShare({files:[file]})?'<button class="mm-b ghost" data-sh>📤 Хуваалцах / Файлд хадгалах</button>':''}${o.toBin?'<button class="mm-b ghost" data-bin>🗂 Медиа санд нэмэх</button>':''}<button class="mm-b ghost" data-x>Хаах</button></div>
  <p class="mm-tip">${E.ios?'💡 iPhone: «Татаж хадгалах» дараад <b>Download</b> → Files апп-д хадгалагдана. Эсвэл «Хуваалцах» → <b>Save to Files / Save Video</b>.':E.inFrame?'💡 Урьдчилан харах цонхонд татах хориотой байж болно — тэр үед «Хуваалцах»-ыг ашиглаарай.':'💡 Татсан файл <b>Downloads (Татсан файлууд)</b> хавтсанд хадгалагдана.'}</p></div>`;
 document.body.appendChild(box);
 const close=()=>{box.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)};
 box.onclick=e=>{if(e.target===box)close()};box.querySelector('[data-x]').onclick=close;
 const sh=box.querySelector('[data-sh]');if(sh)sh.onclick=()=>navigator.share({files:[file],title:name}).catch(()=>{});
 const bi=box.querySelector('[data-bin]');if(bi)bi.onclick=()=>{o.toBin();bi.textContent='✓ Медиа санд нэмэгдлээ';bi.disabled=true}}

/* ---------- Медиа сан (IndexedDB-д хадгалагдана) ---------- */
const L=[],subs=[];let db=null;
const idb=()=>db||(db=new Promise(ok=>{try{const r=indexedDB.open('m10_media',1);r.onupgradeneeded=()=>r.result.createObjectStore('m',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null)}catch(e){ok(null)}}));
const tx=(mode,fn)=>idb().then(d=>{if(!d)return;return new Promise(ok=>{try{const t=d.transaction('m',mode);fn(t.objectStore('m'));t.oncomplete=ok;t.onerror=ok}catch(e){ok()}})});
const emit=()=>subs.forEach(f=>{try{f(L)}catch(e){}});
function add(it){it.id=it.id||('m'+Date.now()+Math.random().toString(36).slice(2,6));it.at=Date.now();it.url=it.blob?URL.createObjectURL(it.blob):'';L.unshift(it);while(L.length>24){const x=L.pop();tx('readwrite',s=>s.delete(x.id))}
 const rec={id:it.id,kind:it.kind,name:it.name,at:it.at,blob:it.blob||null,fps:it.fps||0,frames:it.frames?it.frames.map(c=>c.toDataURL('image/png')):null,dur:it.dur||0};tx('readwrite',s=>s.put(rec));emit();return it}
function remove(id){const i=L.findIndex(x=>x.id===id);if(i>=0)L.splice(i,1);tx('readwrite',s=>s.delete(id));emit()}
const ready=tx('readonly',s=>{const r=s.getAll();r.onsuccess=()=>{(r.result||[]).sort((a,b)=>b.at-a.at).forEach(x=>{if(L.find(y=>y.id===x.id))return;x.url=x.blob?URL.createObjectURL(x.blob):'';if(x.frames){x.frames=x.frames.map(src=>{const im=new Image();im.src=src;return im})}L.push(x)});emit()}});
const KN={audio:'🎙 Аудио',anim:'🎞 Хөдөлгөөнт зураг',video:'🎬 Видео',image:'🖼 Зураг'};
function pick(kinds,cb){kinds=[].concat(kinds);ready.then(()=>{const its=L.filter(x=>kinds.includes(x.kind));const box=document.createElement('div');box.className='mm-save';
 box.innerHTML=`<div class="mm-card"><b>🗂 Медиа сан</b><small>Бусад студид хийсэн бүтээлээ эндээс сонгоно</small>
  ${its.length?`<div class="mm-list">${its.map(x=>`<button class="mm-it" data-id="${x.id}"><span>${KN[x.kind]||''}</span><b>${esc(x.name)}</b><small>${new Date(x.at).toLocaleString('mn-MN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}${x.dur?' · '+x.dur.toFixed(1)+' сек':''}${x.frames?' · '+x.frames.length+' кадр':''}</small></button>`).join('')}</div>`:`<p class="mm-tip">Медиа сан хоосон байна. ${kinds.includes('audio')?'«Аудио засварлагч»-д бичлэг хийгээд <b>«🗂 Медиа санд»</b> товч дарна уу.':'«Хөдөлгөөнт зургийн студи»-д кадраа зураад <b>«🗂 Медиа санд»</b> дарна уу.'}</p>`}
  <div class="mm-row"><button class="mm-b ghost" data-x>Хаах</button></div></div>`;document.body.appendChild(box);
 const close=()=>box.remove();box.onclick=e=>{if(e.target===box)close()};box.querySelector('[data-x]').onclick=close;
 box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const it=L.find(x=>x.id===b.dataset.id);close();if(it)cb(it)})})}
/* Файл сонгогчийг «цэвэрлэх» — ижил файлыг дахин сонгоход onchange ажиллахгүй асуудлыг засна */
const resetInput=el=>{try{el.value=''}catch(e){}};

const css=document.createElement('style');css.textContent=`
.mm-save{position:fixed;inset:0;z-index:200;background:rgba(20,33,61,.55);display:grid;place-items:center;padding:14px;backdrop-filter:blur(2px)}
.mm-card{background:#fffdf8;color:#1d2433;border-radius:16px;border-top:4px solid #c9a54a;max-width:min(520px,100%);width:100%;max-height:90vh;overflow:auto;padding:18px;box-shadow:0 20px 50px #0006;display:flex;flex-direction:column;gap:10px;font:15px/1.5 "PT Sans",system-ui,sans-serif}
.mm-card>b{font:700 19px "PT Serif",Georgia,serif;color:#14213d}.mm-card>small{color:#646a78;margin-top:-8px}
.mm-card img,.mm-card video{max-width:100%;max-height:42vh;border-radius:10px;background:#000;align-self:center}.mm-card audio{width:100%}
.mm-row{display:flex;gap:8px;flex-wrap:wrap}.mm-b{flex:1 1 auto;min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:11px;border:1.5px solid #14213d;background:#14213d;color:#fff!important;font-weight:700;text-decoration:none;cursor:pointer;font-size:15px}
.mm-b.ghost{background:#fff;color:#14213d!important}.mm-b:disabled{opacity:.6}
.mm-tip{font-size:13px;color:#5b6276;margin:0;background:#f6f1e4;border-radius:10px;padding:8px 10px}
.mm-list{display:flex;flex-direction:column;gap:6px}.mm-it{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;text-align:left;padding:10px 12px;border:1.5px solid #e6dfcf;border-radius:11px;background:#fff;cursor:pointer;font:inherit;color:#1d2433}
.mm-it span{grid-row:span 2;font-size:13px;font-weight:700;color:#8a6a1e;align-self:center}.mm-it small{color:#646a78}.mm-it:hover{border-color:#c9a54a;background:#fbf6e9}
.mm-meter{display:flex;align-items:center;gap:10px;background:#fff3f3;border:1.5px solid #e7b3b5;border-radius:12px;padding:10px 12px;margin:10px 12px 0}
.mm-meter i{flex:1;height:12px;background:#f1e1e1;border-radius:6px;overflow:hidden;position:relative}.mm-meter i em{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#2b6e4f,#e9c46a 70%,#c1121f);border-radius:6px;transition:width .08s}
.mm-meter b{font:700 16px "PT Mono",monospace;color:#9b2226;min-width:52px}.mm-dot{width:12px;height:12px;border-radius:50%;background:#c1121f;animation:mmb 1s infinite}@keyframes mmb{50%{opacity:.25}}
.mm-choice{margin:10px 12px 0;padding:12px;border-radius:12px;background:#fbf6e9;border:1.5px solid #e2cf9c;display:flex;flex-direction:column;gap:8px}.mm-choice .mm-row .mm-b{min-height:42px;font-size:14px}
`;document.head.appendChild(css);
window.MM={ac,unlock,env,recorder,decode,decodeHelp,AUDIO_ACCEPT,save,micHelp,resetInput,pick,bin:{add,remove,list:()=>L,ready,on:f=>subs.push(f)}};
})();
