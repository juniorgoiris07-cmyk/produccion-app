# Guía: publicar e instalar las apps en el celular

Esta guía te lleva paso a paso desde "tengo estos archivos" hasta "tengo la
app instalada en el teléfono". No hace falta saber programar — son todo
clics en páginas web.

## Qué contiene esta carpeta

```
pwa-produccion/
├── index.html            (página de entrada, con links a las dos apps)
├── carga/                (app para operarios)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
├── informes/              (app para jefes/gerencia)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
└── GUIA_PUBLICACION.md    (este archivo)
```

## Paso 1 — Crear cuenta en GitHub (si no tenés una)

1. Entrá a **github.com** → **Sign up** → seguí los pasos (usuario, mail,
   contraseña). Es gratis.

## Paso 2 — Crear el repositorio

1. Ya logueado, tocá el **+** arriba a la derecha → **New repository**.
2. Nombre: por ejemplo `produccion-app` (podés poner cualquier nombre, sin
   espacios).
3. Dejalo en **Public** (necesario para que GitHub Pages funcione gratis).
4. **NO** marques "Add a README" (para simplificar el paso de subida).
5. Tocá **Create repository**.

## Paso 3 — Subir los archivos

1. En la página del repositorio recién creado, vas a ver un link que dice
   **uploading an existing file** (o el botón **Add file → Upload files**).
2. Arrastrá **toda la carpeta `pwa-produccion`** (o su contenido: el
   `index.html` de la raíz, y las carpetas `carga/` e `informes/` completas)
   a esa pantalla.
   - Importante: tiene que quedar la estructura de carpetas tal cual está.
     Si tu navegador no te deja arrastrar carpetas enteras, subí primero el
     `index.html` de la raíz, y después entrá a cada subcarpeta y repetí
     "Add file → Upload files" ahí adentro.
3. Abajo de todo, tocá **Commit changes** (podés dejar el mensaje que viene
   por defecto).

## Paso 4 — Activar GitHub Pages

1. En el repositorio, andá a **Settings** (pestaña arriba) → **Pages**
   (menú de la izquierda).
2. En **Source**, elegí **Deploy from a branch**.
3. En **Branch**, elegí `main` y la carpeta `/ (root)` → **Save**.
4. Esperá 1-2 minutos. GitHub te va a mostrar un mensaje con la URL final,
   algo como:

   ```
   https://TU-USUARIO.github.io/produccion-app/
   ```

Esa es tu URL fija con HTTPS. Las dos apps van a quedar en:

- Carga: `https://TU-USUARIO.github.io/produccion-app/carga/`
- Informes: `https://TU-USUARIO.github.io/produccion-app/informes/`

## Paso 5 — Instalar en el celular

### Android (Chrome)
1. Abrí la URL de la app (Carga o Informes) en Chrome.
2. Chrome va a mostrar un aviso o un botón **"Instalar app"** (a veces está
   dentro del menú ⋮ de arriba a la derecha, como **"Instalar aplicación"**
   o **"Agregar a pantalla de inicio"**).
3. Confirmá. Va a aparecer el ícono en el escritorio del teléfono, como
   cualquier app.

### iPhone (Safari — tiene que ser Safari, no Chrome)
1. Abrí la URL de la app en **Safari**.
2. Tocá el ícono de **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elegí **"Agregar a pantalla de inicio"**.
4. Confirmá el nombre y tocá **Agregar**.

Repetí esto en cada teléfono, para cada app según el rol de esa persona
(operario instala Carga, jefe instala Informes).

## Cómo desinstalarla

Igual que cualquier otra app: mantener presionado el ícono → Desinstalar /
Eliminar app. Al desinstalarla se borra también el token guardado y la
sesión en ese teléfono (tendría que configurarse de nuevo si se vuelve a
instalar).

## Primer uso en cada teléfono

