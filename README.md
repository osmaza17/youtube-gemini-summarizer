# YouTube Gemini Summarizer

Extensión de Chrome que añade un botón **"Resumen"** en cualquier vídeo de YouTube. Al hacer clic, abre Gemini automáticamente con un prompt listo para generar un resumen detallado y estructurado del vídeo, sin necesidad de verlo.

---

## Características

- **Botón "Resumen" en el reproductor** — aparece junto a los botones de like/dislike de cualquier vídeo.
- **Botón hover en miniaturas** — al pasar el ratón sobre cualquier miniatura de YouTube aparece un pequeño icono de Gemini en la esquina superior izquierda para resumir ese vídeo sin necesidad de abrirlo.
- **Prompt estructurado en español** — el texto enviado a Gemini pide un resumen por secciones cronológicas, sin bullet points ni timestamps, con el nivel de detalle del vídeo original.
- **Sin API key** — utiliza directamente la interfaz web de Gemini (gemini.google.com), por lo que no requiere ninguna clave de API ni cuenta de pago.
- **Soporte para navegación SPA** — funciona con la navegación dinámica de YouTube sin necesidad de recargar la página.

---

## Cómo funciona

1. En YouTube, el script `content_youtube.js` inyecta el botón "Resumen" debajo del vídeo y botones flotantes sobre las miniaturas.
2. Al hacer clic, el `background.js` abre una nueva pestaña de Gemini con una clave única almacenada en `chrome.storage.local`.
3. El script `content_gemini.js` lee esa clave, recupera el prompt y lo escribe automáticamente en el editor de Gemini, enviándolo sin intervención del usuario.

```
YouTube (content_youtube.js)
    │  clic en "Resumen"
    ▼
background.js  ──►  chrome.storage.local  ──►  abre gemini.google.com/#gemini_KEY
                                                        │
                                              content_gemini.js
                                                        │
                                              escribe prompt + envía
```

---

## Instalación

La extensión **no está publicada en la Chrome Web Store**, por lo que hay que instalarla en modo desarrollador. Sigue estos pasos:

> ⚠️ **Importante — guarda la carpeta en una ubicación permanente**
>
> Chrome carga la extensión desde la carpeta que seleccionas en el momento de instalarla. Si esa carpeta se mueve, se renombra o se elimina (por ejemplo, si la dejaste en Descargas y Windows la borró), Chrome perderá la extensión la próxima vez que se reinicie y tendrás que volver a instalarla. Elige un directorio fijo donde la carpeta vaya a quedarse siempre (por ejemplo `C:\Users\TuUsuario\AppData\Roaming\chrome-extensions-local\youtube-gemini-summarizer`) y no la muevas después de instalarla.

### Paso 1 — Descarga los archivos

Clona el repositorio o descárgalo como ZIP:

```bash
git clone https://github.com/osmaza17/youtube-gemini-summarizer.git
```

O haz clic en **Code → Download ZIP** en la página del repositorio y descomprímelo en una carpeta de tu elección.

### Paso 2 — Abre la página de extensiones de Chrome

1. Abre Google Chrome.
2. En la barra de direcciones escribe:

   ```
   chrome://extensions
   ```

3. Pulsa **Enter**.

### Paso 3 — Activa el modo desarrollador

En la esquina superior derecha de la página de extensiones, activa el interruptor **"Modo de desarrollador"** (Developer mode).

![Modo desarrollador](https://i.imgur.com/placeholder.png)

### Paso 4 — Carga la extensión

1. Haz clic en el botón **"Cargar descomprimida"** (Load unpacked) que aparece en la esquina superior izquierda.
2. Selecciona la carpeta que contiene los archivos de la extensión (la que tiene el `manifest.json`).
3. Haz clic en **"Seleccionar carpeta"**.

### Paso 5 — Verifica la instalación

La extensión **"Resumir con Gemini"** aparecerá en la lista con su icono. Asegúrate de que está activada (interruptor en azul).

### Paso 6 — Prueba la extensión

1. Abre cualquier vídeo en [youtube.com](https://www.youtube.com).
2. Espera a que cargue la página del vídeo.
3. Junto a los botones de like/dislike verás el botón **"Resumen"** con el icono de Gemini.
4. Haz clic — se abrirá una nueva pestaña de Gemini y el prompt se enviará automáticamente.

> **Nota:** Debes estar conectado a tu cuenta de Google en gemini.google.com para que el prompt se envíe correctamente.

---

## Requisitos

| Requisito | Detalle |
|-----------|---------|
| Navegador | Google Chrome (o cualquier navegador basado en Chromium: Edge, Brave, Arc…) |
| Cuenta Google | Necesaria para usar Gemini |
| API key | No requerida |

---

## Estructura del proyecto

```
youtube-gemini-summarizer/
├── manifest.json          # Configuración de la extensión (Manifest V3)
├── background.js          # Service worker: gestiona mensajes y abre pestañas
├── content_youtube.js     # Script inyectado en YouTube: botones e interacción
├── content_gemini.js      # Script inyectado en Gemini: escribe y envía el prompt
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Solución de problemas

**El botón "Resumen" no aparece**
- Espera unos segundos después de que cargue el vídeo; la extensión hace polling durante 30 segundos.
- Recarga la página con `F5`.
- Asegúrate de que la extensión está activada en `chrome://extensions`.

**Gemini no recibe el texto**
- Verifica que estás conectado a tu cuenta de Google en gemini.google.com.
- Si Gemini muestra un captcha o pantalla de bienvenida, complétala manualmente y vuelve a hacer clic en "Resumen".

**El prompt se envía en inglés o con formato incorrecto**
- Esto puede deberse a que Gemini cambió su interfaz. Abre un issue en el repositorio con una captura de pantalla.

---

## Licencia

MIT — úsalo, modifícalo y distribúyelo libremente.
