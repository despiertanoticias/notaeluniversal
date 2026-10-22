# La Nota Universal

Información global en tiempo real · https://notaeluniversal.com

## Cómo publicar una nota (panel)
1. Entra a **https://notaeluniversal.com/admin**.
2. Inicia sesión con GitHub.
3. En **Notas → Nueva nota**, llena titular, sección, resumen y, si quieres, el texto completo y una foto.
4. Pulsa **Guardar / Publicar**. En uno o dos minutos aparece en el sitio.

Desde el mismo panel puedes editar o borrar notas y cambiar los **Datos del día** (mercados, agenda global y la barra superior).

> El panel guarda en el repositorio de GitHub indicado en `admin/config.yml` (`despiertanoticias/notaeluniversal`). Si usas otro nombre de repositorio, cámbialo ahí.

## Publicación automática
Puedes programar una tarea que siga `AUTOMATIZACION.md` dos veces al día para agregar las 20 noticias más importantes del mundo y actualizar los datos del día.

## Estructura
- `content/notas/*.json` — una nota por archivo
- `content/hoy.json` — mercados, agenda global, fecha y temperatura de la barra superior
- `scripts/build.mjs` — junta todo en `assets/datos.js` y genera `sitemap.xml` (Netlify lo ejecuta en cada publicación)
- `assets/imagenes.js` — fotos de archivo de Wikimedia Commons por tema (si una nota no tiene foto, se muestra un fondo con la marca)
- `assets/logo.png`, `assets/logo.webp`, `assets/icono.png` — logotipo e ícono
- `admin/` — panel de publicación
- `img/subidas/` — fotos que subes desde el panel

## Secciones
mundo, mexico, politica, economia, tecnologia, ciencia, salud, deportes, entretenimiento.

## Netlify
- Comando de build: `node scripts/build.mjs`
- Carpeta de publicación: `.` (la raíz)
- Dominio: `notaeluniversal.com` (con `www.` redirigiendo al dominio principal)
