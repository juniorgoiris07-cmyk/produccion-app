/**
 * Backend de la planilla "Gestión Comercial" — maneja el login de la app de
 * Informes (sección Comercial). Es un backend SEPARADO del de "Gestión de
 * Producción": este solo se ocupa de usuarios/sesiones, nunca toca datos de
 * producción.
 *
 * Columnas de la hoja "Usuarios" (fila 1 = encabezados). Se puede agregar,
 * editar o desactivar gente a mano, directo en la planilla, sin tocar
 * código:
 *   A: Nombre       (nombre para mostrar, ej "Juliana")
 *   B: Usuario      (con esto se loguea; debe ser único; sensible a
 *                     mayúsculas/minúsculas exacto)
 *   C: Contraseña   (texto plano — a propósito, para que sea fácil de
 *                     editar a mano; no se usa para nada más sensible)
 *   D: Rol          (uno de: produccion / comercial / admin — exacto, en
 *                     minúsculas)
 *   E: Activo       (SI / NO — con NO, ese usuario no puede loguearse más
 *                     aunque la fila siga ahí)
 *
 * Columnas de la hoja "Sesiones" (fila 1 = encabezados; se completa sola,
 * no hace falta tocarla a mano):
 *   A: Token        (identificador de sesión, se genera solo)
 *   B: Usuario
 *   C: Rol
 *   D: Nombre
 *   E: Creado       (fecha y hora en que se logueó)
 *   F: Expira       (fecha y hora hasta la que vale la sesión)
 *
 * Cómo se usa:
 *   - GET  ?action=verificarSesion&token=... -> valida un token guardado en
 *     el celular/navegador y devuelve { ok, usuario, rol, nombre } si sigue
 *     vigente, o { ok:false } si no (vencido, o no existe).
 *   - POST { action:"login", usuario, contraseña } -> valida contra
 *     "Usuarios" y, si es correcto, crea una fila nueva en "Sesiones" y
 *     devuelve { ok:true, token, rol, nombre, usuario }.
 *   - POST { action:"logout", token } -> borra esa sesión (cierra sesión en
 *     ese dispositivo).
 */

const USUARIOS_SHEET_NAME = 'Usuarios';
const USUARIOS_COL = { NOMBRE: 1, USUARIO: 2, CONTRASENA: 3, ROL: 4, ACTIVO: 5 };

const SESIONES_SHEET_NAME = 'Sesiones';
const SESIONES_COL = { TOKEN: 1, USUARIO: 2, ROL: 3, NOMBRE: 4, CREADO: 5, EXPIRA: 6 };

// Cuántos días dura una sesión antes de tener que loguearse de nuevo.
const DIAS_SESION = 30;

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'verificarSesion') {
    const token = e.parameter.token;
    const sesion = validarSesion_(token);
    if (!sesion) return respond({ ok: false });
    return respond({ ok: true, usuario: sesion.usuario, rol: sesion.rol, nombre: sesion.nombre });
  }
  return respond({ ok: false, error: 'Acción desconocida' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'login') {
      return respond(login_(body.usuario, body.contrasena));
    }
    if (body.action === 'logout') {
      return respond(logout_(body.token));
    }
    return respond({ ok: false, error: 'Acción desconocida: ' + body.action });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

function getUsuariosSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USUARIOS_SHEET_NAME);
  if (!sheet) throw new Error('No existe una hoja llamada "' + USUARIOS_SHEET_NAME + '"');
  return sheet;
}

function getSesionesSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SESIONES_SHEET_NAME);
  if (!sheet) throw new Error('No existe una hoja llamada "' + SESIONES_SHEET_NAME + '"');
  return sheet;
}

/**
 * Valida usuario/contraseña contra la hoja "Usuarios" (match exacto,
 * sensible a mayúsculas/minúsculas) y, si son correctos y el usuario está
 * Activo=SI, crea una sesión nueva en "Sesiones" y la devuelve.
 */
function login_(usuario, contrasena) {
  usuario = String(usuario || '').trim();
  contrasena = String(contrasena || '');
  if (!usuario || !contrasena) return { ok: false, error: 'Falta usuario o contraseña' };

  const sheet = getUsuariosSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: false, error: 'Usuario o contraseña incorrectos' };
  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const filaUsuario = String(row[USUARIOS_COL.USUARIO - 1] || '');
    if (filaUsuario !== usuario) continue;
    const filaContrasena = String(row[USUARIOS_COL.CONTRASENA - 1] || '');
    const filaActivo = String(row[USUARIOS_COL.ACTIVO - 1] || '').trim().toUpperCase();
    if (filaActivo !== 'SI') return { ok: false, error: 'Este usuario está desactivado' };
    if (filaContrasena !== contrasena) return { ok: false, error: 'Usuario o contraseña incorrectos' };

    const rol = String(row[USUARIOS_COL.ROL - 1] || '').trim().toLowerCase();
    const nombre = String(row[USUARIOS_COL.NOMBRE - 1] || '') || usuario;
    return crearSesion_(usuario, rol, nombre);
  }
  return { ok: false, error: 'Usuario o contraseña incorrectos' };
}

function crearSesion_(usuario, rol, nombre) {
  const lock = LockService.getScriptLock();
  const gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: 'La planilla está ocupada, probá de nuevo en unos segundos' };
  try {
    const sheet = getSesionesSheet_();
    const token = Utilities.getUuid();
    const ahora = new Date();
    const expira = new Date(ahora.getTime() + DIAS_SESION * 24 * 60 * 60 * 1000);
    const fila = [];
    fila[SESIONES_COL.TOKEN - 1] = token;
    fila[SESIONES_COL.USUARIO - 1] = usuario;
    fila[SESIONES_COL.ROL - 1] = rol;
    fila[SESIONES_COL.NOMBRE - 1] = nombre;
    fila[SESIONES_COL.CREADO - 1] = ahora;
    fila[SESIONES_COL.EXPIRA - 1] = expira;
    sheet.appendRow(fila);
    SpreadsheetApp.flush();
    return { ok: true, token: token, rol: rol, nombre: nombre, usuario: usuario };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Busca un token en "Sesiones" y, si existe y no venció, devuelve los
 * datos de esa sesión. Si venció o no existe, devuelve null.
 */
function validarSesion_(token) {
  token = String(token || '').trim();
  if (!token) return null;
  const sheet = getSesionesSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const ahora = new Date();
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (String(row[SESIONES_COL.TOKEN - 1]) !== token) continue;
    const expira = row[SESIONES_COL.EXPIRA - 1];
    if (expira && new Date(expira) < ahora) return null; // vencida
    return {
      usuario: row[SESIONES_COL.USUARIO - 1] || '',
      rol: row[SESIONES_COL.ROL - 1] || '',
      nombre: row[SESIONES_COL.NOMBRE - 1] || ''
    };
  }
  return null;
}

/**
 * Borra por completo la fila de esa sesión (cierra sesión en ese
 * dispositivo). Si el token no existe, no es un error — total el efecto
 * buscado (que ese token ya no sirva) ya se cumple.
 */
function logout_(token) {
  token = String(token || '').trim();
  if (!token) return { ok: true };
  const lock = LockService.getScriptLock();
  const gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: 'La planilla está ocupada, probá de nuevo en unos segundos' };
  try {
    const sheet = getSesionesSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: true };
    const tokens = sheet.getRange(2, SESIONES_COL.TOKEN, lastRow - 1, 1).getValues();
    for (let i = 0; i < tokens.length; i++) {
      if (String(tokens[i][0]) === token) {
        sheet.deleteRow(i + 2);
        SpreadsheetApp.flush();
        break;
      }
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