### Carga (operarios)
La primera vez que se abre, la app va a pedir:
1. El **token de Airtable** (una sola vez por teléfono).
2. **Usuario y contraseña** (el que ya usan hoy).

Para ese primer login sí hace falta tener internet. Una vez logueado, la
carga de datos funciona incluso sin señal (se guarda en el teléfono y se
sube sola cuando vuelve la conexión).

### Informes (jefes/gerencia)
Esta app ya no tiene usuario ni contraseña — no hace falta loguearse. La
primera vez que se abre en un teléfono nuevo, pide una sola cosa: la **URL
de la app web de Google Apps Script** (ver la sección "Cómo funciona
Informes" más abajo). Una vez cargada esa URL, queda guardada en el
teléfono y no la vuelve a pedir.

## Cómo funciona Informes (Google Sheets + Apps Script)

Esta app cambió de fuente de datos: ya no usa Airtable, sino una planilla
de Google Sheets que vos cargás a mano.

- La planilla se llama **"Gestión de Producción"** y tiene una hoja
  llamada **"Cargas"** con las columnas: Fecha, Hora, Turno, Producto,
  Lote, Toneladas, Pureza, Humedad, Micro, Operador, Observaciones (la
  columna ID de la izquierda se completa sola, no hay que tocarla).
- Cargá cada lote como una fila nueva, igual que en cualquier planilla.
  Apenas escribís el número de Lote, esa fila queda identificada
  automáticamente.
- La app de Informes lee esa planilla a través de una "app web" de Google
  Apps Script (un pequeño backend, ya armado y funcionando) — no hace
  falta tocar nada de esto para el uso diario, solo cargar filas en la
  planilla.
- Si alguna vez necesitás la URL de esa app web de nuevo (por ejemplo
  para instalarla en un teléfono nuevo), la conseguís abriendo la
  planilla → **Extensiones → Apps Script → Implementar → Administrar
  implementaciones**.
- Desde la app, tocando "Resultado Micro / Observaciones" en el detalle de
  un lote, se puede editar ese resultado — el cambio se guarda
  directamente en la planilla, y si no hay señal se guarda en el teléfono
  y se sube solo cuando vuelve la conexión, igual que con las cargas.

## Si actualizás el contenido más adelante

Cuando yo te pase una nueva versión de `carga/index.html` o
`informes/index.html` (por los "cambios chicos" que mencionaste), el
proceso es:

1. Subir el archivo nuevo al mismo repositorio de GitHub, reemplazando el
   anterior (Add file → Upload files, mismo nombre, GitHub pregunta si
   querés reemplazarlo).
2. **Importante**: para que los teléfonos que ya tienen la app instalada
   vean la actualización, hay que subir también una versión de `sw.js` con
   el número de caché cambiado — por ejemplo `CACHE_NAME =
   'carga-produccion-v2'` en vez de `v1`. Si no se cambia ese número, el
   teléfono puede seguir mostrando la versión vieja guardada. Avisame
   cuando quieras actualizar y te dejo listo ese archivo con el número ya
   incrementado.

## Nota de seguridad (para tener en cuenta, no urgente)

**Carga**: el token de acceso de Airtable queda guardado en el propio
teléfono (en el almacenamiento del navegador) y las llamadas a Airtable se
hacen directo desde la app, sin pasar por un servidor propio. Es un
esquema razonable para una app interna con pocos usuarios de confianza.

**Informes**: la URL de la app web de Apps Script queda guardada en el
teléfono, igual que el token de Carga. Cualquiera que tenga esa URL puede
leer y editar la planilla sin pasar por una cuenta de Google — por eso
conviene compartirla solo con los teléfonos de jefes/gerencia, igual que
harías con una contraseña.

Si en algún momento crece el número de personas con acceso, o preferís que
estos datos no queden expuestos en cada teléfono, se puede migrar a un
esquema con un servidor intermedio y autenticación propia — es un cambio
más grande, avisame si te interesa evaluarlo.
