/**
 * SIN FILTRO — Backend en Google Apps Script
 * ==========================================
 * 1. Recibe las respuestas anónimas del juego y las guarda en esta hoja de cálculo.
 * 2. Te manda un correo con cada respuesta (opcional) y un aviso inmediato si
 *    alguna respuesta sugiere riesgo.
 * 3. Te manda un REPORTE SEMANAL con el "mapa del grupo".
 * 4. Entrega los datos al panel (panel.html) si se usa la clave correcta.
 *
 * Instalación: ver README.md (sección "Paso 2").
 */

const AJUSTES = {
  // Correo que recibe los reportes. Vacío = el correo de la cuenta dueña del script.
  EMAIL: '',
  // true = te llega un correo con cada misión completada.
  CORREO_CADA_RESPUESTA: true,
  // Clave para abrir el panel. CÁMBIALA por algo difícil de adivinar.
  CLAVE_PANEL: 'cambia-esta-clave',
  NOMBRE_GRUPO: 'Grupo de Jóvenes',
  HOJA: 'Respuestas',
};

// Mismo orden y códigos que js/preguntas.js
const COLUMNAS = [
  ['Q00', 'Batería emocional', 'unica'],
  ['Q02', 'Pertenencia al grupo', 'unica'],
  ['Q01', 'Reacción ante la presión', 'unica'],
  ['Q03', 'Lo que ocupa su cabeza', 'multiple'],
  ['Q04', 'Qué hace cuando está mal', 'multiple'],
  ['Q05', 'Cuando alguien le falla', 'unica'],
  ['Q06', 'Fe bajo presión', 'unica'],
  ['Q07', 'Relación con Dios hoy', 'unica'],
  ['Q08', 'Pregunta que le haría a Dios', 'abierta'],
  ['Q09', 'Lo que más le cuesta decir', 'multiple'],
  ['Q10', 'La máscara que usa', 'unica'],
  ['Q11', 'Lo que le preocupa y casi nunca dice', 'abierta'],
  ['Q12', 'Cuando fracasa', 'unica'],
  ['Q13', '¿Quisiera hablar de una lucha?', 'unica'],
  ['Q13_texto', 'La lucha (si la escribió)', 'abierta'],
  ['Q14', 'La batalla que enfrentaría primero', 'unica'],
  ['Q15', 'Lo que necesita de la iglesia', 'multiple'],
  ['Q16', 'Lo que le pediría a Dios', 'abierta'],
  ['Q17', 'Lo que la iglesia debería entender', 'abierta'],
];
const ENCABEZADOS_FIJOS = ['Fecha', 'ID', 'Misión', 'Minutos', 'Atención'];

// Palabras que disparan un aviso inmediato. No identifican a nadie:
// sirven para que sepas que alguien del grupo podría necesitar ayuda urgente.
const PALABRAS_ALERTA = [
  'suicid', 'matarme', 'quitarme la vida', 'no quiero vivir', 'no quiero seguir viviendo',
  'quiero morir', 'morirme', 'desaparecer para siempre', 'cortarme', 'me corto', 'autolesi',
  'hacerme daño', 'lastimarme', 'abuso', 'abusó', 'abusaron', 'me violaron', 'violación',
  'me tocó', 'me tocan', 'me pega', 'me golpea', 'me golpean', 'maltrato', 'me amenaza',
];

/* ───────────────────────── RECIBIR RESPUESTAS ───────────────────────── */
function doPost(e) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(20000);
  try {
    const datos = JSON.parse(e.postData.contents);
    const hoja = obtenerHoja_();

    // Nivel extra enviado después: se agrega a la fila existente.
    if (datos && datos.soloExtra) {
      const fila = buscarFilaPorId_(hoja, datos.id);
      const texto = limpiar_(datos.extra);
      const col = ENCABEZADOS_FIJOS.length + COLUMNAS.findIndex(c => c[0] === 'Q17') + 1;
      if (fila) hoja.getRange(fila, col).setValue(texto);
      if (hayAlerta_([texto])) avisarAlerta_(datos.historia || '—', [texto]);
      return respuesta_({ ok: true });
    }

    if (!datos || typeof datos.respuestas !== 'object' || !datos.historia) {
      return respuesta_({ ok: false, error: 'Envío inválido' });
    }
    const r = datos.respuestas;
    if (datos.extra) r.Q17 = datos.extra;
    const valores = COLUMNAS.map(([id]) => {
      const v = r[id];
      if (Array.isArray(v)) return v.map(limpiar_).join(' | ');
      return limpiar_(v || '');
    });
    const textosAbiertos = COLUMNAS
      .map(([id, , tipo], i) => (tipo === 'abierta' ? valores[i] : ''))
      .filter(Boolean);
    const bateriaCritica = /Casi vacía|Apagada/.test(r.Q00 || '');
    const alertaPalabras = hayAlerta_(textosAbiertos);
    const atencion = alertaPalabras ? 'REVISAR' : (bateriaCritica ? 'Batería baja' : '');

    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    hoja.appendRow([fecha, limpiar_(datos.id), limpiar_(datos.historia), Number(datos.minutos) || '', atencion].concat(valores));

    if (alertaPalabras) avisarAlerta_(datos.historia, textosAbiertos);
    else if (AJUSTES.CORREO_CADA_RESPUESTA) correoRespuesta_(datos.historia, valores, atencion);

    return respuesta_({ ok: true });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  } finally {
    bloqueo.releaseLock();
  }
}

