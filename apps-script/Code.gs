/**
 * Backend de la planilla "Gestión de Producción" para la app de Informes.
 *
 * Columnas de la hoja "Cargas" (fila 1 = encabezados). Cada fila es UN
 * bigbag individual (no un lote entero):
 *   A: ID              (se autocompleta solo, no tocar)
 *   B: Fecha           (AAAA-MM-DD)
 *   C: Hora            (HH:MM)
 *   D: Turno
 *   E: Producto
 *   F: Lote            (varios bigbags comparten el mismo N° de lote)
 *   G: BB N°           (número de bigbag dentro del lote)
 *   H: Pureza
 *   I: Temperatura ambiente
 *   J: Temperatura del grano
 *   K: Humedad del grano
 *   L: Micro
 *   M: Encargado
 *   N: Observaciones
 *
 * Cómo se usa:
 *   - GET  -> devuelve todos los bigbags cargados, en JSON. La app de
 *     Informes agrupa por Lote y arma el lote completo/en curso.
 *   - POST { action: "create", fecha, hora, turno, producto, lote, bb,
 *     pureza, temperaturaAmbiente, temperaturaGrano, humedadGrano, micro,
 *     encargado, obs } -> agrega una fila nueva al final de la hoja
 *     "Cargas" (la usa la app de Carga). El ID se genera solo en el
 *     servidor.
 *   - POST { action: "update", id, micro, observaciones } -> actualiza esas
 *     dos columnas para el bigbag con ese ID, y solo esas dos.
 *
 * Se puede seguir cargando filas a mano directo en la hoja "Cargas"
 * (Fecha, Hora, Turno, Producto, Lote, BB N°, Pureza, Temperatura
 * ambiente, Temperatura del grano, Humedad del grano, Micro, Encargado,
 * Observaciones) igual que siempre — el ID de la columna A se completa
 * solo apenas escribís el Lote (ver onEdit más abajo). La app de Carga usa
 * la acción "create" de arriba, que hace lo mismo pero desde el celular.
 */

const SHEET_NAME = 'Cargas';
const COL = {
  ID: 1, FECHA: 2, HORA: 3, TURNO: 4, PRODUCTO: 5, LOTE: 6, BB: 7,
  PUREZA: 8, TEMP_AMBIENTE: 9, TEMP_GRANO: 10, HUMEDAD: 11, MICRO: 12,
  ENCARGADO: 13, OBS: 14
};

function doGet(e) {
  return respond(getAllCargas());
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'update') {
      return respond(updateCarga(body.id, body.micro, body.observaciones));
    }
    if (body.action === 'create') {
      return respond(crearCarga(body));
    }
    return respond({ ok: false, error: 'Acción desconocida: ' + body.action });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No existe una hoja llamada "' + SHEET_NAME + '"');
  return sheet;
}

function numOrNull_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  // Algunas celdas quedan como texto con coma decimal (ej "99,96" en vez de
  // 99.96) según el formato regional de la planilla. Number() de JS no
  // entiende la coma y devuelve NaN -> se perdía el dato. Se normaliza a
  // punto antes de convertir.
  const n = Number(String(v).trim().replace(',', '.'));
  return isNaN(n) ? null : n;
}

function getAllCargas() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, cargas: [] };
  const data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  const cargas = [];
  data.forEach(function (row) {
    const id = row[COL.ID - 1];
    const lote = row[COL.LOTE - 1];
    if (!id && !lote) return; // fila vacía, se ignora
    cargas.push({
      id: String(id || ''),
      fecha: formatDate_(row[COL.FECHA - 1]),
      hora: formatTime_(row[COL.HORA - 1]),
      turno: row[COL.TURNO - 1] || '',
      producto: row[COL.PRODUCTO - 1] || '',
      lote: lote || '',
      bb: numOrNull_(row[COL.BB - 1]),
      pureza: numOrNull_(row[COL.PUREZA - 1]),
      temperaturaAmbiente: numOrNull_(row[COL.TEMP_AMBIENTE - 1]),
      temperaturaGrano: numOrNull_(row[COL.TEMP_GRANO - 1]),
      humedadGrano: numOrNull_(row[COL.HUMEDAD - 1]),
      micro: row[COL.MICRO - 1] || '',
      encargado: row[COL.ENCARGADO - 1] || '',
      obs: row[COL.OBS - 1] || ''
    });
  });
  return { ok: true, cargas: cargas };
}

