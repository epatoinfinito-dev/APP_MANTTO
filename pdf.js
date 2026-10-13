(function(){
const S=.9;
const clean=s=>String(s==null?'':s).replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018-\u201D\u2022\n]/g,'');
window.buildPdf=function(d,v,fotos,sig,tm){
 const X=p=>p*S,L=72,W=586,LH=10.2;let Y=42;
 d.setLineWidth(.7);d.setDrawColor(0);d.setTextColor(0);d.setFillColor(255,255,255);
 const R=(x,y,w,h,f)=>{if(f){d.setFillColor(217,217,217);d.rect(X(x),X(y),X(w),X(h),'FD');d.setFillColor(255,255,255)}else d.rect(X(x),X(y),X(w),X(h),'S')};
 const T=(s,x,y,sz,b,al)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(sz);d.text(clean(s),X(x),X(y),al?{align:al}:undefined)};
 const fit=(s,w,sz)=>{s=clean(s).replace(/\n/g,' ');d.setFont('helvetica','normal');let z=sz;d.setFontSize(z);while(d.getTextWidth(s)>X(w)&&z>5){z-=.5;d.setFontSize(z)}while(d.getTextWidth(s)>X(w)&&s.length>1)s=s.slice(0,-1);return[s,z]};
 const TV=(lab,val,x,y,w,sz)=>{sz=sz||7.5;T(lab,x,y,sz,1);d.setFont('helvetica','bold');d.setFontSize(sz);const lw=d.getTextWidth(lab)/S+3;const r=fit(val,w-lw-8,8.5);d.setFont('helvetica','normal');d.setFontSize(r[1]);d.text(r[0],X(x+lw),X(y))};
 const ensure=h=>{if(Y+h>834){d.addPage();Y=42}};
 const band=t=>{ensure(21);R(L,Y,W,21,1);T(t,L+W/2,Y+14,7.5,1,'center');Y+=21};
 const wrap=(s,w)=>d.splitTextToSize(clean(s),X(w));
 function row(lab,val,minH,inline){
  d.setFont('helvetica','bold');d.setFontSize(7.5);const lw=d.getTextWidth(lab)/S+4;
  d.setFont('helvetica','normal');d.setFontSize(8.5);
  const ls=val?wrap(val,W-14):[];
  const inl=inline&&ls.length===1&&d.getTextWidth(ls[0])<=X(W-lw-10);
  const h=Math.max(minH,inl?minH:16+ls.length*LH);
  ensure(h);R(L,Y,W,h);T(lab,L+5,Y+11.5,7.5,1);
  d.setFont('helvetica','normal');d.setFontSize(8.5);
  if(inl)d.text(ls[0],X(L+lw+5),X(Y+11.5));else ls.forEach((s,i)=>d.text(s,X(L+5),X(Y+23+i*LH)));
  Y+=h}
 const plant=v.planta==='Otra'?(v.otra||'Otra'):v.planta;
 // Encabezado
 R(72,Y,207,63);R(279,Y,226,27);R(279,Y+27,226,36);R(505,Y,153,27);R(505,Y+27,153,36);
 T('REPORTE DE EJECUCIÓN',392,Y+12,7.5,1,'center');T('GERENCIA DE MANTENIMIENTO',392,Y+23,7.5,1,'center');
 T('ESPECIALIDAD:  M-INST',284,Y+43,6.5);T('GRUPO: '+(v.grupo||''),284,Y+54,6.5);
 TV('AVISO:',510,Y+17,148);
 T('ORDEN DE TRABAJO',510,Y+38,7.5,1);{const r=fit(v.orden,143,8.5);d.setFont('helvetica','normal');d.setFontSize(r[1]);d.text(r[0],X(510),X(Y+53))}
 {const r=fit(v.aviso,100,8.5);d.setFont('helvetica','normal');d.setFontSize(r[1]);d.text(r[0],X(510+d.getTextWidth('AVISO:')/S+3),X(Y+17))}
 Y+=63;
 R(72,Y,207,22);R(279,Y,126,22);R(405,Y,253,22);
 TV('PLANTA:',77,Y+14,200);TV('TAG:',284,Y+14,120);TV('DESCRIPCIÓN:',410,Y+14,246);Y+=22;
 // Tiempo
 band('INFORMACIÓN DE TIEMPO');
 const G=[[72,[25,30,28,99],182],[254,[25,30,28,114],197],[451,[25,30,29,123],207]];
 const tt=[['Fecha y Hora de Salida de Servicio'],['Fecha y Hora de Inicio de','Mantenimiento'],['Fecha y Hora de Entrega a Procesos']];
 G.forEach((g,i)=>{R(g[0],Y,g[2],29);tt[i].forEach((t,k)=>T(t,g[0]+g[2]/2,Y+(tt[i].length>1?12+k*10:18),7.5,1,'center'))});Y+=29;
 const ks=[['d1','t1'],['d2','t2'],['d3','t3']];
 const dp=(a,b)=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(a||'');return m?[m[3],m[2],m[1].slice(2),b||'']:['','','',b||'']};
 [13,17].forEach((h,r)=>{G.forEach((g,i)=>{let x=g[0];const p=r?dp(v[ks[i][0]],v[ks[i][1]]):['DD','MM','AA','HORA'];g[1].forEach((w,j)=>{R(x,Y,w,h);if(p[j])T(p[j],x+w/2,Y+(r?12:9.5),r?7.5:6,0,'center');x+=w})});Y+=h});
 const hm=ms=>ms==null?['','']:[String(Math.floor(ms/36e5)),String(Math.floor(ms%36e5/6e4))];
 const a=hm(tm&&tm.total),b=hm(tm&&tm.neto);
 R(72,Y,148,31);T('Tiempo Total fuera de servicio',77,Y+19,7.5,1);R(352,Y,197,31);T('Tiempo Neto de Mantenimiento',357,Y+19,7.5,1);
 [[220,67,'Horas',a[0]],[287,65,'Minutos',a[1]],[549,56,'Horas',b[0]],[605,53,'Minutos',b[1]]].forEach(c=>{R(c[0],Y,c[1],15);T(c[2],c[0]+c[1]/2,Y+11,7.5,1,'center');R(c[0],Y+15,c[1],16);T(c[3],c[0]+c[1]/2,Y+26.5,8.5,1,'center')});Y+=31;
 row('Observaciones de Tiempo:',v.obst,18,true);
 // Trabajo
 band('DESCRIPCIÓN DEL TRABAJO (Favor llenar siempre la información solicitada)');
 row('Causa de la Intervención / Síntoma Presentado:',v.causa,40);
 row('Descripción del Estado en que se encontraron las Partes / Componentes:',v.estado,42);
 row('Diagnostico/Causa:',v.diag,22);
 row('Trabajos Ejecutados:',v.trab,54);
 row('Repuestos Utilizados:',v.rep,42);
 // Cierre
 ensure(40);
 R(72,Y,82,40);R(154,Y,79,40);R(233,Y,102,40);R(335,Y,65,40);R(400,Y,258,40);
 ['La Planta o','Equipo Crítico','Salió de Servicio'].forEach((s,i)=>T(s,76,Y+11+i*10.5,6.5));
 ['Requiere Análisis de',' Ingeniería'].forEach((s,i)=>T(s,237,Y+15+i*10.5,6.5));
 const opt=(x,sel)=>[['SI',Y+14,sel],['NO',Y+30,!sel]].forEach(o=>{d.circle(X(x),X(o[1]-2.2),2.4,'S');if(o[2]){d.setFillColor(0,0,0);d.circle(X(x),X(o[1]-2.2),1.2,'F');d.setFillColor(255,255,255)}T(o[0],x+7,o[1],7,1)});
 opt(167,!!v.critsi);opt(348,!!v.ingsi);
 T('Supervisor de Operación que recibió el trabajo:',405,Y+11,6.5,1);
 if(v.sup){const r=fit(v.sup,248,8.5);d.setFont('helvetica','normal');d.setFontSize(r[1]);d.text(r[0],X(405),X(Y+27))}
 Y+=40;
 {const ls=v.obsg?wrap(v.obsg,W-14):[];ensure(19);R(L,Y,W,19);T('Observaciones Generales (Proceso/ Mantenimiento):',L+5,Y+12,7.5,1);Y+=19;
  const h=Math.max(22,10+ls.length*LH);ensure(h);R(L,Y,W,h);d.setFont('helvetica','normal');d.setFontSize(8.5);ls.forEach((s,i)=>d.text(s,X(L+5),X(Y+12+i*LH)));Y+=h}
 ensure(46);R(72,Y,280,46);R(352,Y,306,46);
 T('Firma del Técnico de Mantenimiento:',77,Y+11,7.5,1);T('Firma del Supervisor de Mantenimiento:',357,Y+11,7.5,1);
 [[sig&&sig[0],77,274],[sig&&sig[1],357,296]].forEach(s=>{if(!s[0])return;try{const p=d.getImageProperties(s[0]),k=Math.min(X(s[2])/p.width,X(30)/p.height);d.addImage(s[0],'PNG',X(s[1]),X(Y+14),p.width*k,p.height*k)}catch(e){}});
 Y+=46;
 ensure(16);T('Versión. 2020-09-09',658,Y+13,7,0,'right');
 // Anexo fotográfico (collage)
 const n=fotos.length;if(!n)return;
 const cols=n<=2?1:2,rows=n===1?1:n<=4?2:3,per=cols*rows,pages=Math.ceil(n/per);
 for(let p=0;p<pages;p++){
  d.addPage();d.setLineWidth(.7);
  d.setFillColor(217,217,217);d.rect(40,36,532,20,'FD');d.setFillColor(255,255,255);
  d.setFont('helvetica','bold');d.setFontSize(9);d.text('REGISTRO FOTOGRÁFICO - EVIDENCIAS',306,50,{align:'center'});
  d.rect(40,56,532,22,'S');d.setFont('helvetica','normal');d.setFontSize(7.5);
  d.text(clean('AVISO: '+(v.aviso||'')+'    ORDEN DE TRABAJO: '+(v.orden||'')+'    PLANTA: '+(plant||'')+'    TAG: '+(v.tag||'')),46,70);
  d.text('Hoja '+(p+1)+' de '+pages,566,70,{align:'right'});
  const gap=10,cw=(532-gap*(cols-1))/cols,ch=(668-gap*(rows-1))/rows;
  fotos.slice(p*per,p*per+per).forEach((f,i)=>{
   const x=40+(i%cols)*(cw+gap),y=88+Math.floor(i/cols)*(ch+gap),idx=p*per+i;
   d.rect(x,y,cw,ch,'S');
   const iw=cw-8,ih=ch-12-26;
   try{const q=d.getImageProperties(f.src),k=Math.min(iw/q.width,ih/q.height),w=q.width*k,h=q.height*k;d.addImage(f.src,'JPEG',x+4+(iw-w)/2,y+4+(ih-h)/2,w,h)}catch(e){}
   d.setFont('helvetica','normal');d.setFontSize(7.5);
   d.splitTextToSize(clean('Foto '+(idx+1)+(f.cap?': '+f.cap:'')),cw-12).slice(0,2).forEach((s,k)=>d.text(s,x+6,y+ch-17+k*9));
  });
 }
};
})();
