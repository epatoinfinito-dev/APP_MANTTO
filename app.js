'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3000)};
/* ---- almacenamiento local (IndexedDB) ---- */
const DB=new Promise((ok,no)=>{const r=indexedDB.open('reportes-inst',1);r.onupgradeneeded=()=>r.result.createObjectStore('r',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const tx=async(m,f)=>{const d=await DB;return new Promise((ok,no)=>{const t=d.transaction('r',m),q=f(t.objectStore('r'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})};
const dbPut=r=>tx('readwrite',s=>s.put(r)),dbGet=id=>tx('readonly',s=>s.get(id)),dbAll=()=>tx('readonly',s=>s.getAll()),dbDel=id=>tx('readwrite',s=>s.delete(id));
/* ---- campos ---- */
const K=['aviso','orden','esp','grupo','planta','otra','tag','desc','d1','t1','d2','t2','d3','t3','obst','causa','estado','diag','trab','rep','critsi','critno','ingsi','ingno','sup','obsg'];
const fields=()=>$$('main section input, main section select, main section textarea').filter(e=>e.type!=='file'&&!e.closest('#thumbs'));
fields().forEach((e,i)=>e.dataset.k=K[i]);
const V=()=>Object.fromEntries(fields().map(e=>[e.dataset.k,e.type==='radio'?e.checked:e.value]));
const setV=v=>fields().forEach(e=>{const x=v[e.dataset.k];if(x===undefined)return;if(e.type==='radio')e.checked=!!x;else e.value=x});
const DEF=V();
/* ---- tiempos ---- */
const dt=i=>{const d=$('#d'+i).value,t=$('#t'+i).value;return d&&t?new Date(d+'T'+t):null};
const tmv=()=>{const a=dt(1),b=dt(2),c=dt(3);return{total:a&&c&&c>=a?c-a:null,neto:b&&c&&c>=b?c-b:null}};
const fmt=ms=>ms==null?'— h — min':Math.floor(ms/36e5)+' h '+Math.floor(ms%36e5/6e4)+' min';
function calc(){const t=tmv();$('#o1').textContent=fmt(t.total);$('#o2').textContent=fmt(t.neto)}
/* ---- estado del reporte ---- */
let cur={id:null,fotos:[],sig:[null,null]},touched=false,tmr;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const updTitle=()=>{const v=V();$('#ptitle').textContent='REGISTRO FOTOGRÁFICO · AVISO '+(v.aviso||'#')+' · TAG '+(v.tag||'—')};
function renderThumbs(){const box=$('#thumbs');box.textContent='';$('#empty').hidden=!!cur.fotos.length;
 cur.fotos.forEach((f,i)=>{const th=document.createElement('div');th.className='th';const im=document.createElement('div');im.className='img';im.style.backgroundImage='url('+f.src+')';
  const x=document.createElement('button');x.type='button';x.className='x';x.textContent='×';x.setAttribute('aria-label','Quitar foto '+(i+1));x.onclick=()=>{cur.fotos.splice(i,1);renderAll();dirty()};im.append(x);
  const inp=document.createElement('input');inp.placeholder='Descripción de la foto '+(i+1);inp.value=f.cap||'';inp.oninput=()=>{f.cap=inp.value;renderCol()};th.append(im,inp);box.append(th)})}
function renderCol(){const l=cur.fotos.length?cur.fotos:[1,2,3,4].map(i=>({src:'',cap:'Foto '+i})),c=$('#col');c.style.gridTemplateColumns=cur.fotos.length===1?'1fr':'repeat(2,1fr)';c.textContent='';
 l.forEach(f=>{const e=document.createElement('div');e.className='c';if(f.src)e.style.backgroundImage='url('+f.src+')';const i=document.createElement('i');i.textContent=f.cap||'';e.append(i);c.append(e)})}
const renderAll=()=>{renderThumbs();renderCol();updTitle()};
function dirty(){touched=true;updTitle();calc();clearTimeout(tmr);tmr=setTimeout(save,500)}
async function save(){if(!touched)return;try{await dbPut({id:cur.id,v:V(),fotos:cur.fotos,sig:cur.sig,t:Date.now()});localStorage.setItem('ultimo',cur.id);$('#stat').textContent='Guardado '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}catch(e){$('#stat').textContent='No se pudo guardar'}}
function load(r){cur={id:r.id,fotos:r.fotos||[],sig:r.sig||[null,null]};setV(Object.assign({},DEF,r.v));$('#planta-otra').hidden=$('#planta').value!=='Otra';touched=false;calc();renderAll();showSig(0);showSig(1);localStorage.setItem('ultimo',cur.id)}
const newRep=()=>{load({id:uid(),v:DEF,fotos:[],sig:[null,null]});scrollTo(0,0)};
document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('main'))dirty()});
$('#planta').onchange=e=>{const o=$('#planta-otra');o.hidden=e.target.value!=='Otra';if(!o.hidden)o.focus()};
/* ---- fotos ---- */
const shrink=f=>new Promise(ok=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const k=Math.min(1,1400/Math.max(im.width,im.height)),w=Math.round(im.width*k),h=Math.round(im.height*k),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);URL.revokeObjectURL(u);ok({src:c.toDataURL('image/jpeg',.78),w,h,cap:''})};im.onerror=()=>ok(null);im.src=u});
async function add(files){for(const f of files){const p=await shrink(f);if(p)cur.fotos.push(p)}renderAll();dirty()}
['cam','gal'].forEach(i=>$('#'+i).onchange=e=>{const f=[...e.target.files];e.target.value='';add(f)});
/* ---- firmas ---- */
const cvs=$$('.sig canvas'),ctxs=cvs.map(c=>c.getContext('2d'));
cvs.forEach((c,i)=>{const r=c.getBoundingClientRect(),x=ctxs[i];c.width=r.width;c.height=r.height;x.lineWidth=2.4;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#111';let d=false;
 const p=e=>{const b=c.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 c.onpointerdown=e=>{d=true;x.beginPath();x.moveTo(...p(e));c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(d){x.lineTo(...p(e));x.stroke()}};
 c.onpointerup=()=>{if(d){d=false;cur.sig[i]=c.toDataURL('image/png');dirty()}};
 $$('.clr')[i].onclick=()=>{x.clearRect(0,0,c.width,c.height);cur.sig[i]=null;dirty()}});
function showSig(i){const c=cvs[i],x=ctxs[i];x.clearRect(0,0,c.width,c.height);if(cur.sig[i]){const im=new Image();im.onload=()=>x.drawImage(im,0,0,c.width,c.height);im.src=cur.sig[i]}}
/* ---- lista de reportes ---- */
async function lista(){const l=(await dbAll()).sort((a,b)=>b.t-a.t),box=$('#lista');box.textContent='';if(!l.length){box.textContent='Aún no hay reportes guardados.';return}
 l.forEach(r=>{const row=document.createElement('div');row.className='ri';const b=document.createElement('button');b.type='button';b.className='open';
  const t=document.createElement('b');t.textContent='Aviso '+(r.v.aviso||'—')+' · '+(r.v.tag||'sin TAG');
  const s=document.createElement('small');s.textContent=(r.v.planta==='Otra'?(r.v.otra||'Otra'):r.v.planta)+' · '+new Date(r.t).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'})+(r.id===cur.id?' · abierto':'');
  b.append(t,s);b.onclick=()=>{load(r);$('#dlg').close()};
  const x=document.createElement('button');x.type='button';x.className='del';x.textContent='Eliminar';
  x.onclick=async()=>{if(confirm('¿Eliminar este reporte del dispositivo?')){await dbDel(r.id);if(r.id===cur.id)newRep();lista()}};row.append(b,x);box.append(row)})}
$('#open').onclick=async()=>{await save();await lista();$('#dlg').showModal()};
$('#nuevo').onclick=async()=>{await save();newRep();$('#dlg').close()};
$('#cerrar').onclick=()=>$('#dlg').close();
$('#save').onclick=async()=>{await save();toast('Reporte guardado en este dispositivo')};
/* ---- PDF ---- */
$('#pdf').onclick=async()=>{
 if(!window.jspdf||!window.buildPdf){toast('Falta cargar el generador de PDF. Conéctese a internet una vez y reintente.');return}
 const b=$('#pdf');b.disabled=true;b.textContent='Generando…';
 try{touched=true;await save();const v=V(),d=new window.jspdf.jsPDF({unit:'pt',format:'letter'});window.buildPdf(d,v,cur.fotos,cur.sig,tmv());
  d.save(('Reporte_'+(v.aviso||'sin-aviso')+'_'+(v.tag||'')+'_'+new Date().toISOString().slice(0,10)).replace(/[^\w\-]+/g,'_')+'.pdf');toast('PDF generado')}
 catch(e){console.error(e);toast('No se pudo generar el PDF')}
 b.disabled=false;b.textContent='Generar PDF'};
/* ---- instalación PWA ---- */
let ip=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;$('#inst').hidden=false});
$('#ib').onclick=async()=>{if(ip){ip.prompt();await ip.userChoice;ip=null}$('#inst').hidden=true};
$('#ix').onclick=()=>$('#inst').hidden=true;
if(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone){$('#inst span').textContent='📲 En iPhone: toque Compartir y luego “Agregar a pantalla de inicio”.';$('#ib').hidden=true;$('#inst').hidden=false}
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
/* ---- navegación por secciones ---- */
const links=$$('nav a'),io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-30% 0px -60% 0px'});
$$('section').forEach(s=>io.observe(s));
/* ---- arranque ---- */
(async()=>{try{const id=localStorage.getItem('ultimo'),r=id&&await dbGet(id);r?load(r):newRep()}catch(e){newRep()}})();