/* ───────────────────────── PANEL (panel.html) ───────────────────────── */
function doGet(e) {
  const clave = e && e.parameter && e.parameter.clave;
  if (clave !== AJUSTES.CLAVE_PANEL) return respuesta_({ ok: false, error: 'Clave incorrecta' });
  return respuesta_({ ok: true, grupo: AJUSTES.NOMBRE_GRUPO, columnas: COLUMNAS, filas: leerFilas_() });
}

/* ───────────────────────── REPORTE SEMANAL ───────────────────────── */
function enviarReporteSemanal() {
  const todas = leerFilas_();
  const hace7 = new Date(Date.now() - 7 * 864e5);
  const semana = todas.filter(f => new Date(f.Fecha) >= hace7);
  const html = construirReporte_(todas, semana);
  MailApp.sendEmail({
    to: correoDestino_(),
    subject: `🛰️ Centro de Comando — ${AJUSTES.NOMBRE_GRUPO} (${semana.length} nuevas, ${todas.length} en total)`,
    htmlBody: html,
  });
}

/** Ejecuta esta función UNA VEZ para recibir el reporte cada lunes a las 8 a. m. */
function instalarReporteSemanal() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'enviarReporteSemanal')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('enviarReporteSemanal').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
}

/** Ejecuta esta función para probar que los correos llegan. */
function probarCorreo() {
  MailApp.sendEmail(correoDestino_(), '✅ Sin Filtro: prueba de correo',
    'Si recibes esto, el script ya puede enviarte los reportes.');
}

/* ───────────────────────── CONSTRUCCIÓN DEL REPORTE ───────────────────────── */
function construirReporte_(todas, semana) {
  const n = todas.length;
  if (!n) return '<p>Todavía no hay respuestas.</p>';
  let h = `
  <div style="font-family:Arial,sans-serif;max-width:640px;color:#1b1f27">
    <h1 style="margin:0">🛰️ Centro de Comando</h1>
    <p style="color:#666;margin:4px 0 20px">${AJUSTES.NOMBRE_GRUPO} · ${n} participantes en total · ${semana.length} en los últimos 7 días</p>`;

  const atencion = todas.filter(f => f['Atención']).length;
  if (atencion) {
    h += `<div style="background:#fff3f3;border-left:4px solid #d33;padding:12px 16px;margin-bottom:20px">
      <strong>🚨 ${atencion} respuesta(s) requieren atención</strong> (batería casi vacía/apagada o palabras de riesgo).
      No sabemos quién es: considera mencionar en la próxima reunión que hay personas disponibles para hablar en privado.</div>`;
  }

  h += seccion_('¿Qué misión eligieron?', conteo_(todas.map(f => f['Misión'])), n);

  COLUMNAS.forEach(([id, titulo, tipo]) => {
    if (tipo === 'abierta') return;
    const valores = [];
    todas.forEach(f => String(f[titulo] || '').split(' | ').filter(Boolean).forEach(v => valores.push(v)));
    h += seccion_(titulo, conteo_(valores), n);
  });

  h += '<h2 style="margin-top:32px">💬 Lo que escribieron</h2><p style="color:#666;font-size:13px">Cada lista está en orden aleatorio para proteger el anonimato.</p>';
  COLUMNAS.filter(c => c[2] === 'abierta').forEach(([, titulo]) => {
    const textos = mezclar_(todas.map(f => f[titulo]).filter(Boolean));
    if (!textos.length) return;
    h += `<h3 style="margin:20px 0 8px">${titulo} (${textos.length})</h3><ul>` +
      textos.map(t => `<li style="margin-bottom:6px">${escapar_(t)}</li>`).join('') + '</ul>';
  });

  h += `<p style="color:#999;font-size:12px;margin-top:32px">Porcentajes sobre ${n} participantes. En preguntas de opción múltiple la suma puede superar 100%.</p></div>`;
  return h;
}