function updateCarga(id, micro, observaciones) {
  if (!id) return { ok: false, error: 'Falta el ID del bigbag' };
  const lock = LockService.getScriptLock();
  const gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: 'La planilla está ocupada, probá de nuevo en unos segundos' };
  try {
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'No se encontró el bigbag' };
    const ids = sheet.getRange(2, COL.ID, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        const row = i + 2;
        sheet.getRange(row, COL.MICRO).setValue(micro);
        sheet.getRange(row, COL.OBS).setValue(observaciones);
        SpreadsheetApp.flush();
        return { ok: true };
      }
    }
    return { ok: false, error: 'No se encontró el bigbag (el ID no coincide con ninguna fila)' };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Agrega una fila nueva a la hoja "Cargas" — la usa la app de Carga cuando
 * alguien registra un bigbag desde el celular. El ID se genera acá mismo
 * (Utilities.getUuid()), porque appendRow() no dispara el trigger onEdit
 * (ese trigger solo corre para ediciones manuales de una celda), así que
 * si no se genera acá la fila quedaría sin ID.
 */
function crearCarga(body) {
  if (!body.lote) return { ok: false, error: 'Falta el Lote' };
  const lock = LockService.getScriptLock();
  const gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: 'La planilla está ocupada, probá de nuevo en unos segundos' };
  try {
    const sheet = getSheet_();
    const id = Utilities.getUuid();
    const fila = [];
    fila[COL.ID - 1] = id;
    fila[COL.FECHA - 1] = body.fecha || '';
    fila[COL.HORA - 1] = body.hora || '';
    fila[COL.TURNO - 1] = body.turno || '';
    fila[COL.PRODUCTO - 1] = body.producto || '';
    fila[COL.LOTE - 1] = body.lote || '';
    fila[COL.BB - 1] = body.bb === '' || body.bb === undefined ? '' : body.bb;
    fila[COL.PUREZA - 1] = body.pureza === '' || body.pureza === undefined ? '' : body.pureza;
    fila[COL.TEMP_AMBIENTE - 1] = body.temperaturaAmbiente === '' || body.temperaturaAmbiente === undefined ? '' : body.temperaturaAmbiente;
    fila[COL.TEMP_GRANO - 1] = body.temperaturaGrano === '' || body.temperaturaGrano === undefined ? '' : body.temperaturaGrano;
    fila[COL.HUMEDAD - 1] = body.humedadGrano === '' || body.humedadGrano === undefined ? '' : body.humedadGrano;
    fila[COL.MICRO - 1] = body.micro || '';
    fila[COL.ENCARGADO - 1] = body.encargado || '';
    fila[COL.OBS - 1] = body.obs || '';
    sheet.appendRow(fila);
    SpreadsheetApp.flush();
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function formatDate_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function formatTime_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(v);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Se ejecuta solo, cada vez que editás una celda de la planilla.
 * Si completaste el Lote (columna F) de una fila nueva y esa fila todavía
 * no tiene ID (columna A), le asigna uno automáticamente. No requiere
 * ninguna acción manual — es la forma en que cada bigbag que cargás a mano
 * queda identificable para que la app pueda editarlo después.
 *
 * NOTA: en algún momento se probó autocompletar también la Hora acá (con
 * la hora real del reloj al momento de tipear la fila), pero se descartó:
 * como la carga a la planilla no se hace en el momento en que se produce
 * cada bigbag, esa hora hubiera sido la hora de tipeo, no la hora real de
 * producción — un dato que parece bueno pero en realidad es incorrecto.
 * Por eso Fecha y Hora se siguen completando las dos a mano, como hasta
 * ahora, y la app de Informes sigue reconstruyendo el orden cronológico
 * por N° de bigbag cuando Hora no está cargada.
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  const row = e.range.getRow();
  if (row === 1) return; // encabezado
  const idCell = sheet.getRange(row, COL.ID);
  if (idCell.getValue()) return; // ya tiene ID
  const loteCell = sheet.getRange(row, COL.LOTE);
  if (loteCell.getValue()) {
    idCell.setValue(Utilities.getUuid());
  }
}
