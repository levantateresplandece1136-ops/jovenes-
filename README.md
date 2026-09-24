# SIN FILTRO: elige tu misión

Una experiencia interactiva y **anónima** para conocer de verdad a los jóvenes del grupo:
sus dudas, luchas, miedos y lo que necesitan de la iglesia, sin que parezca una encuesta.

Cada joven elige una de **5 misiones** (tipo escape room / historia interactiva). Todas hacen
**las mismas 17 preguntas**, adaptadas a la historia, así que puedes comparar los resultados
del grupo sin importar qué misión eligió cada uno.

| # | Misión | Estilo | Medidor |
|---|--------|--------|---------|
| 1 | 🕵️ **Sherlock**: El caso de la habitación 23 | Misterio y pistas | Pistas 0 → 17 |
| 2 | 🌊 **Submarino**: 7 minutos para escapar | Presión y trabajo en equipo | Oxígeno 100% → 6% |
| 3 | 🔪 **El culpable**: La última noche | Confianza y secretos | Reloj 22:00 → 06:00 |
| 4 | 🚀 **Planeta X**: la misión imposible | Liderazgo, identidad, futuro | Energía 12% → 100% |
| 5 | 👑 **El Reino Perdido** | Lealtad, propósito, fe | Fragmentos de corona |

Los resultados llegan **a tu correo** (uno por cada misión completada, más un reporte semanal
con el "mapa del grupo") y también los puedes ver en el **Centro de Comando** (`panel.html`).

---

## Qué mide cada pregunta (sin que ellos lo sepan)

| Código | Dimensión | Lo que descubres | Cómo aparece en la historia (ej. Sherlock) |
|---|---|---|---|
| Q00 | Ánimo | Cómo está su "batería emocional" | El detective revisa su energía antes del caso |
| Q02 | Relaciones | Si se siente parte del grupo o aislado | Entras a una fiesta donde nadie te conoce |
| Q01 | Presión | Cómo reacciona cuando todo se sale de control | Se apagan las luces y hay pánico |
| Q03 | Heridas | Qué ocupa su cabeza (familia, futuro, soledad...) | Noche sin dormir en el hotel |
| Q04 | Emociones | Qué hace cuando está mal (aislarse, fingir, orar...) | Holmes tocaba el violín a las 3 a. m. |
| Q05 | Relaciones | Cómo maneja la traición y la confianza | Tu aliado te mintió |
| Q06 | Fe | Qué pasa con su fe cuando tiene miedo | Oscuridad en los túneles: "Dios va contigo" |
| Q07 | Fe | Su relación real con Dios hoy | Última banca de la iglesia, nadie te ve |
| Q08 | Fe | ✍️ La pregunta que le haría a Dios | Una libreta abierta en la banca |
| Q09 | Comunicación | Lo que más le cuesta decir ("no estoy bien", "necesito ayuda"...) | Una testigo con miedo de hablar |
| Q10 | Identidad | La máscara que usa con otros | Baile de máscaras |
| Q11 | Heridas | ✍️ "Algo que me preocupa y casi nunca digo..." | La caja fuerte que se abre con una verdad |
| Q12 | Identidad | Qué siente cuando fracasa | Acusaste al sospechoso equivocado |
| Q13 | Iglesia | 🔓 NIVEL SECRETO: si quiere hablar de una lucha (+ texto opcional) | Nivel secreto |
| Q14 | Heridas | La batalla que enfrentaría primero (incluye sexualidad, vicios, ansiedad...) | El jefe final |
| Q15 | Iglesia | Lo que necesita de la iglesia (escucha, mentoría, amistades...) | "¿Qué necesitas de nosotros?" |
| Q16 | Fe | ✍️ Lo que le pediría a Dios | Final de la historia |
| Q17 | Iglesia | ✍️ NIVEL EXTRA: "¿Qué necesitas que la iglesia entienda de ti?" | Después de "Misión completada" |

Todas las preguntas de texto (✍️) se pueden saltar.

---

## Instalación (unos 20 minutos, gratis)

