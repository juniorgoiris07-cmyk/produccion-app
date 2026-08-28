# Guía: publicar e instalar la app en el celular

Esta guía te lleva paso a paso desde "tengo estos archivos" hasta "tengo la
app instalada en el teléfono". No hace falta saber programar — son todo
clics en páginas web.

## Qué contiene esta carpeta

```
pwa-produccion/
├── index.html            (pantalla para elegir qué app abrir)
├── carga/                 (la app — registrar un bigbag nuevo)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
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

Son dos apps separadas que comparten la misma planilla: **Carga** para
registrar bigbags nuevos desde el celular, e **Informes** para consultarlos
después. Las dos se instalan por separado (ver Paso 5), y las dos piden la
misma URL de Apps Script la primera vez — si ya configuraste una, la otra
la hereda sola en el mismo teléfono. Para distinguirlas de un vistazo (los
dos íconos van a quedar uno al lado del otro en la pantalla del teléfono),
el ícono de Carga tiene un círculo dorado con un "+" superpuesto sobre el
isologo de Progresso; el de Informes es el isologo solo.

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
   `index.html` de la raíz y las carpetas `carga/` e `informes/`
   completas) a esa pantalla.
   - Importante: tiene que quedar la estructura de carpetas tal cual está.
     Si tu navegador no te deja arrastrar carpetas enteras, subí primero el
     `index.html` de la raíz, y después entrá a cada subcarpeta (`carga/`,
     `informes/`) y repetí "Add file → Upload files" ahí adentro.
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

Esa es tu URL fija con HTTPS. Abriéndola directo en la raíz vas a ver una
pantalla para elegir qué app abrir:

- `https://TU-USUARIO.github.io/produccion-app/carga/` — Carga (registrar
  bigbags).
- `https://TU-USUARIO.github.io/produccion-app/informes/` — Informes (ver
  lo cargado).

## Paso 5 — Instalar en el celular

Son dos apps, así que hay que instalar cada una por separado (mismos pasos,
repetidos con cada URL de arriba). Quien solo carga bigbags necesita
Carga; quien solo consulta necesita Informes; alguien que hace las dos
cosas puede instalar ambas.

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

Repetí esto (con cada app que corresponda) en cada teléfono.

## Cómo desinstalarla

Igual que cualquier otra app: mantener presionado el ícono → Desinstalar /
Eliminar app.

## Primer uso en cada teléfono

Ninguna de las dos apps tiene usuario ni contraseña — no hace falta
loguearse. La primera vez que se abre alguna en un teléfono nuevo, pide
una sola cosa: la **URL de la app web de Google Apps Script** (ver la
sección "Cómo funciona todo esto" más abajo). Una vez cargada esa URL,
queda guardada en el teléfono y la comparten las dos apps — si instalás
la segunda después, no te la vuelve a pedir.

## Cómo funciona todo esto (Google Sheets + Apps Script)

Las dos apps leen y escriben en una misma planilla de Google Sheets — no
hay ninguna otra app ni servicio intermedio involucrado.

- La planilla se llama **"Gestión de Producción"** y tiene una hoja
  llamada **"Cargas"** con las columnas: Fecha, Hora, Turno, Producto,
  Lote, BB N°, Pureza, Temperatura ambiente, Temperatura del grano,
  Humedad del grano, Micro, Encargado, Observaciones (la columna ID de la
  izquierda se completa sola, no hay que tocarla). Cada fila es UN bigbag
  individual, no un lote entero — un lote grande simplemente tiene varias
  filas con el mismo N° de Lote.
- **Carga** es la forma normal de agregar cada bigbag: un formulario que
  sugiere solo Fecha, Hora, Turno y el próximo N° de BigBag (según lo
  último cargado), y al tocar "Registrar bigbag" agrega la fila directo en
  la planilla. Si no hay señal, el bigbag queda guardado en el teléfono y
  se sube solo cuando vuelve la conexión (nunca se pierde un dato por
  falta de señal). También se puede seguir cargando filas a mano
  directamente en la planilla, igual que antes — las dos formas conviven
  sin problema.
- Fecha y Hora, cuando se cargan desde la app de Carga, quedan con el
  momento real en que se registró el bigbag (la app sugiere la hora del
  reloj del teléfono, editable). En cambio, si se completan a mano en la
  planilla y no coinciden con el momento real de producción, no importa:
  cuando Hora no está cargada la app de Informes reconstruye el orden
  cronológico de los turnos usando el N° de bigbag como aproximación — ver
  la vista "Turno" dentro de Informes.
