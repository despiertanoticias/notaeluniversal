/* La Nota Universal — lógica del sitio (sin dependencias). */
(function(){
"use strict";
var NOTAS=(window.NOTAS||[]).slice(), IMG=window.IMAGENES||{};
var MARCA="La Nota Universal";
var CATS={mundo:"Mundo",mexico:"México",politica:"Política",economia:"Economía",tecnologia:"Tecnología",ciencia:"Ciencia",salud:"Salud",deportes:"Deportes",entretenimiento:"Entretenimiento"};
var ORDEN_NAV=["mundo","mexico","politica","economia","tecnologia","ciencia","salud","deportes","entretenimiento"];
var MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var RELOJES=[["Ciudad de México","America/Mexico_City"],["Nueva York","America/New_York"],["Londres","Europe/London"],["Madrid","Europe/Madrid"],["Moscú","Europe/Moscow"],["Pekín","Asia/Shanghai"],["Tokio","Asia/Tokyo"]];

/* Datos del día: se editan en content/hoy.json (o desde el panel /admin). */
var H=window.HOY||{};
var HOY={
  fecha:H.fecha||"", actualizado:H.actualizado||"",
  ciudad:H.ciudad||"CDMX", temp:H.temp,
  mercados:H.mercados||[], mercadosNota:H.mercados_nota||"",
  agenda:H.agenda||[]
};

NOTAS.forEach(function(n){n.d=(n.f||"").slice(0,10)});
function porId(id){for(var i=0;i<NOTAS.length;i++)if(NOTAS[i].id===id)return NOTAS[i];return null}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fecha(d){var p=d.split("-");return parseInt(p[2],10)+" de "+MESES[parseInt(p[1],10)-1]+" de "+p[0]}
function hora(n){return (n.f||"").slice(11,16)}
function url(n){return "/nota.html?id="+encodeURIComponent(n.id)}
function urlSec(c){return "/seccion.html?s="+c}
function param(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function imgSrc(key,w){var m=IMG[key];if(!m)return "";if(/^(img\/|\/|https?:)/.test(m.file))return m.file;return "https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(m.file)+"?width="+(w||1000)}
function imagen(key,tag,w,eager,foto){
  var m=IMG[key]||{};var src=foto||imgSrc(key,w);
  return '<div class="img'+(src?'':' sin-foto')+'">'+(src?'<img src="'+esc(src)+'" alt="'+esc(m.alt||"")+'" loading="'+(eager?"eager":"lazy")+'" decoding="async" referrerpolicy="no-referrer">':'')+(tag?'<span class="tagimg">'+esc(tag)+'</span>':'')+'</div>';
}
function fuentes(n){return n.src.length?'<div class="fuentes">Fuentes: '+n.src.map(function(s){return '<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>'}).join("")+'</div>':''}
function tarjeta(n,conResumen){
  return '<article><a class="t" href="'+url(n)+'">'+imagen(n.img,CATS[n.c],640,false,n.foto)+'</a>'+
    '<a class="cat" href="'+urlSec(n.c)+'">'+esc(CATS[n.c])+'</a>'+
    '<a class="t" href="'+url(n)+'"><h3>'+esc(n.t)+'</h3></a>'+
    (conResumen?'<p>'+esc(n.r)+'</p>':'')+
    '<div class="meta">'+fecha(n.d)+'</div></article>';
}
function fila(n){
  return '<article><a class="t" href="'+url(n)+'">'+imagen(n.img,"",480,false,n.foto)+'</a><div>'+
    '<a class="cat" href="'+urlSec(n.c)+'">'+esc(CATS[n.c])+'</a>'+
    '<a class="t" href="'+url(n)+'"><h3>'+esc(n.t)+'</h3></a><p>'+esc(n.r)+'</p><div class="meta">'+fecha(n.d)+'</div></div></article>';
}

function parrafos(n){
  var t=n.b||"";var out=n.r?'<p><strong>'+esc(n.r)+'</strong></p>':'';
  t.split(/\n\s*\n/).forEach(function(p){p=p.trim();if(!p)return;
    var h=esc(p).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="text-decoration:underline">$1</a>').replace(/\n/g,"<br>");
    out+=/^#{1,3} /.test(p)?'<h2 style="font-size:24px;margin:24px 0 10px">'+h.replace(/^#{1,3} /,"")+'</h2>':'<p>'+h+'</p>'});
  if(!n.b&&n.r)out='<p>'+esc(n.r)+'</p>';
  return out;
}

/* ---------- partes comunes ---------- */
var svgMenu='<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
var svgLupa='<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5 5"/></svg>';
var svgX='<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>';
function navLinks(actual){
  return '<li><a href="/"'+(actual==="portada"?' aria-current="page"':'')+'>Portada</a></li>'+
    ORDEN_NAV.map(function(c){return '<li><a href="'+urlSec(c)+'"'+(actual===c?' aria-current="page"':'')+'>'+CATS[c]+'</a></li>'}).join("");
}
function cabecera(actual){
  var ult=NOTAS.slice(0,8);
  var items=ult.map(function(n){return '<li><a href="'+url(n)+'"><time>'+hora(n)+'</time>'+esc(n.t)+'</a></li>'}).join("");
  var dup=ult.map(function(n){return '<li aria-hidden="true"><a tabindex="-1" href="'+url(n)+'"><time>'+hora(n)+'</time>'+esc(n.t)+'</a></li>'}).join("");
  var f=HOY.fecha.split(" ");
  return '<a class="saltar" href="#contenido">Saltar al contenido</a>'+
  '<div class="util"><div class="wrap"><span><span class="fecha-larga">'+esc(f[0])+(f.length>1?', ':'')+'</span>'+esc(f.slice(1).join(" "))+(HOY.actualizado?' · Actualizado '+esc(HOY.actualizado):'')+'</span>'+
  '<span class="der"><span class="en-vivo"><i></i><span data-reloj="America/Mexico_City">--:--</span> '+esc(HOY.ciudad)+(HOY.temp!=null&&HOY.temp!==""?' · '+esc(HOY.temp)+'°':'')+'</span><a href="/#suscribete">Boletín</a></span></div></div>'+
  '<header class="mast"><div class="wrap fila">'+
    '<button class="icono" type="button" id="abrir-menu" aria-label="Abrir menú">'+svgMenu+'</button>'+
    '<a class="logo" href="/" aria-label="'+MARCA+', inicio"><img src="/assets/logo.webp" width="900" height="328" alt="'+MARCA+' — Información global en tiempo real"></a>'+
    '<div class="acciones"><button class="icono" type="button" id="abrir-buscar" aria-label="Buscar">'+svgLupa+'</button><a class="btn" href="/#suscribete">Suscríbete</a></div>'+
  '</div><nav class="secciones" aria-label="Secciones"><div class="wrap"><ul>'+navLinks(actual)+'</ul></div></nav></header>'+
  '<div class="overlay" id="menu" hidden role="dialog" aria-label="Menú"><button class="icono cerrar" type="button" data-cerrar aria-label="Cerrar menú">'+svgX+'</button>'+
    '<p class="reg"><a href="/#suscribete" data-cerrar>Recibe el boletín</a></p><nav aria-label="Secciones"><ul>'+navLinks(actual)+'</ul></nav></div>'+
  '<div class="overlay" id="buscar" hidden role="dialog" aria-label="Buscar"><button class="icono cerrar" type="button" data-cerrar aria-label="Cerrar búsqueda">'+svgX+'</button>'+
    '<form action="/seccion.html" method="get"><label for="q">Buscar</label><input id="q" name="q" type="search" placeholder="Ucrania, dólar, elecciones…" autocomplete="off"><p class="hint">Escribe y presiona Enter.</p></form></div>'+
  '<div class="breaking"><div class="wrap"><span class="tag">En vivo</span><div class="ticker"><ul>'+items+dup+'</ul></div></div></div>';
}
function flecha(nivel){return nivel==="sube"?"▲":nivel==="baja"?"▼":"■"}
function rail(){
  var popular=NOTAS.filter(function(n){return n.dest}).slice(0,5);
  var h='<aside class="rail" aria-label="El mundo hoy">';
  h+='<div class="panel relojes"><h4>Hora en el mundo <small>En tiempo real</small></h4><ul>'+
    RELOJES.map(function(r){return '<li><span>'+r[0]+'</span><time data-reloj="'+r[1]+'">--:--</time></li>'}).join("")+'</ul></div>';
  if(HOY.mercados.length)h+='<div class="panel"><h4>Mercados <small>'+esc(HOY.mercadosNota||"Al cierre")+'</small></h4><div class="filas mercados">'+
    HOY.mercados.map(function(m){return '<div class="f"><span class="nom">'+esc(m.nombre)+'</span><span class="val">'+esc(m.valor)+'</span><span class="chg c-'+esc(m.nivel||"igual")+'">'+flecha(m.nivel)+' '+esc(m.cambio||"")+'</span></div>'}).join("")+'</div></div>';
  if(HOY.agenda.length)h+='<div class="panel"><h4>Agenda global</h4><ul class="agenda">'+
    HOY.agenda.map(function(a){return '<li><time>'+esc(a.cuando)+'</time><span>'+esc(a.texto)+'</span></li>'}).join("")+'</ul></div>';
  if(popular.length)h+='<div class="panel popular"><h4>Lo más importante</h4><ol>'+popular.map(function(n){return '<li><a href="'+url(n)+'">'+esc(n.t)+'</a></li>'}).join("")+'</ol></div>';
  h+='<div class="panel news" id="suscribete"><h4>Boletín diario</h4><p>Las noticias del mundo, resumidas en tu correo cada mañana.</p>'+
    '<form id="form-news"><label for="email" class="sr">Correo electrónico</label><input id="email" type="email" required placeholder="tucorreo@ejemplo.com"><button class="btn" type="submit">Suscribirme</button><span class="nota-form" id="form-msg">Pronto podrás recibir el boletín diario.</span></form></div>';
  return h+'</aside>';
}
function pie(){
  return '<footer class="pie"><div class="wrap"><div><span class="marca"><img src="/assets/logo.webp" width="900" height="328" alt="'+MARCA+'"></span>'+
  '<p style="margin:14px 0 0;max-width:46ch">Información global en tiempo real. Las notas resumen información de otros medios y enlazan a sus fuentes originales.</p></div>'+
  '<div><h5>Secciones</h5><ul>'+ORDEN_NAV.slice(0,6).map(function(c){return '<li><a href="'+urlSec(c)+'">'+CATS[c]+'</a></li>'}).join("")+'</ul></div>'+
  '<div><h5>La Nota</h5><ul><li><a href="/creditos.html">Créditos de imágenes</a></li><li><a href="/#suscribete">Boletín</a></li><li>Acerca de</li><li>Contacto</li><li>Política de privacidad</li></ul></div>'+
  '<div class="copy">© '+new Date().getFullYear()+' '+MARCA+'. Fotografías de Wikimedia Commons con licencias libres; ver <a href="/creditos.html" style="text-decoration:underline">créditos</a>.</div></div></footer>';
}

/* ---------- páginas ---------- */
function portada(){
  var dest=NOTAS.filter(function(n){return n.dest});
  if(dest.length<4)dest=dest.concat(NOTAS.filter(function(n){return !n.dest})).slice(0,4);
  var principal=dest[0], lat=dest.slice(1,4), usados={};
  [principal].concat(lat).forEach(function(n){usados[n.id]=1});
  var ultimas=NOTAS.filter(function(n){return !usados[n.id]}).slice(0,9);
  ultimas.forEach(function(n){usados[n.id]=1});
  var h='<div class="wrap"><section class="hero" aria-label="Destacadas"><article class="principal">'+
    '<a class="t" href="'+url(principal)+'">'+imagen(principal.img,CATS[principal.c],1400,true,principal.foto)+'<h2>'+esc(principal.t)+'</h2></a>'+
    '<p class="dek">'+esc(principal.r)+'</p><div class="meta"><a class="cat" href="'+urlSec(principal.c)+'">'+CATS[principal.c]+'</a><span>'+esc(principal.a)+' · '+fecha(principal.d)+'</span></div>'+fuentes(principal)+'</article>'+
    '<div class="lateral">'+lat.map(function(n){return '<article><div><a class="cat" href="'+urlSec(n.c)+'">'+CATS[n.c]+'</a><a class="t" href="'+url(n)+'"><h3>'+esc(n.t)+'</h3></a><div class="meta">'+fecha(n.d)+'</div></div><a class="t" href="'+url(n)+'">'+imagen(n.img,"",400,false,n.foto)+'</a></article>'}).join("")+'</div></section></div>';
  h+='<div class="wrap"><main class="cuerpo" id="contenido"><div>'+
    '<div class="cabeza"><h2>Lo último</h2><p>Minuto a minuto</p></div><div class="tarjetas">'+ultimas.map(function(n){return tarjeta(n,true)}).join("")+'</div>';
  ORDEN_NAV.forEach(function(c){
    var lista=NOTAS.filter(function(n){return n.c===c&&!usados[n.id]}).slice(0,3);
    if(!lista.length)return;
    h+='<div class="cabeza"><h2>'+CATS[c]+'</h2><a class="mas" href="'+urlSec(c)+'">Ver todas →</a></div><div class="tarjetas">'+lista.map(function(n){return tarjeta(n,false)}).join("")+'</div>';
  });
  h+='</div>'+rail()+'</main></div>';
  return h;
}
function seccion(){
  var c=param("s"), q=(param("q")||"").trim(), lista, titulo, sub;
  if(q){
    var t=q.toLowerCase();
    lista=NOTAS.filter(function(n){return (n.t+" "+n.r+" "+CATS[n.c]).toLowerCase().indexOf(t)>-1});
    titulo='Resultados para “'+esc(q)+'”'; sub=lista.length+(lista.length===1?" nota":" notas");
    document.title="Buscar: "+q+" · "+MARCA;
  }else{
    if(!CATS[c])c="mundo";
    lista=NOTAS.filter(function(n){return n.c===c});
    titulo=CATS[c]; sub=lista.length+(lista.length===1?" nota":" notas");
    document.title=CATS[c]+" · "+MARCA;
  }
  var cuerpo=lista.length?'<div class="lista">'+lista.map(fila).join("")+'</div>':'<p class="vacio">Todavía no hay notas aquí. Prueba con otra palabra o vuelve a la <a href="/" style="text-decoration:underline">portada</a>.</p>';
  return {actual:q?"":c,html:'<div class="wrap"><main class="cuerpo" id="contenido"><div><div class="cabeza"><h1>'+titulo+'</h1><p>'+sub+'</p></div>'+cuerpo+'</div>'+rail()+'</main></div>'};
}
function nota(){
  var n=porId(param("id"));
  if(!n)return {actual:"",html:'<div class="wrap"><main class="cuerpo" id="contenido"><div><div class="cabeza"><h1>Nota no encontrada</h1></div><p class="vacio">Esta nota no existe o fue retirada. Vuelve a la <a href="/" style="text-decoration:underline">portada</a>.</p></div>'+rail()+'</main></div>'};
  document.title=n.t+" · "+MARCA;
  var meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute("content",n.r);
  var m=IMG[n.img]||{}, rel=NOTAS.filter(function(x){return x.c===n.c&&x.id!==n.id}).slice(0,3);
  var credito=n.foto?esc(n.cred||""):m.file&&!/^(img\/|\/|https?:)/.test(m.file)?'Foto: '+esc(m.alt)+' · <a href="https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(m.file)+'" target="_blank" rel="noopener">Wikimedia Commons</a> (imagen de referencia)':esc(m.alt||"");
  var h='<div class="wrap"><main class="cuerpo" id="contenido"><article class="nota-art">'+
    '<div class="migas"><a href="/">Portada</a><span>›</span><a href="'+urlSec(n.c)+'">'+CATS[n.c]+'</a></div>'+
    '<h1>'+esc(n.t)+'</h1><div class="meta"><a class="cat" href="'+urlSec(n.c)+'">'+CATS[n.c]+'</a><span>'+esc(n.a)+' · '+fecha(n.d)+(hora(n)?' · '+hora(n)+' h':'')+'</span></div>'+
    '<figure>'+imagen(n.img,"",1400,true,n.foto)+(credito?'<figcaption>'+credito+'</figcaption>':'')+'</figure>'+
    '<div class="texto">'+parrafos(n)+'</div>'+
    (n.src.length?'<div class="caja-fuentes"><b>Fuentes</b><ul>'+n.src.map(function(s){return '<li><a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a></li>'}).join("")+'</ul></div>':'')+
    '<div class="compartir"><button class="btn sec" type="button" id="copiar">Copiar enlace</button><a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(n.t+" ")+encodeURIComponent(location.href)+'">WhatsApp</a><a class="btn sec" target="_blank" rel="noopener" href="https://x.com/intent/post?text='+encodeURIComponent(n.t)+'&url='+encodeURIComponent(location.href)+'">X</a><span id="copiado" role="status"></span></div>'+
    (rel.length?'<div class="cabeza"><h2>Más de '+CATS[n.c]+'</h2><a class="mas" href="'+urlSec(n.c)+'">Ver todas →</a></div><div class="tarjetas">'+rel.map(function(x){return tarjeta(x,false)}).join("")+'</div>':'')+
    '</article>'+rail()+'</main></div>';
  return {actual:n.c,html:h};
}
function creditos(){
  var usadas={};NOTAS.forEach(function(n){usadas[n.img]=(usadas[n.img]||0)+1});
  var filas=Object.keys(IMG).map(function(k){var m=IMG[k],local=/^(img\/|\/|https?:)/.test(m.file);
    return '<tr><td>'+imagen(k,"",240).replace('class="img"','class="img miniatura"')+'</td><td>'+esc(m.alt)+'</td><td>'+(local?esc(m.file):'<a href="https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(m.file)+'" target="_blank" rel="noopener">'+esc(m.file.replace(/_/g," "))+'</a>')+'</td><td>'+(usadas[k]||0)+'</td></tr>'}).join("");
  return '<div class="wrap"><main class="cuerpo" id="contenido"><div><div class="cabeza"><h1>Créditos de imágenes</h1><p>Wikimedia Commons</p></div>'+
    '<p style="max-width:68ch">Las fotografías de este sitio provienen de Wikimedia Commons y se publican bajo licencias libres (Creative Commons o dominio público). Son imágenes de referencia del lugar o del tema, no fotos de los hechos. El autor y la licencia exacta de cada una están en su página de Commons.</p>'+
    '<div class="desborde"><table class="tabla"><thead><tr><th>Imagen</th><th>Descripción</th><th>Archivo y licencia</th><th>Notas</th></tr></thead><tbody>'+filas+'</tbody></table></div></div>'+rail()+'</main></div>';
}

/* ---------- arranque ---------- */
var pagina=document.body.getAttribute("data-pagina"), raiz=document.getElementById("app"), r;
if(!NOTAS.length&&pagina==="portada")r={actual:"portada",html:'<div class="wrap"><p class="vacio">Pronto publicaremos las primeras notas.</p></div>'};
else if(pagina==="portada")r={actual:"portada",html:portada()};
else if(pagina==="seccion")r=seccion();
else if(pagina==="nota")r=nota();
else if(pagina==="creditos")r={actual:"",html:creditos()};
else r={actual:"",html:'<div class="wrap"><main class="cuerpo" id="contenido"><div><div class="cabeza"><h1>Página no encontrada</h1></div><p class="vacio">La dirección no existe. Vuelve a la <a href="/" style="text-decoration:underline">portada</a>.</p></div>'+rail()+'</main></div>'};
raiz.innerHTML=cabecera(r.actual)+r.html+pie();

/* imágenes que no cargan: se deja el fondo de marca */
raiz.querySelectorAll(".img img").forEach(function(im){im.addEventListener("error",function(){im.parentNode.classList.add("sin-foto");im.remove()})});

/* relojes en tiempo real */
var relojes=raiz.querySelectorAll("[data-reloj]");
function tic(){var ahora=new Date();relojes.forEach(function(el){try{el.textContent=ahora.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:el.getAttribute("data-reloj")})}catch(e){}})}
if(relojes.length){tic();setInterval(tic,15000)}

var menu=document.getElementById("menu"),buscar=document.getElementById("buscar");
function cerrar(){menu.hidden=true;buscar.hidden=true;document.body.style.overflow=""}
document.getElementById("abrir-menu").addEventListener("click",function(){menu.hidden=false;document.body.style.overflow="hidden"});
document.getElementById("abrir-buscar").addEventListener("click",function(){buscar.hidden=false;document.body.style.overflow="hidden";setTimeout(function(){document.getElementById("q").focus()},30)});
raiz.querySelectorAll("[data-cerrar]").forEach(function(b){b.addEventListener("click",cerrar)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")cerrar()});
var fn=document.getElementById("form-news");
if(fn)fn.addEventListener("submit",function(e){e.preventDefault();document.getElementById("form-msg").textContent="Gracias. Te avisaremos cuando abra el boletín."});
var cp=document.getElementById("copiar");
if(cp)cp.addEventListener("click",function(){var s=document.getElementById("copiado");
  if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(function(){s.textContent="Enlace copiado."},function(){s.textContent=location.href});else s.textContent=location.href});
if(location.hash==="#suscribete"){var el=document.getElementById("suscribete");if(el)setTimeout(function(){el.scrollIntoView()},50)}
})();
