/*
 * CONFIGURACIÓN — lo único que necesitas editar.
 * Normalmente no necesitas cambiar nada aquí, salvo LINEA_AYUDA.
 */
const CONFIG = {
  // Adónde se envían las respuestas. '/api/respuesta' = el servidor de Vercel
  // donde está publicado el juego (guarda y te avisa por WhatsApp).
  // Si usas Google Apps Script en su lugar, pega aquí su URL (termina en /exec).
  // Si lo dejas vacío, el juego funciona en "modo prueba" y no envía nada.
  URL_ENVIO: '/api/respuesta',

  // De dónde lee el panel los resultados.
  URL_RESULTADOS: '/api/resultados',

  // Nombre que verán los jóvenes en la pantalla inicial.
  NOMBRE_GRUPO: 'Grupo de Jóvenes',

  // Mensaje de apoyo al final. Pon aquí a quién pueden acudir en tu iglesia
  // y una línea de ayuda de tu país (por ejemplo, la línea de prevención del
  // suicidio o de salud mental). Déjalo vacío para no mostrarlo.
  CONTACTO_APOYO: 'Si necesitas hablar con alguien, los líderes del grupo estamos para escucharte, sin juicio.',
  LINEA_AYUDA: '', // Ej.: 'Línea de la Vida (México): 800 911 2000'
};
