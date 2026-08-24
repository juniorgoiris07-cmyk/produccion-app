# Guía: publicar e instalar la app en el celular

Esta guía te lleva paso a paso desde "tengo estos archivos" hasta "tengo la
app instalada en el teléfono". No hace falta saber programar — son todo
clics en páginas web.

## Qué contiene esta carpeta

```
pwa-produccion/
├── index.html            (redirige directo a informes/)
├── informes/              (la app — ver lotes, turnos y bloques cargados)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
├── apps-script/
│   └── Code.gs            (copia de referencia del backend; el que manda
│                            es el que está pegado en Extensiones → Apps
│                            Script, dentro de la planilla)
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
   `index.html` de la raíz y la carpeta `informes/` completa) a esa
   pantalla.
   - Importante: tiene que quedar la estructura de carpetas tal cual está.
     Si tu navegador no te deja arrastrar carpetas enteras, subí primero el
     `index.html` de la raíz, y después entrá a la subcarpeta `informes/` y
     repetí "Add file → Upload files" ahí adentro.
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

Esa es tu URL fija con HTTPS. La app queda en:

- `https://TU-USUARIO.github.io/produccion-app/informes/` (o directo en la
  raíz, que redirige sola ahí).

## Paso 5 — Instalar en el celular

### Android (Chrome)
1. Abrí la URL de la app en Chrome.
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

Repetí esto en cada teléfono de jefes/gerencia.

## Cómo desinstalarla

Igual que cualquier otra app: mantener presionado el ícono → Desinstalar /
Eliminar app.

## Primer uso en cada teléfono

Esta app no tiene usuario ni contraseña — no hace falta loguearse. La
primera vez que se abre en un teléfono nuevo, pide una sola cosa: la **URL
de la app web de Google Apps Script** (ver la sección "Cómo funciona la
app" más abajo). Una vez cargada esa URL, queda guardada en el teléfono y
no la vuelve a pedir.

## Cómo funciona la app (Google Sheets + Apps Script)

La app lee los datos de una planilla de Google Sheets que se carga a mano
— no hay ninguna otra app ni servicio intermedio involucrado.

- La planilla se llama **"Gestión de Producción"** y tiene una hoja
  llamada **"Cargas"** con las columnas: Fecha, Hora, Turno, Producto,
  Lote, BB N°, Pureza, Temperatura ambiente, Temperatura del grano,
  Humedad del grano, Micro, Encargado, Observaciones (la columna ID de la
  izquierda se completa sola, no hay que tocarla). Cada fila es UN bigbag
  individual, no un lote entero — un lote grande simplemente tiene varias
  filas con el mismo N° de Lote.
- Cargá cada bigbag como una fila nueva, igual que en cualquier planilla.
  Apenas escribís el número de Lote, esa fila queda identificada
  automáticamente (columna ID).
- Fecha y Hora se completan las dos a mano — como la carga a la planilla
  no se hace en el momento en que se produce cada bigbag, no tiene sentido
  autocompletarlas con la hora del reloj (sería la hora en que alguien
  tipeó el dato, no la hora real). Por eso, cuando Hora no está cargada
  (lo más común hoy), la app reconstruye el orden cronológico de los
  turnos usando el N° de bigbag como aproximación — ver la vista "Turno"
  dentro de la app.
- La app lee esa planilla a través de una "app web" de Google Apps Script
  (un pequeño backend, ya armado y funcionando) — no hace falta tocar nada
  de esto para el uso diario, solo cargar filas en la planilla.
- Si alguna vez necesitás la URL de esa app web de nuevo (por ejemplo para
  instalarla en un teléfono nuevo), la conseguís abriendo la planilla →
  **Extensiones → Apps Script → Implementar → Administrar
  implementaciones**.
- Desde la app, tocando "Resultado Micro / Observaciones" en el detalle de
  un bigbag, se puede editar ese resultado — el cambio se guarda
  directamente en la planilla, y si no hay señal se guarda en el teléfono
  y se sube solo cuando vuelve la conexión.

## Cómo agregar un campo/columna nuevo más adelante

Cuando quieran sumar un dato nuevo a la planilla (por ejemplo una columna
más de análisis), hay 3 lugares que tocar siempre, en este orden:

1. **La planilla + `apps-script/Code.gs`**: agregar la columna nueva en la
   hoja "Cargas", sumarla al objeto `COL` (con el número de columna que le
   corresponda) y agregar esa propiedad en `getAllCargas()` (el bloque que
   arma cada `cargas.push({...})`). Si es un número (como Pureza o
   Temperatura), usar `numOrNull_(...)` igual que las demás; si es texto,
   alcanza con `row[COL.NUEVOCAMPO - 1] || ''`. Este cambio se pega
   directo en Extensiones → Apps Script dentro de la planilla (la copia en
   `apps-script/Code.gs` de este repositorio es solo de referencia).
2. **`informes/index.html`**: decidir dónde tiene que aparecer ese dato
   nuevo — en la ficha de un bigbag (`abrirModal`), en el promedio de un
   bloque de 25 tons (agregarlo a `promedio_` y a los templates que
   muestran `promedioPureza`, etc.), en la búsqueda, o en varios lugares a
   la vez.
3. **`informes/sw.js`**: subir en 1 el número de `CACHE_NAME` (por ejemplo
   `v26` → `v27`) para que los teléfonos que ya tienen la app instalada
   vean el cambio.

Avisame cuándo tengan definidos los campos nuevos y lo hacemos siguiendo
esta misma receta.

## Si actualizás el contenido más adelante

Cuando yo te pase una nueva versión de `informes/index.html`, el proceso
es:

1. Subir el archivo nuevo al mismo repositorio de GitHub, reemplazando el
   anterior (Add file → Upload files, mismo nombre, GitHub pregunta si
   querés reemplazarlo).
2. **Importante**: para que los teléfonos que ya tienen la app instalada
   vean la actualización, hay que subir también una versión de
   `informes/sw.js` con el número de caché cambiado — por ejemplo
   `CACHE_NAME = 'informes-produccion-v27'` en vez de `v26`. Si no se
   cambia ese número, el teléfono puede seguir mostrando la versión vieja
   guardada. Avisame cuando quieras actualizar y te dejo listo ese archivo
   con el número ya incrementado.

## Nota de seguridad (para tener en cuenta, no urgente)

La URL de la app web de Apps Script queda guardada en el teléfono.
Cualquiera que tenga esa URL puede leer y editar la planilla sin pasar por
una cuenta de Google — por eso conviene compartirla solo con los
teléfonos de jefes/gerencia, igual que harías con una contraseña.

Si en algún momento crece el número de personas con acceso, o preferís que
este dato no quede expuesto en cada teléfono, se puede migrar a un esquema
con un servidor intermedio y autenticación propia — es un cambio más
grande, avisame si te interesa evaluarlo.