function seccion_(titulo, conteo, n) {
  if (!conteo.length) return '';
  const filas = conteo.map(([etiqueta, c]) => {
    const p = Math.round((c / n) * 100);
    return `<tr><td style="padding:4px 8px 4px 0;width:45%">${escapar_(etiqueta)}</td>
      <td style="padding:4px 0"><div style="background:#e8ebf2;border-radius:4px"><div style="background:#5b6ee1;width:${Math.max(p, 2)}%;height:14px;border-radius:4px"></div></div></td>
      <td style="padding:4px 0 4px 8px;white-space:nowrap;font-size:13px">${c} · ${p}%</td></tr>`;
  }).join('');
  return `<h3 style="margin:24px 0 8px">${titulo}</h3><table style="width:100%;border-collapse:collapse;font-size:14px">${filas}</table>`;
}

/* ───────────────────────── CORREOS INDIVIDUALES ───────────────────────── */
function correoRespuesta_(historia, valores, atencion) {
  const filas = COLUMNAS.map(([, titulo], i) => valores[i] ?
    `<tr><td style="padding:6px 10px;color:#666;vertical-align:top;width:40%">${titulo}</td><td style="padding:6px 10px">${escapar_(valores[i])}</td></tr>` : '').join('');
  MailApp.sendEmail({
    to: correoDestino_(),
    subject: `🎮 Nueva misión completada (${historia})${atencion ? ' · ' + atencion : ''}`,
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:640px">
      <p>Alguien completó la misión <strong>${escapar_(historia)}</strong>. Respuesta anónima:</p>
      <table style="border-collapse:collapse;font-size:14px">${filas}</table></div>`,
  });
}

function avisarAlerta_(historia, textos) {
  MailApp.sendEmail({
    to: correoDestino_(),
    subject: '🚨 Sin Filtro: una respuesta necesita tu atención',
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:640px">
      <p>Una respuesta anónima (misión <strong>${escapar_(historia)}</strong>) contiene palabras que podrían indicar
      riesgo (autolesión, ideas de muerte, abuso o violencia). Puede ser una falsa alarma, pero vale la pena actuar.</p>
      <ul>${textos.map(t => `<li>${escapar_(t)}</li>`).join('')}</ul>
      <p><strong>Sugerencias:</strong></p>
      <ul>
        <li>En la próxima reunión, di al grupo (sin señalar a nadie) que hay personas de confianza disponibles para hablar en privado, y comparte una línea de ayuda de tu país.</li>
        <li>Habla con tu pastor. Si hay indicios de abuso a un menor, sigue el protocolo de protección de tu iglesia y la ley local.</li>
        <li>No intentes adivinar quién fue ni lo comentes con el grupo.</li>
      </ul></div>`,
  });
}

/* ───────────────────────── UTILIDADES ───────────────────────── */
function obtenerHoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(AJUSTES.HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(AJUSTES.HOJA);
    hoja.appendRow(ENCABEZADOS_FIJOS.concat(COLUMNAS.map(c => c[1])));
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, hoja.getLastColumn()).setFontWeight('bold');
  }
  return hoja;
}

function leerFilas_() {
  const hoja = obtenerHoja_();
  const datos = hoja.getDataRange().getDisplayValues();
  const enc = datos.shift();
  return datos.map(fila => {
    const o = {};
    enc.forEach((k, i) => { o[k] = fila[i]; });
    delete o.ID;
    return o;
  });
}

function buscarFilaPorId_(hoja, id) {
  if (!id || hoja.getLastRow() < 2) return null;
  const ids = hoja.getRange(2, 2, hoja.getLastRow() - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === String(id)) return i + 2;
  return null;
}

function hayAlerta_(textos) {
  const t = textos.join(' ').toLowerCase();
  return PALABRAS_ALERTA.some(p => t.indexOf(p) !== -1);
}

function conteo_(lista) {
  const m = {};
  lista.filter(Boolean).forEach(v => { m[v] = (m[v] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function mezclar_(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Evita fórmulas inyectadas en la hoja y recorta textos largos.
function limpiar_(v) {
  let s = String(v == null ? '' : v).slice(0, 1500).trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function escapar_(s) {
  return String(s).replace(/^'/, '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function correoDestino_() {
  return AJUSTES.EMAIL || Session.getEffectiveUser().getEmail();
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
