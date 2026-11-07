// Genera, a partir de las notas, las páginas estáticas /notas/<slug>/index.html,
// sitemap.xml y _redirects (nota.html?id=<id> → /notas/<slug>/ con 301).
// Lo llama scripts/build.mjs; no requiere dependencias.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

export const SITIO = "https://notaeluniversal.com";
export const MARCA = "La Nota Universal";
const CATS = {"mundo":"Mundo","mexico":"México","politica":"Política","economia":"Economía","tecnologia":"Tecnología","ciencia":"Ciencia","salud":"Salud","deportes":"Deportes","entretenimiento":"Entretenimiento"};
const EXTRA_SITEMAP = ["/privacy"]; // rutas fijas además de portada y secciones
const LOGO = { src: "/assets/logo.webp", w: 900, h: 328 };
const OG_DEFECTO = "https://notaeluniversal.com/assets/og.jpg";
const COLOR = "#1b365d";
const ICONOS = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/assets/icono.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">`;
const FUENTES_CSS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,600;75..100,700;75..100,800;75..100,900&family=Montserrat:wght@500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap";
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const ZONA = "-06:00"; // centro de México (sin horario de verano desde 2022)

export function slugDe(titulo) {
  let s = String(titulo || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (s.length > 90) s = s.slice(0, 90).replace(/-[^-]*$/, "");
  return s || "nota";
}

// Asigna a cada nota un slug único (si dos titulares coinciden, la más antigua conserva el limpio).
export function asignarSlugs(notas) {
  const usados = new Set();
  [...notas].sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : a.id < b.id ? -1 : 1)).forEach(n => {
    let base = slugDe(n.t), s = base, i = 2;
    while (usados.has(s)) s = `${base}-${i++}`;
    usados.add(s);
    n.u = s;
  });
}

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fechaLarga = d => { if (!d) return ""; const p = d.split("-"); return `${parseInt(p[2], 10)} de ${MESES[parseInt(p[1], 10) - 1]} de ${p[0]}`; };
const iso = f => (f && f.length >= 16 ? `${f.slice(0, 16)}:00${ZONA}` : f);

