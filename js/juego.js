/*
 * MOTOR DEL JUEGO
 * No guarda nombres, correos ni datos del dispositivo. Solo la misión
 * elegida, las respuestas y cuántos minutos tardó.
 */
(function () {
  const app = document.getElementById('app');
  const CLAVE_PROGRESO = 'sinfiltro-progreso';
  const CLAVE_PENDIENTES = 'sinfiltro-pendientes';

  let estado = null; // { id, historia, i, respuestas, inicio, enviado }

  /* ---------- almacenamiento local (tolerante a fallos) ---------- */
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const borrar = (k) => { try { localStorage.removeItem(k); } catch (e) { /* nada */ } };

  const idAleatorio = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const vibrar = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* nada */ } };

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function mostrar(nodo, tema) {
    document.documentElement.style.setProperty('--acento', tema || '#f2b544');
    app.innerHTML = '';
    app.appendChild(nodo);
    window.scrollTo(0, 0);
  }

  function parrafos(lista, retrasoInicial = 0) {
    return lista.map((p, n) =>
      `<p class="aparece" style="animation-delay:${retrasoInicial + n * 0.35}s">${p}</p>`).join('');
  }

  /* ─────────────────────────── PORTADA ─────────────────────────── */
  function portada() {
    const guardado = leer(CLAVE_PROGRESO);
    const hayProgreso = guardado && HISTORIAS[guardado.historia] && !guardado.enviado;
    const nodo = el(`
      <section class="pantalla portada">
        <div class="glitch" data-texto="SIN FILTRO">SIN FILTRO</div>
        <p class="subtitulo aparece">5 misiones. Una elección. Tus decisiones cambian la historia.</p>
        <div class="tarjeta-anonima aparece" style="animation-delay:.4s">
          <p>🎧 Juega solo(a), a tu ritmo. Dura unos 10 minutos.</p>
          <p class="nota">🔒 No te pediremos tu nombre.</p>
        </div>
        <button class="boton principal aparece" style="animation-delay:.8s" data-accion="elegir">ELEGIR MISIÓN</button>
        ${hayProgreso ? '<button class="boton secundario aparece" style="animation-delay:1s" data-accion="continuar">Continuar mi misión</button>' : ''}
      </section>`);
    nodo.querySelector('[data-accion="elegir"]').onclick = () => { borrar(CLAVE_PROGRESO); seleccion(); };
    const c = nodo.querySelector('[data-accion="continuar"]');
    if (c) c.onclick = () => { estado = guardado; escena(); };
    mostrar(nodo);
  }

  /* ─────────────────────── SELECCIÓN DE MISIÓN ─────────────────────── */
  function seleccion() {
    const tarjetas = Object.entries(HISTORIAS).map(([id, h], n) => `
      <button class="mision aparece" style="--c:${h.color};animation-delay:${n * 0.12}s" data-id="${id}">
        <span class="mision-icono">${h.icono}</span>
        <span class="mision-texto">
          <span class="mision-etiqueta">${n + 1}. ${h.etiqueta}</span>
          <span class="mision-titulo">${h.titulo}</span>
          <span class="mision-resumen">${h.resumen}</span>
        </span>
      </button>`).join('');
    const nodo = el(`
      <section class="pantalla">
        <p class="kicker">SALA DE MISIONES</p>
        <h1 class="titulo">Elige tu misión</h1>
        <p class="subtitulo">Cada misión es diferente. Todas duran unos 10 minutos.</p>
        <div class="misiones">${tarjetas}</div>
      </section>`);
    nodo.querySelectorAll('.mision').forEach(b => {
      b.onclick = () => {
        vibrar();
        estado = { id: idAleatorio(), historia: b.dataset.id, i: -1, respuestas: {}, inicio: Date.now(), enviado: false };
        intro();
      };
    });
    mostrar(nodo);
  }

  /* ─────────────────────────── INTRO ─────────────────────────── */
  function intro() {
    const h = HISTORIAS[estado.historia];
    const nodo = el(`
      <section class="pantalla intro">
        <p class="kicker">${h.icono} ${h.etiqueta}</p>
        <h1 class="titulo">${h.titulo}</h1>
        <div class="narracion">${parrafos(h.intro, 0.2)}</div>
        <button class="boton principal aparece" style="animation-delay:${0.4 + h.intro.length * 0.35}s">COMENZAR</button>
      </section>`);
    nodo.querySelector('button').onclick = () => { estado.i = 0; guardar(CLAVE_PROGRESO, estado); escena(); };
    mostrar(nodo, h.color);
  }

  /* ─────────────────────────── ESCENAS ─────────────────────────── */
  function medidorHTML(h, paso, total) {
    const m = h.medidor;
    const valor = Math.round(m.de + (m.a - m.de) * (paso / total));
    const pct = Math.round((paso / total) * 100);
    return `
      <div class="medidor">
        <div class="medidor-fila"><span>${h.icono} ${h.etiqueta}</span><span>${m.nombre}: <strong>${m.formato(valor)}</strong></span></div>
        <div class="medidor-barra ${m.a < m.de ? 'baja' : ''}"><div style="width:${m.a < m.de ? 100 - pct : pct}%"></div></div>
      </div>`;
  }

  function escena() {
    const h = HISTORIAS[estado.historia];
    const total = h.escenas.length;
    if (estado.i >= total) return final();
    const e = h.escenas[estado.i];
    const p = PREGUNTAS[e.q];
    const retrasoPregunta = 0.2 + e.texto.length * 0.35;

    let control = '';
    if (p.tipo === 'unica' || p.tipo === 'multiple' || p.tipo === 'secreto') {
      const opciones = p.opciones.map(([cod, etiqueta]) => {
        const texto = (e.opciones && e.opciones[cod]) || etiqueta;
        return `<button class="opcion" data-cod="${cod}">${texto}</button>`;
      }).join('');
      control = `<div class="opciones ${p.tipo}">${opciones}</div>`;
      if (p.tipo === 'multiple') control += `<p class="nota">Puedes elegir hasta ${p.max}.</p>`;
      if (p.tipo === 'secreto') control += `
        <div class="seguimiento oculto">
          <label>${e.seguimiento}</label>
          <textarea maxlength="1200" rows="4" placeholder="Nadie sabrá que fuiste tú..."></textarea>
        </div>`;
    } else {
      control = `
        <textarea class="respuesta-abierta" maxlength="1200" rows="4" placeholder="${e.placeholder || 'Escribe aquí...'}"></textarea>
        <p class="nota">🔒 Anónimo. Escribe lo que quieras, o sáltalo.</p>`;
    }

    const nodo = el(`
      <section class="pantalla escena ${e.nivelSecreto ? 'secreto' : ''}">
        ${medidorHTML(h, estado.i, total)}
        ${e.nivelSecreto ? '<p class="kicker aparece">🔓 NIVEL SECRETO DESBLOQUEADO</p>' : ''}
        <div class="narracion">${parrafos(e.texto, 0.1)}</div>
        <div class="bloque-pregunta aparece" style="animation-delay:${retrasoPregunta}s">
          <h2 class="pregunta">${e.pregunta}</h2>
          ${control}
          <div class="acciones">
            ${p.tipo === 'abierta' ? '<button class="boton secundario" data-accion="saltar">Prefiero no escribir</button>' : ''}
            <button class="boton principal" data-accion="seguir" ${p.tipo === 'abierta' ? '' : 'disabled'}>${e.boton || 'CONTINUAR'}</button>
          </div>
        </div>
      </section>`);

    const seguir = nodo.querySelector('[data-accion="seguir"]');
    const seleccion = new Set();

    nodo.querySelectorAll('.opcion').forEach(b => {
      b.onclick = () => {
        vibrar();
        const cod = b.dataset.cod;
        if (p.tipo === 'multiple') {
          if (seleccion.has(cod)) seleccion.delete(cod);
          else if (seleccion.size < p.max) seleccion.add(cod);
          nodo.querySelectorAll('.opcion').forEach(o => o.classList.toggle('elegida', seleccion.has(o.dataset.cod)));
        } else {
          seleccion.clear(); seleccion.add(cod);
          nodo.querySelectorAll('.opcion').forEach(o => o.classList.toggle('elegida', o === b));
          if (p.tipo === 'secreto') {
            nodo.querySelector('.seguimiento').classList.toggle('oculto', cod === 'no');
          }
        }
        seguir.disabled = seleccion.size === 0;
      };
    });

    const etiquetaDe = cod => p.opciones.find(o => o[0] === cod)[1];

    const avanzar = (valor) => {
      estado.respuestas[e.q] = valor;
      estado.i += 1;
      guardar(CLAVE_PROGRESO, estado);
      escena();
    };

    seguir.onclick = () => {
      if (p.tipo === 'unica') return avanzar(etiquetaDe([...seleccion][0]));
      if (p.tipo === 'multiple') return avanzar([...seleccion].map(etiquetaDe));
      if (p.tipo === 'secreto') {
        const cod = [...seleccion][0];
        const texto = cod === 'no' ? '' : nodo.querySelector('.seguimiento textarea').value.trim();
        estado.respuestas.Q13_texto = texto;
        return avanzar(etiquetaDe(cod));
      }
      avanzar(nodo.querySelector('.respuesta-abierta').value.trim());
    };
    const saltar = nodo.querySelector('[data-accion="saltar"]');
    if (saltar) saltar.onclick = () => avanzar('');

    mostrar(nodo, h.color);
  }

  /* ─────────────────────────── ENVÍO ─────────────────────────── */
  function construirEnvio(extra) {
    const h = HISTORIAS[estado.historia];
    return {
      v: 1,
      id: estado.id,
      historia: h.etiqueta,
      minutos: Math.max(1, Math.round((Date.now() - estado.inicio) / 60000)),
      respuestas: estado.respuestas,
      extra: extra || null,
    };
  }

  function enviar(datos) {
    if (!CONFIG.URL_APPS_SCRIPT) {
      console.info('[Modo prueba] No hay URL de Apps Script. Esto se habría enviado:', datos);
      return Promise.resolve(true);
    }
    return fetch(CONFIG.URL_APPS_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos),
    }).then(() => true).catch(() => {
      const pendientes = leer(CLAVE_PENDIENTES) || [];
      pendientes.push(datos);
      guardar(CLAVE_PENDIENTES, pendientes);
      return false;
    });
  }

  function reintentarPendientes() {
    const pendientes = leer(CLAVE_PENDIENTES);
    if (!pendientes || !pendientes.length || !CONFIG.URL_APPS_SCRIPT) return;
    borrar(CLAVE_PENDIENTES);
    pendientes.forEach(enviar);
  }

  /* ─────────────────────────── FINAL ─────────────────────────── */
  function final() {
    const h = HISTORIAS[estado.historia];
    if (!estado.enviado) {
      enviar(construirEnvio());
      estado.enviado = true;
      guardar(CLAVE_PROGRESO, estado);
    }
    const bateria = estado.respuestas.Q00 || '';
    const cargaBaja = /Casi vacía|Apagada/.test(bateria);

    const nodo = el(`
      <section class="pantalla final">
        <p class="kicker aparece">${h.icono} ${h.cierre}</p>
        <h1 class="titulo aparece" style="animation-delay:.3s">Misión completada</h1>
        <div class="narracion">${parrafos([
          'Has seguido pistas. Has tomado decisiones. Has enfrentado situaciones difíciles.',
          'Pero quizá la misión más importante no era resolver el caso.',
          '<strong>Era descubrir algunas cosas sobre ti.</strong>',
          'Quizá nadie más sabe todo lo que estás cargando. Y quizá tú tampoco tienes todas las respuestas.',
          'Pero no tienes que cargarlo todo solo(a).',
          'La iglesia no debería ser el lugar donde fingimos estar bien. Debería ser un lugar donde aprendemos a caminar con Cristo, incluso cuando no estamos bien.',
          '<em>"Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso." — Mateo 11:28</em>',
        ], 0.6)}</div>
        ${(CONFIG.CONTACTO_APOYO || CONFIG.LINEA_AYUDA) ? `
          <div class="apoyo ${cargaBaja ? 'destacado' : ''} aparece" style="animation-delay:3.2s">
            ${cargaBaja ? '<p><strong>Gracias por ser honesto(a) sobre cómo te sientes. Eso es valiente.</strong></p>' : ''}
            ${CONFIG.CONTACTO_APOYO ? `<p>${CONFIG.CONTACTO_APOYO}</p>` : ''}
            ${CONFIG.LINEA_AYUDA ? `<p>Si en algún momento sientes que no puedes más, llama: <strong>${CONFIG.LINEA_AYUDA}</strong></p>` : ''}
          </div>` : ''}
        <div class="bonus aparece" style="animation-delay:3.6s">
          <p class="kicker">🔓 NIVEL EXTRA DISPONIBLE</p>
          <p>Hay una pregunta que probablemente nunca te hacen en la iglesia.</p>
          <button class="boton secundario" data-accion="bonus">Desbloquear</button>
          <div class="bonus-contenido oculto">
            <h2 class="pregunta">¿Qué necesitas que alguien de la iglesia entienda sobre ti?</h2>
            <textarea maxlength="1200" rows="4" placeholder="Escribe aquí..."></textarea>
            <button class="boton principal" data-accion="enviar-bonus">ENVIAR ANÓNIMAMENTE</button>
          </div>
        </div>
        <button class="boton fantasma aparece" style="animation-delay:4s" data-accion="terminar">TERMINAR EXPERIENCIA</button>
      </section>`);

    nodo.querySelector('[data-accion="bonus"]').onclick = (ev) => {
      ev.target.classList.add('oculto');
      nodo.querySelector('.bonus-contenido').classList.remove('oculto');
    };
    nodo.querySelector('[data-accion="enviar-bonus"]').onclick = () => {
      const texto = nodo.querySelector('.bonus textarea').value.trim();
      if (texto) enviar({ v: 1, id: estado.id, soloExtra: true, extra: texto });
      nodo.querySelector('.bonus').innerHTML = '<p class="kicker">✔ ENVIADO</p><p>Gracias por confiarnos esto.</p>';
    };
    nodo.querySelector('[data-accion="terminar"]').onclick = gracias;
    mostrar(nodo, h.color);
  }

  function gracias() {
    borrar(CLAVE_PROGRESO);
    const nodo = el(`
      <section class="pantalla portada">
        <div class="glitch" data-texto="GRACIAS">GRACIAS</div>
        <p class="subtitulo aparece">Gracias por dejarnos conocer un pequeño pedazo de tu historia.</p>
        <p class="nota aparece" style="animation-delay:.4s">Ya puedes cerrar esta página.</p>
      </section>`);
    mostrar(nodo);
  }

  reintentarPendientes();
  portada();
})();
