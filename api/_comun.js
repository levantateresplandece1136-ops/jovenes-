// Definiciones compartidas por las funciones del servidor.
// Mismo orden y códigos que js/preguntas.js

export const COLUMNAS = [
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

// Palabras que marcan una respuesta para revisión urgente.
// No identifican a nadie: avisan que alguien del grupo podría necesitar ayuda.
const PALABRAS_ALERTA = [
  'suicid', 'matarme', 'quitarme la vida', 'no quiero vivir', 'no quiero seguir viviendo',
  'quiero morir', 'morirme', 'desaparecer para siempre', 'cortarme', 'me corto', 'autolesi',
  'hacerme daño', 'lastimarme', 'abuso', 'abusó', 'abusaron', 'me violaron', 'violación',
  'me tocó', 'me tocan', 'me pega', 'me golpea', 'me golpean', 'maltrato', 'me amenaza',
];

export function limpiar(v, max = 1500) {
  if (Array.isArray(v)) return v.map(x => limpiar(x, 200)).filter(Boolean).slice(0, 12);
  return String(v == null ? '' : v).slice(0, max).trim();
}

export function hayAlerta(textos) {
  const t = textos.join(' ').toLowerCase();
  return PALABRAS_ALERTA.some(p => t.includes(p));
}

export function textosAbiertos(r) {
  return COLUMNAS.filter(c => c[2] === 'abierta').map(c => r[c[0]]).filter(Boolean);
}

export function nivelAtencion(r) {
  if (hayAlerta(textosAbiertos(r))) return 'REVISAR';
  if (/Casi vacía|Apagada/.test(r.Q00 || '')) return 'Batería baja';
  return '';
}

/**
 * Envía un WhatsApp al líder usando CallMeBot (gratis).
 * Requiere las variables WHATSAPP_TELEFONO y WHATSAPP_APIKEY en Vercel.
 */
export async function enviarWhatsApp(texto) {
  const tel = process.env.WHATSAPP_TELEFONO;
  const key = process.env.WHATSAPP_APIKEY;
  if (!tel || !key) return false;
  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(tel) +
    '&apikey=' + encodeURIComponent(key) + '&text=' + encodeURIComponent(texto.slice(0, 3000));
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return r.ok;
  } catch (e) {
    return false;
  }
}

export function mensajeWhatsApp(reg) {
  const r = reg.respuestas;
  const lineas = [];
  if (reg.atencion === 'REVISAR') {
    lineas.push('🚨 *ATENCIÓN*: esta respuesta contiene palabras de posible riesgo (autolesión, muerte, abuso o violencia). No sabemos quién es: en la próxima reunión recuerda al grupo que hay personas disponibles para hablar en privado, y habla con tu pastor.', '');
  } else if (reg.atencion) {
    lineas.push('⚠️ Batería emocional muy baja.', '');
  }
  lineas.push(`🎮 *Nueva misión completada* (${reg.historia}, ${reg.minutos} min)`, '');
  COLUMNAS.forEach(([id, titulo]) => {
    let v = r[id];
    if (Array.isArray(v)) v = v.join(', ');
    if (!v) return;
    if (String(v).length > 400) v = String(v).slice(0, 400) + '…';
    lineas.push(`*${titulo}:* ${v}`);
  });
  return lineas.join('\n');
}