function cargarImagenes(raiz) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(raiz, "assets/imagenes.js"), "utf8"), ctx);
  return ctx.window.IMAGENES || {};
}
function imagenDe(n, IMG) {
  if (n.foto) return /^https?:/.test(n.foto) ? n.foto : SITIO + encodeURI("/" + n.foto.replace(/^\//, ""));
  const m = IMG[n.img];
  if (!m) return OG_DEFECTO;
  if (/^https?:/.test(m.file)) return m.file;
  if (/^\/?img\//.test(m.file)) return SITIO + encodeURI("/" + m.file.replace(/^\//, ""));
  return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(m.file) + "?width=1200";
}

// Enlaces: los de notas patrocinadas llevan rel="sponsored noopener".
const relDe = n => (n.p ? "sponsored noopener" : "noopener");
function textoHTML(n) {
  const rel = relDe(n);
  let out = n.r ? `<p class="entrada">${esc(n.r)}</p>` : "";
  String(n.b || "").split(/\n\s*\n/).forEach(p => {
    p = p.trim(); if (!p) return;
    const h = esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, `<a href="$2" target="_blank" rel="${rel}">$1</a>`)
      .replace(/\n/g, "<br>");
    out += /^#{1,3} /.test(p) ? `<h2>${h.replace(/^#{1,3} /, "")}</h2>` : `<p>${h}</p>`;
  });
  return out;
}

function pagina(n, IMG, conScripts, version) {
  const url = `${SITIO}/notas/${n.u}/`;
  const titulo = `${n.t} · ${MARCA}`;
  const desc = n.r || n.t;
  const img = imagenDe(n, IMG);
  const d = (n.f || "").slice(0, 10), hora = (n.f || "").slice(11, 16);
  const rel = relDe(n);
  const cat = CATS[n.c] || "";
  const esPersona = n.a && !/^Redacci[oó]n/.test(n.a);
  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: n.t.slice(0, 110), description: desc,
    datePublished: iso(n.f), dateModified: iso(n.m || n.f),
    image: [img], mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": esPersona ? "Person" : "Organization", name: n.a || MARCA },
    publisher: { "@type": "Organization", name: MARCA, logo: { "@type": "ImageObject", url: `${SITIO}${LOGO.src}` } }
  };
  if (cat) ld.articleSection = cat;
  const fuentes = n.src.length ? `<div class="caja-fuentes"><b>${n.p ? "Enlaces" : "Fuentes"}</b><ul>${n.src.map(s => `<li><a href="${esc(s[1])}" target="_blank" rel="${rel}">${esc(s[0])}</a></li>`).join("")}</ul></div>` : "";
  const etiqueta = n.p ? `<p class="patrocinado">Contenido patrocinado</p>` : "";
  const alt = (!n.foto && IMG[n.img] && IMG[n.img].alt) || n.t;
  const scripts = conScripts ? `<script src="/assets/imagenes.js"></script>
<script src="/assets/datos.js${version ? "?v=" + version : ""}"></script>
<script src="/assets/en-vivo.js"></script><script src="/assets/app.js"></script>
` : "";
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="${COLOR}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(MARCA)}">
<meta property="og:locale" content="es_MX">
<meta property="og:title" content="${esc(n.t)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="article:published_time" content="${esc(iso(n.f))}">
<meta property="article:modified_time" content="${esc(iso(n.m || n.f))}">
<meta property="article:section" content="${esc(cat)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(n.t)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
${ICONOS}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FUENTES_CSS}">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body data-pagina="nota" data-id="${esc(n.id)}">
<div id="app">
<header class="cab-estatica"><div class="wrap"><a class="logo" href="/"><img src="${LOGO.src}" width="${LOGO.w}" height="${LOGO.h}" alt="${esc(MARCA)}"></a></div></header>
<div class="wrap"><main class="cuerpo" id="contenido"><article class="nota-art">
<div class="migas"><a href="/">Portada</a><span>›</span><a href="/seccion.html?s=${esc(n.c)}">${esc(cat)}</a></div>
${etiqueta}<h1>${esc(n.t)}</h1>
<div class="meta"><a class="cat" href="/seccion.html?s=${esc(n.c)}">${esc(cat)}</a><span>${esc(n.a || "Redacción")} · <time datetime="${esc(iso(n.f))}">${fechaLarga(d)}${hora ? " · " + hora + " h" : ""}</time></span></div>
<figure><div class="img"><img src="${esc(img)}" alt="${esc(alt)}" loading="eager" decoding="async" referrerpolicy="no-referrer"></div>${n.cred ? `<figcaption>${esc(n.cred)}</figcaption>` : ""}</figure>
<div class="texto">${textoHTML(n)}</div>
${fuentes}
</article></main></div>
<footer class="pie"><div class="wrap"><p>© ${esc(MARCA)} · <a href="/">Portada</a></p></div></footer>
</div>
${scripts}</body>
</html>
`;
}

// enDatos: ids presentes en assets/datos.js (solo esas páginas cargan app.js, que las re-renderiza).
export function generar(raiz, notas, enDatos, version) {
  const IMG = cargarImagenes(raiz);
  const dir = path.join(raiz, "notas");
  fs.rmSync(dir, { recursive: true, force: true });
  for (const n of notas) {
    fs.mkdirSync(path.join(dir, n.u), { recursive: true });
    fs.writeFileSync(path.join(dir, n.u, "index.html"), pagina(n, IMG, !enDatos || enDatos.has(n.id), version));
  }
  // sitemap.xml
  const hoy = new Date().toISOString().slice(0, 10);
  const fijas = ["/", ...EXTRA_SITEMAP, ...Object.keys(CATS).map(c => `/seccion.html?s=${c}`)];
  const urls = fijas.map(u => `  <url><loc>${SITIO}${u}</loc><lastmod>${hoy}</lastmod></url>`)
    .concat(notas.map(n => `  <url><loc>${SITIO}/notas/${n.u}/</loc><lastmod>${iso(n.m || n.f)}</lastmod></url>`));
  fs.writeFileSync(path.join(raiz, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
  // _redirects: una regla 301 por nota con el parámetro id
  const reglas = notas.map(n => `/nota.html  id=${encodeURIComponent(n.id)}  /notas/${n.u}/  301!`);
  fs.writeFileSync(path.join(raiz, "_redirects"),
    "# Generado por scripts/paginas.mjs — no editar a mano.\n" + reglas.join("\n") + "\n");
  return notas.length;
}
