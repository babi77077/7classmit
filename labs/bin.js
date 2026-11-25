/* ===== Хоёртын лаборатори: гэрлийн чийдэн, үсгийн код, мэдээллийн хэмжээ ===== */
(function(){
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TASKS=[{id:'b1',t:'5',n:5},{id:'b2',t:'10',n:10},{id:'b3',t:'13',n:13},{id:'b4',t:'25',n:25},{id:'b5',t:'100',n:100},{id:'b6',t:'255',n:255}];
const UNITS=[['Бит',1/8],['Байт',1],['КБ',1024],['МБ',1024**2],['ГБ',1024**3],['ТБ',1024**4]];
const ITEMS=[['Дуу (mp3)',4,'МБ'],['Гэрэл зураг',3,'МБ'],['Кино (HD)',2,'ГБ'],['Ном (pdf)',5,'МБ'],['Хичээлийн видео',300,'МБ'],['Бичвэр (1 хуудас)',2,'КБ']];
const DEV=[['Флаш 16 ГБ',16,'ГБ'],['Утас 64 ГБ',64,'ГБ'],['Утас 128 ГБ',128,'ГБ'],['Зөөврийн диск 1 ТБ',1,'ТБ'],['CD 700 МБ',700,'МБ']];
const toB=(v,u)=>v*UNITS.find(x=>x[0]===u)[1];
function mount(el,o={}){const solved=Object.assign({},o.solved||{});let tab=o.tab||'bulb',bits=[0,0,0,0,0,0,0,0];
 const draw=()=>{const val=bits.reduce((s,b,i)=>s+b*(128>>i),0);
  el.innerHTML=`<div class="bnl"><div class="bn-tabs">${[['bulb','💡 Чийдэн'],['text','🔤 Үсэг'],['units','💾 Хэмжээ']].map(([k,t])=>`<button class="${tab===k?'on':''}" data-t="${k}">${t}</button>`).join('')}</div>
  ${tab==='bulb'?`<p class="bn-p">Чийдэн дээр дарж асаа (1), унтраа (0). Асаалттай чийдэнгийн тоонуудыг нэмбэл аравтын тоо гарна.</p>
   <div class="bn-row">${bits.map((b,i)=>`<button class="bn-b ${b?'on':''}" data-i="${i}" aria-label="${128>>i}"><span class="bn-bulb"></span><b>${128>>i}</b><small>${b}</small></button>`).join('')}</div>
   <div class="bn-res"><div><small>Хоёртын</small><b>${bits.join('')}</b></div><div><small>Аравтын</small><b>${val}</b></div><div><small>Тооцоо</small><b class="bn-calc">${bits.map((b,i)=>b?(128>>i):null).filter(x=>x!==null).join(' + ')||'0'}</b></div></div>
   <div class="bn-row2"><button class="bn-x" data-a="clr">Бүгдийг унтраах</button><button class="bn-x" data-a="all">Бүгдийг асаах</button></div>
   <h4>Даалгавар: дараах тоог чийдэнгээр үүсгэ</h4><div class="bn-tasks">${TASKS.map(t=>`<span class="bn-tk ${solved[t.id]?'ok':''}">${solved[t.id]?'★':'☆'} ${t.t}</span>`).join('')}</div>`:''}
  ${tab==='text'?`<p class="bn-p">Компьютер үсэг бүрийг тоон кодоор хадгалдаг (A = 65 = 01000001). Латин үсгээр бичиж хоёртын кодыг нь хар, эсвэл кодыг үсэг болго.</p>
   <label>Бичвэр (латин үсэг)</label><input class="bn-in" id="bntx" maxlength="12" value="HI" autocomplete="off">
   <div class="bn-codes" id="bncodes"></div>
   <label style="margin-top:12px">Хоёртын код (8 битээр, зайгаар тусгаарла)</label><input class="bn-in" id="bnbin" value="01001000 01001001" autocomplete="off"><div class="bn-res"><div><small>Үсэг</small><b id="bndec">HI</b></div></div>`:''}
  ${tab==='units'?`<p class="bn-p">Төхөөрөмжид хэдэн файл багтахыг тооцоол. 1 КБ = 1024 байт, 1 МБ = 1024 КБ, 1 ГБ = 1024 МБ, 1 ТБ = 1024 ГБ.</p>
   <div class="bn-grid"><div><label>Төхөөрөмж</label><select id="bndev">${DEV.map((d,i)=>`<option value="${i}">${d[0]}</option>`).join('')}</select></div><div><label>Файл</label><select id="bnit">${ITEMS.map((d,i)=>`<option value="${i}">${d[0]} — ${d[1]} ${d[2]}</option>`).join('')}</select></div></div>
   <div class="bn-res"><div><small>Багтах тоо</small><b id="bnfit">—</b></div><div><small>Тооцоо</small><b class="bn-calc" id="bnhow">—</b></div></div>
   <h4>Нэгж хөрвүүлэгч</h4><div class="bn-grid"><div><label>Утга</label><input class="bn-in" id="bnv" type="number" value="2" min="0"></div><div><label>Нэгж</label><select id="bnu">${UNITS.map(u=>`<option ${u[0]==='ГБ'?'selected':''}>${u[0]}</option>`).join('')}</select></div></div>
   <div class="bn-conv" id="bnconv"></div>`:''}</div>`;
  el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
  el.querySelectorAll('.bn-b').forEach(b=>b.onclick=()=>{bits[+b.dataset.i]^=1;check();draw()});
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{bits=bits.map(()=>b.dataset.a==='all'?1:0);check();draw()});
  if(tab==='text'){const tx=el.querySelector('#bntx'),bn=el.querySelector('#bnbin'),cd=el.querySelector('#bncodes'),dc=el.querySelector('#bndec');
   const up=()=>{cd.innerHTML=[...tx.value].map(c=>{const k=c.charCodeAt(0);return `<div class="bn-cd"><b>${esc(c)}</b><small>${k}</small><code>${k<256?k.toString(2).padStart(8,'0'):'—'}</code></div>`}).join('')};
   const up2=()=>{dc.textContent=bn.value.trim().split(/\s+/).filter(Boolean).map(b=>/^[01]{1,8}$/.test(b)?String.fromCharCode(parseInt(b,2)):'?').join('')};
   tx.oninput=up;bn.oninput=up2;up();up2()}
  if(tab==='units'){const dv=el.querySelector('#bndev'),it=el.querySelector('#bnit'),f=el.querySelector('#bnfit'),h=el.querySelector('#bnhow');
   const up=()=>{const D=DEV[dv.value],I=ITEMS[it.value],n=Math.floor(toB(D[1],D[2])/toB(I[1],I[2]));f.textContent=n.toLocaleString('en-US').replace(/,/g,' ');h.textContent=`${D[1]} ${D[2]} ÷ ${I[1]} ${I[2]}`};
   dv.onchange=up;it.onchange=up;up();
   const v=el.querySelector('#bnv'),u=el.querySelector('#bnu'),c=el.querySelector('#bnconv');
   const up3=()=>{const b=toB(+v.value||0,u.value);c.innerHTML=UNITS.map(x=>`<div><small>${x[0]}</small><b>${(b/x[1]).toLocaleString('en-US',{maximumFractionDigits:4}).replace(/,/g,' ')}</b></div>`).join('')};
   v.oninput=up3;u.onchange=up3;up3()}};
 const check=()=>{const val=bits.reduce((s,b,i)=>s+b*(128>>i),0);const t=TASKS.find(x=>x.n===val&&!solved[x.id]);if(t){solved[t.id]=1;if(o.onSolve)o.onSolve(t.id,3)}};
 draw()}
window.BinLab={mount,TASKS:TASKS.map(t=>({id:t.id,t:'Хоёртын тоо: '+t.t}))};
})();
