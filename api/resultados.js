// Entrega las respuestas al Centro de Comando (panel.html), solo con la clave correcta.
import { list, get } from '@vercel/blob';
import { COLUMNAS } from './_comun.js';

export default async function handler(req, res) {
  const clave = process.env.PANEL_CLAVE;
  if (!clave || req.query.clave !== clave) {
    return res.status(401).json({ ok: false, error: 'Clave incorrecta' });
  }

  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix: 'respuestas/', cursor, limit: 1000 });
    blobs.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);

  const registros = await Promise.all(blobs.map(async b => {
    try {
      const r = await get(b.pathname, { access: 'private', useCache: false });
      return r && r.statusCode === 200 ? JSON.parse(await new Response(r.stream).text()) : null;
    } catch (e) {
      return null;
    }
  }));

  // Mismo formato que usaba la versión de Google Sheets.
  const filas = registros.filter(Boolean).map(reg => {
    const f = { Fecha: reg.fecha, 'Misión': reg.historia, Minutos: reg.minutos, 'Atención': reg.atencion || '' };
    COLUMNAS.forEach(([id, titulo]) => {
      const v = reg.respuestas[id];
      f[titulo] = Array.isArray(v) ? v.join(' | ') : (v || '');
    });
    return f;
  });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, columnas: COLUMNAS, filas });
}