### Paso 1: Crea la hoja donde se guardarán las respuestas
1. Entra a [sheets.new](https://sheets.new) con tu cuenta de Google y llámala `Sin Filtro - Respuestas`.
2. Menú **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de [`apps-script/Codigo.gs`](apps-script/Codigo.gs).
4. Arriba, en `AJUSTES`, **cambia `CLAVE_PANEL`** por una clave tuya (es la que usarás para abrir el panel).
   - `EMAIL`: déjalo vacío para recibir los correos en la misma cuenta de Google, o pon otro correo.
   - `CORREO_CADA_RESPUESTA`: `true` = un correo por cada misión completada; `false` = solo el reporte semanal y las alertas.
5. Guarda (💾).

### Paso 2: Autoriza y activa los correos
1. En la barra de arriba elige la función **`probarCorreo`** y presiona **Ejecutar**.
   Google te pedirá permisos (dice "app no verificada" porque la creaste tú: **Configuración avanzada → Ir a...**).
   Te debe llegar un correo de prueba.
2. Elige la función **`instalarReporteSemanal`** y presiona **Ejecutar**. Desde ahora recibirás el reporte cada lunes a las 8 a. m.
   (También puedes ejecutar `enviarReporteSemanal` cuando quieras para recibirlo al momento).

### Paso 3: Publica el script como aplicación web
1. **Implementar → Nueva implementación → ⚙️ → Aplicación web**.
2. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier persona**.
3. Presiona **Implementar** y copia la URL (termina en `/exec`).

> Si después cambias el código, usa **Implementar → Administrar implementaciones → ✏️ → Versión: nueva** para que la URL siga funcionando.

### Paso 4: Conecta el juego
Abre [`js/config.js`](js/config.js) y pega la URL:

```js
URL_APPS_SCRIPT: 'https://script.google.com/macros/s/XXXXXXXX/exec',
NOMBRE_GRUPO: 'Jóvenes de mi iglesia',
LINEA_AYUDA: 'Línea de ayuda de tu país: 000 000 0000',
```

Te recomiendo **poner una línea de ayuda de tu país** en `LINEA_AYUDA` (salud mental o prevención del suicidio).
Aparece discretamente al final, y de forma destacada si el joven dijo que su batería estaba "casi vacía" o "apagada".

### Paso 5: Publica la página
Opción fácil con **GitHub Pages** (gratis):
1. En el repositorio: **Settings → Pages → Source: Deploy from a branch →** elige la rama con el código (por ejemplo `main`) y la carpeta **`/ (root)`**.
2. En un minuto tendrás una dirección como `https://tu-usuario.github.io/jovenes-/`.

> GitHub Pages gratis requiere que el repositorio sea público. Esto no expone respuestas: las respuestas
> están en tu hoja de Google, y el panel pide la clave que solo existe en tu Apps Script.
> Alternativa: arrastra la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop).

### Paso 6: Compártela
Genera un código QR con la dirección (por ejemplo en cualquier generador de QR) y proyéctalo en la reunión.

---

## Cómo presentarlo al grupo

- **No lo llames encuesta.** Preséntalo como un juego: *"Hoy tenemos 5 misiones. Elijan una. Nadie va a saber quién eligió qué."*
- **Dales espacio.** Que cada quien use su propio celular, separados, sin nadie mirando la pantalla. Pon música de fondo.
- **Cumple la promesa de anonimato.** Nunca intentes adivinar quién escribió qué, ni lo comentes. Si lo rompes una vez, no vuelven a ser honestos.
- **Da tiempo:** entre 10 y 15 minutos.
- Si hay menores de edad, es sano que tu pastor sepa que harás esta actividad.

## Qué hacer con los resultados

1. **Lee el mapa, no a las personas.** El objetivo es saber qué está viviendo el grupo para planear reuniones, no diagnosticar a alguien.
2. **Usa las preguntas a Dios (Q08)** para armar una noche de *"Preguntas sin filtro"*. Léelas en voz alta (sin detalles que identifiquen) y respóndelas con la Biblia.
3. **Si muchos se aíslan o fingen (Q04, Q09, Q10)**, crea grupos pequeños y un espacio de mentoría uno a uno.
4. **Si Q13 tiene muchos "Sí"**, anuncia horarios concretos en que tú u otros líderes están disponibles para hablar en privado.
5. **Repite la experiencia cada 3 o 4 meses** para ver cómo va cambiando el grupo.

## 🚨 Alertas

El script revisa los textos buscando palabras de riesgo (ideas de muerte, autolesión, abuso, violencia).
Si aparecen, te llega un correo inmediato marcado 🚨 y la fila queda marcada como `REVISAR` en la hoja.
Como es anónimo **no sabrás quién fue**, y está bien. Qué hacer:

- En la próxima reunión, di a todo el grupo que hay personas de confianza disponibles y comparte una línea de ayuda.
- Habla con tu pastor. Si hay indicios de abuso a un menor, sigue el protocolo de protección de tu iglesia y la ley local.
- Puede ser una falsa alarma (por ejemplo, alguien que escribió "quiero morir de risa"). Aun así, es mejor tomarlo en serio.

---

## Estructura

```
index.html            → el juego (lo que ven los jóvenes)
panel.html            → Centro de Comando (solo tú, con clave)
js/config.js          → tu configuración (URL, nombre del grupo, línea de ayuda)
js/preguntas.js       → banco maestro: 17 preguntas y sus opciones
js/historias.js       → las 5 misiones: escenas y opciones adaptadas a cada historia
js/juego.js           → motor del juego
css/estilos.css       → diseño
apps-script/Codigo.gs → backend: guarda en Google Sheets y envía los correos
```

### Probarlo sin configurar nada
Abre `index.html` en tu navegador. Sin URL en `config.js` funciona en **modo prueba** (no envía nada).
Abre `panel.html` y presiona **"Ver con datos de ejemplo"** para ver cómo se verá tu Centro de Comando.

### Editar o agregar historias
Cada escena de `js/historias.js` apunta a una pregunta (`q: 'Q05'`) y traduce sus opciones al lenguaje de la historia.
Para crear una sexta misión, copia una historia completa, cámbiale el nombre y reescribe las escenas **manteniendo los mismos `q`**.
Así los resultados seguirán siendo comparables.

## Privacidad

- No se piden ni se guardan nombres, correos, teléfonos, direcciones IP ni datos del dispositivo.
- Se guarda solo: fecha (sin hora), misión elegida, minutos que tardó y las respuestas.
- El `ID` de cada fila es aleatorio; solo sirve para unir la respuesta del "nivel extra" con su misión.
- En el reporte y el panel, los textos abiertos se muestran en orden aleatorio.
- Con grupos muy pequeños (menos de 5 personas) es más fácil adivinar quién escribió qué: tenlo en cuenta al compartir resultados.
