/*
 * BANCO MAESTRO DE PREGUNTAS
 * --------------------------
 * Las 5 historias usan exactamente estas preguntas (mismos códigos),
 * solo cambian la escena y el texto de las opciones. Así los resultados
 * se pueden comparar sin importar qué misión eligió cada joven.
 *
 * tipo:
 *   unica     -> una sola opción
 *   multiple  -> varias opciones (max = límite)
 *   abierta   -> texto libre (siempre se puede saltar)
 *   secreto   -> sí / no / no estoy seguro + texto opcional
 *
 * "etiqueta" es el texto neutral que se guarda y llega a tu correo.
 */
const PREGUNTAS = {
  Q00: {
    dim: 'Ánimo', corto: 'Batería emocional', tipo: 'unica',
    opciones: [
      ['llena', 'Llena: me siento bien'],
      ['media', 'A la mitad: voy bien, pero cansado(a)'],
      ['baja', 'Baja: me está costando'],
      ['critica', 'Casi vacía: estoy agotado(a) por dentro'],
      ['apagada', 'Apagada: siento que ya no puedo más'],
    ],
  },
  Q01: {
    dim: 'Presión', corto: 'Reacción ante la presión', tipo: 'unica',
    opciones: [
      ['control', 'Toma el control'],
      ['ayuda', 'Busca a alguien que sepa qué hacer'],
      ['calma', 'Intenta calmar a los demás'],
      ['bloqueo', 'Se bloquea / se congela'],
      ['huir', 'Quiere salir de ahí / evitarlo'],
    ],
  },
  Q02: {
    dim: 'Relaciones', corto: 'Pertenencia al grupo', tipo: 'unica',
    opciones: [
      ['integra', 'Se acerca y se integra'],
      ['espera', 'Espera a que alguien se acerque'],
      ['margen', 'Se queda al margen (observa, usa el celular)'],
      ['ausente', 'Está, pero quisiera estar en otro lugar'],
    ],
  },
  Q03: {
    dim: 'Heridas', corto: 'Lo que ocupa su cabeza', tipo: 'multiple', max: 3,
    opciones: [
      ['opinion', 'Lo que otros piensan de mí'],
      ['pareja', 'Una relación / pareja'],
      ['familia', 'Problemas familiares'],
      ['estudios', 'Escuela / universidad / trabajo'],
      ['futuro', 'Dinero / futuro'],
      ['dios', 'Mi relación con Dios'],
      ['ansiedad', 'Pensamientos que no puedo apagar / ansiedad'],
      ['soledad', 'Sentirme solo(a)'],
      ['autoestima', 'Cómo me veo / autoestima'],
      ['secreto', 'Algo que no quiero contar'],
      ['nose', 'Realmente no sé'],
    ],
  },
  Q04: {
    dim: 'Emociones', corto: 'Qué hace cuando está mal', tipo: 'multiple', max: 3,
    opciones: [
      ['hablo', 'Hablo con alguien'],
      ['encierro', 'Me encierro / me aíslo'],
      ['oro', 'Oro'],
      ['musica', 'Escucho música'],
      ['pantallas', 'Me distraigo con redes / videojuegos / series'],
      ['duermo', 'Duermo'],
      ['finjo', 'Finjo que todo está bien'],
      ['enojo', 'Me enojo / exploto'],
      ['escape', 'Busco otra cosa que me haga sentir mejor'],
      ['nose', 'No sé'],
    ],
  },
  Q05: {
    dim: 'Relaciones', corto: 'Cuando alguien le falla', tipo: 'unica',
    opciones: [
      ['confronta', 'Lo confronta y habla'],
      ['aleja', 'Se aleja en silencio'],
      ['perdona', 'Perdona, aunque le duele'],
      ['desconfia', 'Le cuesta volver a confiar en cualquiera'],
      ['culpa', 'Piensa que fue su culpa'],
      ['finge', 'Hace como que no pasó nada'],
    ],
  },
  Q06: {
    dim: 'Fe', corto: 'Fe bajo presión', tipo: 'unica',
    opciones: [
      ['confia', '"Tengo que confiar."'],
      ['ysi', '"¿Y si Dios no hace nada?"'],
      ['miedo', '"Quiero confiar, pero tengo miedo."'],
      ['nose', '"No sé qué pensar de Dios."'],
      ['nopiensa', 'Honestamente, no pensaría en Dios.'],
    ],
  },
  Q07: {
    dim: 'Fe', corto: 'Relación con Dios hoy', tipo: 'unica',
    opciones: [
      ['cerca', 'Estoy cerca de Dios'],
      ['intentando', 'Estoy intentando acercarme'],
      ['confundido', 'Estoy confundido(a) con algunas cosas'],
      ['alejado', 'Me he alejado bastante'],
      ['seco', 'Creo en Dios, pero últimamente no siento mucho'],
      ['dudas', 'Tengo dudas que nunca he hablado con nadie'],
    ],
  },
  Q08: {
    dim: 'Fe', corto: 'Pregunta que le haría a Dios', tipo: 'abierta',
  },
  Q09: {
    dim: 'Comunicación', corto: 'Lo que más le cuesta decir', tipo: 'multiple', max: 3,
    opciones: [
      ['noestoybien', '"No estoy bien."'],
      ['miedo', '"Tengo miedo."'],
      ['ayuda', '"Necesito ayuda."'],
      ['enojo', '"Estoy enojado(a)."'],
      ['dudas', '"Tengo dudas sobre Dios."'],
      ['solo', '"Me siento solo(a)."'],
      ['verguenza', '"Hice algo que me avergüenza."'],
      ['nose', '"No sé qué me pasa."'],
    ],
  },
  Q10: {
    dim: 'Identidad', corto: 'La máscara que usa', tipo: 'unica',
    opciones: [
      ['bien', '"Estoy bien."'],
      ['risa', '"Todo me da risa."'],
      ['solo', '"Yo puedo solo(a)."'],
      ['espiritual', '"Soy muy espiritual."'],
      ['callado', '"Mejor no digo nada."'],
      ['nomeimporta', '"No me importa."'],
      ['perfecto', '"Todo está perfecto."'],
      ['ninguna', 'No uso máscara, soy igual en todos lados'],
    ],
  },
  Q11: {
    dim: 'Heridas', corto: 'Lo que le preocupa y casi nunca dice', tipo: 'abierta',
  },
  Q12: {
    dim: 'Identidad', corto: 'Cuando fracasa', tipo: 'unica',
    opciones: [
      ['levanta', 'Se levanta e intenta de nuevo'],
      ['insuficiente', 'Piensa que no es suficiente'],
      ['compara', 'Se compara con otros'],
      ['culpa', 'Se culpa durante mucho tiempo'],
      ['aprobacion', 'Necesita que alguien le diga que está bien'],
      ['meda', 'Le da igual / se desconecta'],
    ],
  },
  Q13: {
    dim: 'Iglesia', corto: 'Lucha de la que quisiera hablar', tipo: 'secreto',
    opciones: [
      ['si', 'Sí'],
      ['no', 'No'],
      ['talvez', 'No estoy seguro(a)'],
    ],
  },
  Q14: {
    dim: 'Heridas', corto: 'La batalla que enfrentaría primero', tipo: 'unica',
    opciones: [
      ['futuro', 'Miedo al futuro'],
      ['soledad', 'Soledad'],
      ['ansiedad', 'Ansiedad / preocupación'],
      ['relaciones', 'Relaciones / pareja'],
      ['familia', 'Familia'],
      ['identidad', 'Identidad / autoestima'],
      ['fe', 'Fe y dudas'],
      ['sexualidad', 'Pornografía / sexualidad'],
      ['estudios', 'Presión académica o laboral'],
      ['insuficiente', 'Sentirme insuficiente'],
      ['vicios', 'Vicios / adicciones'],
      ['otro', 'Otra cosa'],
    ],
  },
  Q15: {
    dim: 'Iglesia', corto: 'Lo que necesita de la iglesia', tipo: 'multiple', max: 3,
    opciones: [
      ['escucha', 'Que alguien me escuche'],
      ['hablar', 'Tener con quién hablar a solas'],
      ['estudios', 'Estudios bíblicos'],
      ['consejeria', 'Consejería'],
      ['amistades', 'Amistades reales'],
      ['actividades', 'Actividades / convivencias'],
      ['mentoreo', 'Un mentor que me acompañe'],
      ['preguntas', 'Poder hacer preguntas sin ser juzgado(a)'],
      ['nose', 'No sé'],
    ],
  },
  Q16: {
    dim: 'Fe', corto: 'Lo que le pediría a Dios', tipo: 'abierta',
  },
  Q17: {
    dim: 'Iglesia', corto: 'Lo que la iglesia debería entender', tipo: 'abierta',
  },
};

// Orden en que se recorren las preguntas en todas las historias.
const ORDEN = ['Q00', 'Q02', 'Q01', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08',
  'Q09', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16'];
