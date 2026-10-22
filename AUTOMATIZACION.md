# Publicación automática — instrucciones para la tarea programada

Esta tarea corre dos veces al día (mañana y tarde, hora de la Ciudad de México) y publica en notaeluniversal.com.

## 1. Buscar las noticias
- Busca en la web las noticias más importantes de las últimas 12 horas en el mundo y en México.
- Prioridad: Mundo > México > Economía > Política > Tecnología > Ciencia > Salud > Deportes > Entretenimiento.
- Revisa agencias y medios de referencia (EFE, AFP, Reuters, AP, BBC Mundo, El País, Infobae, CNN en Español, DW, France 24, El Universal, Milenio, El Financiero, Expansión) y abre las notas para confirmar los datos.
- Antes de escribir, lee los títulos de `content/notas/` de los últimos 2 días y **no repitas** una nota que ya existe. Si un tema avanzó, escribe una nota nueva con el dato nuevo.

## 2. Escribir 20 notas
Crea **exactamente 20** archivos nuevos en `content/notas/`, uno por nota, con nombre `AAAA-MM-DD-titular-en-minusculas-con-guiones.json` (máximo 70 caracteres después de la fecha) y este formato:

```json
{
  "titulo": "Titular claro, en tus palabras",
  "seccion": "mundo",
  "fecha": "2026-10-21T06:20",
  "resumen": "Dos o tres frases con los hechos: qué pasó, dónde, cifras y quién lo dijo.",
  "cuerpo": "",
  "imagen_tema": "",
  "imagen": "",
  "credito": "",
  "fuentes": [{ "medio": "EFE", "enlace": "https://..." }],
  "destacada": false,
  "autor": "Redacción La Nota Universal"
}
```

Reglas:
- `seccion`: mundo, mexico, politica, economia, tecnologia, ciencia, salud, deportes o entretenimiento. Al menos 8 de las 20 deben ser de `mundo`.
- `fecha`: la hora de la ejecución en la Ciudad de México. Usa minutos distintos para conservar el orden de importancia (la más importante con la hora más reciente).
- Marca `"destacada": true` en las 4 más importantes.
- `imagen_tema`: una de las claves de `assets/imagenes.js` solo si la foto corresponde al lugar o tema de la nota. Si ninguna encaja, déjalo vacío (`""`): el sitio muestra un fondo con la marca. Nunca uses una foto de un lugar distinto al de la noticia.
- **Redacta todo con tus propias palabras.** No copies frases de los medios; como máximo, una cita breve (menos de 15 palabras) entre comillas si la frase exacta importa.
- **No inventes datos.** Cada cifra, nombre o fecha debe estar en la fuente enlazada. Si una fuente solo da el titular, escribe una nota breve con eso.
- Cada nota lleva al menos una fuente con su enlace real.
- Temas delicados (violencia, salud, política): tono neutral, sin adjetivos ni opiniones.

## 3. Actualizar los datos del día
Edita `content/hoy.json` (mismo formato que ya tiene):
- `fecha` ("Miércoles 21 de octubre de 2026") y `actualizado` (hora).
- `temp`: temperatura actual en la Ciudad de México (SMN / Conagua).
- `mercados`: dólar/peso, Dow Jones, S&P 500, Nasdaq, petróleo Brent y, si los encuentras, euro, oro o bitcoin. `nivel` es `sube`, `baja` o `igual`.
- `agenda`: 3 a 5 eventos internacionales próximos (cumbres, elecciones, votaciones, grandes partidos), con `cuando` corto ("Hoy", "25 oct", "10:00").
Si no encuentras un dato, deja el anterior y no lo inventes.

## 4. Revisar y publicar
1. Ejecuta `node scripts/build.mjs`. Si marca errores, corrígelos.
2. Confirma que hay 20 archivos nuevos y que ninguno repite una nota anterior.
3. Haz commit en `main` con el mensaje `Noticias del AAAA-MM-DD (mañana|tarde)` y push. Netlify publica solo.
4. Envía al usuario un mensaje corto: cuántas notas se publicaron, los 4 titulares destacados y cualquier problema.
