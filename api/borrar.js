// Borra TODAS las respuestas guardadas. Solo con la clave del panel.
import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let datos = req.body;
  try { if (typeof datos === 'string') datos = JSON.parse(datos); } catch (e) { datos = null; }

  const clave = process.env.PANEL_CLAVE;
  if (!clave || !datos || datos.clave !== clave) {
    return res.status(401).json({ ok: false, error: 'Clave incorrecta' });
  }
  if (datos.confirmar !== 'BORRAR') {
    return res.status(400).json({ ok: false, error: 'Falta confirmar' });
  }

  let borradas = 0;
  let cursor;
  do {
    const r = await list({ prefix: 'respuestas/', cursor, limit: 1000 });
    if (r.blobs.length) {
      await del(r.blobs.map(b => b.url));
      borradas += r.blobs.length;
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);

  return res.status(200).json({ ok: true, borradas });
}