- Abajo del formulario, Carga muestra los últimos bigbags cargados (los
  últimos 8, según N° de BigBag) y cada uno tiene una ✕ para eliminarlo —
  útil si se cargó algo mal. Pide confirmación antes de borrar y no se
  puede deshacer. Si se borra sin señal, queda igual guardado el pedido de
  borrado y se aplica solo apenas vuelve la conexión.
- **Informes** es para consultar lo cargado: lotes, turnos, bloques de 25
  tons y detalle por bigbag. No hace falta tocar nada para el uso diario,
  solo abrir la app. Desde Carga no hay forma de llegar a Informes (son
  apps separadas a propósito); si alguien necesita las dos, instala las
  dos por separado.
- Las dos apps hablan con la planilla a través de una "app web" de Google
  Apps Script (un pequeño backend, ya armado y funcionando).
- Si alguna vez necesitás la URL de esa app web de nuevo (por ejemplo para
  instalarla en un teléfono nuevo), la conseguís abriendo la planilla →
  **Extensiones → Apps Script → Implementar → Administrar
  implementaciones**.
- Desde Informes, tocando "Resultado Micro / Observaciones" en el detalle
  de un bigbag, se puede editar ese resultado — el cambio se guarda
  directamente en la planilla, y si no hay señal se guarda en el teléfono
  y se sube solo cuando vuelve la conexión (mismo mecanismo que usa Carga
  para no perder datos sin señal).

## Cómo agregar un campo/columna nuevo más adelante

Cuando quieran sumar un dato nuevo a la planilla (por ejemplo una columna
más de análisis), hay 4 lugares que tocar siempre, en este orden:

1. **La planilla + `apps-script/Code.gs`**: agregar la columna nueva en la
   hoja "Cargas", sumarla al objeto `COL` (con el número de columna que le
   corresponda), agregar esa propiedad en `getAllCargas()` (el bloque que
   arma cada `cargas.push({...})`) y también en `crearCarga()` (el bloque
   que arma la fila nueva, para que la app de Carga también la mande). Si
   es un número (como Pureza o Temperatura), usar `numOrNull_(...)` igual
   que las demás; si es texto, alcanza con `row[COL.NUEVOCAMPO - 1] || ''`.
   Este cambio se pega directo en Extensiones → Apps Script dentro de la
   planilla (la copia en `apps-script/Code.gs` de este repositorio es solo
   de referencia).
2. **`carga/index.html`**: agregar el campo nuevo al formulario (un
   `<div class="field">` más) y sumarlo en `leerCampos_()` para que se
   mande al guardar.
3. **`informes/index.html`**: decidir dónde tiene que aparecer ese dato
   nuevo — en la ficha de un bigbag (`abrirModal`), en el promedio de un
   bloque de 25 tons (agregarlo a `promedio_` y a los templates que
   muestran `promedioPureza`, etc.), en la búsqueda, o en varios lugares a
   la vez.
4. **`carga/sw.js` e `informes/sw.js`**: subir en 1 el número de
   `CACHE_NAME` de cada uno (por ejemplo `v1` → `v2`, o `v27` → `v28`) para
   que los teléfonos que ya tienen la app instalada vean el cambio.

Avisame cuándo tengan definidos los campos nuevos y lo hacemos siguiendo
esta misma receta.

## Si actualizás el contenido más adelante

Cuando yo te pase una nueva versión de `carga/index.html` o de
`informes/index.html`, el proceso es:

1. Subir el archivo nuevo al mismo repositorio de GitHub, reemplazando el
   anterior (Add file → Upload files, mismo nombre, GitHub pregunta si
   querés reemplazarlo).
2. **Importante**: para que los teléfonos que ya tienen esa app instalada
   vean la actualización, hay que subir también una versión de su `sw.js`
   con el número de caché cambiado — por ejemplo
   `CACHE_NAME = 'informes-produccion-v28'` en vez de `v27` (o
   `'carga-produccion-v2'` en vez de `v1`). Si no se cambia ese número, el
   teléfono puede seguir mostrando la versión vieja guardada. Avisame
   cuando quieras actualizar y te dejo listo ese archivo con el número ya
   incrementado.

## Nota de seguridad (para tener en cuenta, no urgente)

La URL de la app web de Apps Script queda guardada en el teléfono.
Cualquiera que tenga esa URL puede leer y editar la planilla sin pasar por
una cuenta de Google — por eso conviene compartirla solo con los
teléfonos de jefes/gerencia, igual que harías con una contraseña.

Si en algún momento crece el número de personas con acceso, o preferís que
este dato no quede expuesto en cada teléfono, se puede migrar a un esquema
con un servidor intermedio y autenticación propia — es un cambio más
grande, avisame si te interesa evaluarlo.
