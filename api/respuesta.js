// Recibe las respuestas anónimas del juego, las guarda y avisa por WhatsApp.
import { put, get } from '@vercel/blob';
import { limpiar, nivelAtencion, hayAlerta, enviarWhatsApp, mensajeWhatsApp } from './_comun.js';

const OPCIONES = { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' };

async function leerRegistro(id) {
  const r = await get(`respuestas/${id}.json`, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let datos = req.body;
  try { if (typeof datos === 'string') datos = JSON.parse(datos); } catch (e) { datos = null; }

  const id = String((datos && datos.id) || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  if (!id) return res.status(400).json({ ok: false, error: 'Envío inválido' });

  // Nivel extra: se agrega al registro de la misma misión.
  if (datos.soloExtra) {
    const texto = limpiar(datos.extra);
    const reg = await leerRegistro(id);
    if (reg && texto) {
      reg.respuestas.Q17 = texto;
      if (hayAlerta([texto])) reg.atencion = 'REVISAR';
      await put(`respuestas/${id}.json`, JSON.stringify(reg), OPCIONES);
      await enviarWhatsApp(`${hayAlerta([texto]) ? '🚨 *ATENCIÓN* (posible riesgo)\n' : ''}➕ *Nivel extra* (${reg.historia})\n*Lo que la iglesia debería entender:* ${texto.slice(0, 1200)}`);
    }
    return res.status(200).json({ ok: true });
  }

  if (typeof datos.respuestas !== 'object' || !datos.historia) {
    return res.status(400).json({ ok: false, error: 'Envío inválido' });
  }
  const respuestas = {};
  Object.entries(datos.respuestas).forEach(([k, v]) => {
    if (/^Q\d\d(_texto)?$/.test(k)) respuestas[k] = limpiar(v);
  });
  if (datos.extra) respuestas.Q17 = limpiar(datos.extra);

  const reg = {
    fecha: new Date().toISOString().slice(0, 10), // solo la fecha, sin hora
    historia: limpiar(datos.historia, 40),
    minutos: Math.min(Number(datos.minutos) || 0, 600),
    respuestas,
  };
  reg.atencion = nivelAtencion(respuestas);

  await put(`respuestas/${id}.json`, JSON.stringify(reg), OPCIONES);
  await enviarWhatsApp(mensajeWhatsApp(reg));
  return res.status(200).json({ ok: true });
}
