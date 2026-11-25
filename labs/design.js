/* ===== Загвар бүтээгч: урилга, нэрийн хуудас, өргөмжлөл, номын нүүр → PNG ===== */
(function(){
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PAL=[['Солонго',['#e63946','#f4a261','#2a9d8f','#264653','#fff8ec']],['Тэнгис',['#0077b6','#00b4d8','#90e0ef','#03045e','#f1faff']],['Цэцэрлэг',['#2d6a4f','#95d5b2','#f9c74f','#1b4332','#fbfff7']],['Чихэр',['#ff70a6','#ff9770','#ffd670','#7a3e65','#fff5fa']],['Шөнө',['#ffd166','#06d6a0','#118ab2','#073b4c','#0b2733']],['Алтан',['#b08d3a','#e9d39a','#7b2d3b','#14213d','#fffaf0']]];
const DECO=['★','✿','♥','●','◆','☀','✦','♪'];
const T={
 invite:{n:'💌 Урилга',w:900,h:1260,f:[['t','Гарчиг','ТӨРСӨН ӨДРИЙН ЁСЛОЛ'],['to','Хэнд','Хайрт найз Саруулдаа'],['what','Юунд','Миний 13 насны төрсөн өдөр'],['when','Хэзээ','2026 оны 12 сарын 15, 17:00'],['where','Хаана','Манай гэр, 3-р хороолол'],['from','Хэн урьсан','Найз чинь Тэмүүлэн']]},
 card:{n:'🪪 Нэрийн хуудас',w:1050,h:600,f:[['name','Нэр','Б. Тэмүүлэн'],['role','Албан тушаал / мэргэжил','Сансрын нисгэгч (ирээдүйд)'],['org','Байгууллага / анги','130 дугаар сургууль, 7А анги'],['tel','Утас','9911-0000'],['mail','Имэйл','temuulen@school.mn']]},
 award:{n:'🏆 Өргөмжлөл',w:1400,h:990,f:[['t','Гарчиг','ӨРГӨМЖЛӨЛ'],['to','Хэнд','Б. Саруулд'],['why','Юуны төлөө','Хичээлийн жилд идэвх зүтгэл гарган, ангийнхандаа үлгэр дууриал үзүүлсэн тул'],['date','Огноо','2026 оны 12 сарын 25'],['sign','Гарын үсэг','Ангийн багш ................']]},
 book:{n:'📕 Номын нүүр',w:900,h:1260,f:[['t','Номын нэр','Зоригтой бяцхан хулгана'],['sub','Дэд гарчиг','Найрамдлын тухай үлгэр'],['by','Зохиогч','Б. Тэмүүлэн'],['pub','Хэвлэл','130 дугаар сургууль · 2026']]}};
const KEY='designlab';
function mount(el,o={}){let tpl=o.tpl&&T[o.tpl]?o.tpl:'invite';let mem={};try{mem=JSON.parse(localStorage.getItem((window.SYNC_PREFIX||'')+KEY)||'{}')}catch(e){}
 const st=()=>mem[tpl]||(mem[tpl]={pal:0,deco:0,shape:0,img:null,v:Object.fromEntries(T[tpl].f.map(f=>[f[0],f[2]]))});
 const save=()=>{try{const c=JSON.parse(JSON.stringify(mem));Object.values(c).forEach(x=>x.img=null);localStorage.setItem((window.SYNC_PREFIX||'')+KEY,JSON.stringify(c))}catch(e){}};
 let bgImg={};
 const loadBg=(src,cb)=>{if(bgImg[src])return cb(bgImg[src]);const im=new Image();im.onload=()=>{bgImg[src]=im;cb(im)};im.onerror=()=>cb(null);im.src=src};
 const ui=()=>{const S=st(),D=T[tpl];
  el.innerHTML=`<div class="dsg"><div class="dsg-tpl">${Object.entries(T).map(([k,t])=>`<button class="${k===tpl?'on':''}" data-tpl="${k}">${t.n}</button>`).join('')}</div>
  <div class="dsg-main"><div class="dsg-side">
   ${D.f.map(f=>`<label>${f[1]}</label>${f[0]==='why'?`<textarea data-f="${f[0]}" rows="3">${esc(S.v[f[0]])}</textarea>`:`<input data-f="${f[0]}" value="${esc(S.v[f[0]])}" autocomplete="off">`}`).join('')}
   <label>Өнгөний хослол</label><div class="dsg-pal">${PAL.map((p,i)=>`<button class="${S.pal===i?'on':''}" data-pal="${i}" title="${p[0]}">${p[1].slice(0,4).map(c=>`<i style="background:${c}"></i>`).join('')}</button>`).join('')}</div>
   <label>Чимэглэл</label><div class="dsg-deco">${DECO.map((d,i)=>`<button class="${S.deco===i?'on':''}" data-deco="${i}">${d}</button>`).join('')}</div>
   ${tpl==='award'?`<label>Хүрээ</label><div class="dsg-deco">${['Алтан','Мөнгөн','Хүрэл','Энгийн'].map((d,i)=>`<button class="${S.shape===i?'on':''}" data-shape="${i}">${d}</button>`).join('')}</div>`:`<label>Хэлбэр</label><div class="dsg-deco">${['Долгион','Тойрог','Тууз'].map((d,i)=>`<button class="${S.shape===i?'on':''}" data-shape="${i}">${d}</button>`).join('')}</div>`}
   <label>Өөрийн зураг (заавал биш)</label><input type="file" accept="image/*" class="dsg-file">
  </div><div class="dsg-pv"><canvas width="${D.w}" height="${D.h}"></canvas><div class="dsg-act"><button class="dsg-btn" data-a="png">PNG болгон хадгалах</button><button class="dsg-btn gh" data-a="reset">Анхны бичвэр</button></div><div class="dsg-msg" role="status"></div></div></div></div>`;
  el.querySelectorAll('[data-tpl]').forEach(b=>b.onclick=()=>{tpl=b.dataset.tpl;ui()});
  el.querySelectorAll('[data-f]').forEach(i=>i.oninput=()=>{S.v[i.dataset.f]=i.value;save();paint()});
  el.querySelectorAll('[data-pal]').forEach(b=>b.onclick=()=>{S.pal=+b.dataset.pal;save();ui()});
  el.querySelectorAll('[data-deco]').forEach(b=>b.onclick=()=>{S.deco=+b.dataset.deco;save();ui()});
  el.querySelectorAll('[data-shape]').forEach(b=>b.onclick=()=>{S.shape=+b.dataset.shape;save();ui()});
  el.querySelector('.dsg-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{S.img=im;paint()};im.src=r.result};r.readAsDataURL(f)};
  el.querySelector('[data-a=reset]').onclick=()=>{delete mem[tpl];save();ui()};
  el.querySelector('[data-a=png]').onclick=()=>{const c=el.querySelector('canvas');c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download={invite:'urilga',card:'neriin_huudas',award:'urgumjlul',book:'nomyn_nuur'}[tpl]+'.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);
   const m=el.querySelector('.dsg-msg');m.textContent='Хадгаллаа! Файл «Downloads» хавтсанд орсон. Word, PowerPoint-доо Insert → Picture-ээр оруулж болно.';if(o.onSave)o.onSave(tpl)},'image/png')};
  paint()};
 const wrap=(x,txt,cx,y,maxW,lh)=>{const w=String(txt).split(' ');let line='',yy=y;for(const t of w){const test=line?line+' '+t:t;if(x.measureText(test).width>maxW&&line){x.fillText(line,cx,yy);line=t;yy+=lh}else line=test}x.fillText(line,cx,yy);return yy};
 const paint=()=>{const c=el.querySelector('canvas');if(!c)return;const x=c.getContext('2d'),S=st(),D=T[tpl],[a,b,g,ink,bg]=PAL[S.pal][1],W=D.w,H=D.h,v=S.v,dc=DECO[S.deco];
  x.clearRect(0,0,W,H);x.fillStyle=bg;x.fillRect(0,0,W,H);x.textAlign='center';x.textBaseline='alphabetic';
  const F=(s,w,fam)=>`${w||'bold'} ${s}px ${fam||'Georgia, "PT Serif", serif'}`;
  const decoRow=(y,n,size,col)=>{x.font=`${size}px sans-serif`;x.fillStyle=col;for(let i=0;i<n;i++)x.fillText(dc,W*(i+.5)/n,y)};
  const shapes=()=>{if(S.shape===0){x.fillStyle=a;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*.12);for(let i=10;i>=0;i--)x.lineTo(W*i/10,H*.12+(i%2?24:0));x.fill();x.fillStyle=g;x.beginPath();x.moveTo(0,H);x.lineTo(W,H);x.lineTo(W,H*.9);for(let i=10;i>=0;i--)x.lineTo(W*i/10,H*.9-(i%2?24:0));x.fill()}
   else if(S.shape===1){[[0,0,a],[W,H,g],[W,0,b],[0,H,b]].forEach(([px,py,col],i)=>{x.globalAlpha=.85;x.fillStyle=col;x.beginPath();x.arc(px,py,Math.min(W,H)*(i<2?.28:.14),0,7);x.fill()});x.globalAlpha=1}
   else{x.fillStyle=a;x.fillRect(0,H*.06,W,H*.05);x.fillStyle=g;x.fillRect(0,H*.89,W,H*.05)}};
  const photo=(px,py,pw,ph,round)=>{if(!S.img)return;x.save();x.beginPath();if(round)x.arc(px+pw/2,py+ph/2,Math.min(pw,ph)/2,0,7);else x.rect(px,py,pw,ph);x.clip();const r=Math.max(pw/S.img.width,ph/S.img.height);x.drawImage(S.img,px+(pw-S.img.width*r)/2,py+(ph-S.img.height*r)/2,S.img.width*r,S.img.height*r);x.restore()};
  if(tpl==='invite'){shapes();x.strokeStyle=ink;x.lineWidth=6;x.strokeRect(40,40,W-80,H-80);decoRow(230,7,46,b);
   x.fillStyle=ink;x.font=F(64);wrap(x,v.t,W/2,330,W-180,74);x.font=F(34,'italic');x.fillStyle=a;x.fillText(v.to,W/2,470);
   photo(W/2-150,510,300,300,true);const y0=S.img?870:560;x.fillStyle=ink;x.font=F(40);wrap(x,v.what,W/2,y0,W-200,50);
   x.font=F(32,'normal','Arial, sans-serif');x.fillText('Хэзээ: '+v.when,W/2,y0+110);x.fillText('Хаана: '+v.where,W/2,y0+160);
   x.font=F(30,'italic');x.fillStyle=a;x.fillText(v.from,W/2,H-150);decoRow(H-90,9,30,g)}
  if(tpl==='card'){x.fillStyle=ink;x.fillRect(0,0,330,H);x.fillStyle=a;x.fillRect(330,0,14,H);photo(65,110,200,200,true);if(!S.img){x.fillStyle=b;x.beginPath();x.arc(165,210,100,0,7);x.fill();x.fillStyle=ink;x.font='bold 90px Georgia';x.fillText((v.name.trim().split(/\s+/).pop()||'?')[0],165,242)}
   x.fillStyle=bg;x.font='44px sans-serif';x.fillText(dc+' '+dc+' '+dc,165,440);
   x.textAlign='left';x.fillStyle=ink;x.font=F(60);x.fillText(v.name,390,170);x.fillStyle=a;x.font=F(32,'italic');wrap(x,v.role,390,230,620,40);
   x.fillStyle=ink;x.font=F(28,'normal','Arial, sans-serif');x.fillText(v.org,390,330);x.fillRect(390,360,600,3);x.font=F(30,'normal','Arial, sans-serif');x.fillText('☎  '+v.tel,390,430);x.fillText('✉  '+v.mail,390,490)}
  if(tpl==='book'){x.fillStyle=a;x.fillRect(0,0,W,H);x.fillStyle=ink;x.fillRect(0,0,70,H);x.fillStyle=g;x.fillRect(70,0,10,H);
   decoRow(120,6,52,b);photo(170,300,640,480,false);if(!S.img){x.fillStyle=bg;x.globalAlpha=.9;x.beginPath();x.arc(490,560,220,0,7);x.fill();x.globalAlpha=1;x.font='200px sans-serif';x.fillStyle=g;x.fillText(dc,490,630)}
   x.fillStyle=bg;x.font=F(72);wrap(x,v.t,490,220,700,80);x.font=F(34,'italic');x.fillText(v.sub,490,860);x.font=F(40);x.fillText(v.by,490,980);
   x.font=F(26,'normal','Arial, sans-serif');x.fillText(v.pub,490,H-80)}
  if(tpl==='award'){const fr=['labs/img/award_gold.jpg','labs/img/award_silver.jpg','labs/img/award_bronze.jpg'][S.shape];
   const body=()=>{x.textAlign='center';x.fillStyle=ink;x.font=F(96);x.fillText(v.t,W*.56,250);decoRow(310,9,30,a);x.font=F(54,'italic');x.fillStyle=a;x.fillText(v.to,W*.56,420);
    x.fillStyle=ink;x.font=F(36,'normal');wrap(x,v.why,W*.56,500,W*.62,50);x.font=F(30,'normal','Arial, sans-serif');x.textAlign='left';x.fillText(v.date,W*.3,H-150);x.textAlign='right';x.fillText(v.sign,W*.88,H-150);x.textAlign='center';photo(W*.04,H*.36,220,220,true)};
   if(fr&&S.shape<3)loadBg(fr,im=>{if(im)x.drawImage(im,0,0,W,H);else{x.strokeStyle=a;x.lineWidth=14;x.strokeRect(30,30,W-60,H-60)}body()});else{x.strokeStyle=a;x.lineWidth=14;x.strokeRect(30,30,W-60,H-60);x.strokeStyle=g;x.lineWidth=4;x.strokeRect(56,56,W-112,H-112);body()}}
 };
 ui()}
window.DesignLab={mount};
})();
