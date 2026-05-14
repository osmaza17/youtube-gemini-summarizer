// content_youtube.js — v20

const BUTTON_ID = 'gemini-summarize-btn';
const HOVER_BTN_CLASS = 'gemini-hover-btn';

const PROMPT = `Analiza el siguiente vídeo de YouTube y escribe un resumen estructurado en español.
El resumen debe organizarse en secciones y subsecciones que sigan el orden cronológico del vídeo.
 Sin bullet points. Sin timestamps. Secciones separadas en párrafos para facilitar la lectura.
El objetivo es que quien lea el resumen entienda con precisión qué se dice en el video, con el mismo nivel de detalle, sin necesidad de verlo.
El vídeo que debes analizar es el siguiente:
(detalles del video)`;

const GEMINI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 28 28" style="flex-shrink:0;display:block">
  <path d="M14 2C14 2 15.5 10 20 14C15.5 18 14 26 14 26C14 26 12.5 18 8 14C12.5 10 14 2 14 2Z" fill="currentColor"/>
  <path d="M2 14C2 14 10 12.5 14 8C18 12.5 26 14 26 14C26 14 18 15.5 14 20C10 15.5 2 14 2 14Z" fill="currentColor"/>
</svg>`;

function buildPromptText({ url, title, channel }) {
  const videoInfo = [
    title   ? `Título: ${title}`  : null,
    channel ? `Canal: ${channel}` : null,
    `URL: ${url}`,
  ].filter(Boolean).join('\n');
  return PROMPT.replace('(detalles del video)', videoInfo);
}

function sendToGemini(info, btn, labelEl) {
  btn.disabled = true;
  btn.style.opacity = '0.5';
  if (labelEl) labelEl.textContent = '…';

  chrome.runtime.sendMessage(
    { action: 'openGeminiWithText', text: buildPromptText(info) },
    () => {
      if (labelEl) { labelEl.textContent = '✓ Listo'; }
      else { btn.innerHTML = `<span style="font-size:10px;color:#fff;line-height:1">✓</span>`; }
      setTimeout(() => {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (labelEl) labelEl.textContent = 'Resumen';
        else btn.innerHTML = GEMINI_SVG;
      }, 2500);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BOTÓN PRINCIPAL — debajo del vídeo actual
// ══════════════════════════════════════════════════════════════════════════════
const CONTAINER_SELECTORS = [
  '#top-level-buttons-computed',
  'ytd-watch-metadata #top-level-buttons-computed',
  '#actions #top-level-buttons-computed',
  '#actions-inner #top-level-buttons-computed',
  'ytd-menu-renderer #top-level-buttons-computed',
  '#actions-inner', '#actions',
  'ytd-watch-metadata #actions',
  '#above-the-fold #actions',
];

function getMainVideoInfo() {
  const url = window.location.href;
  let title = null, channel = null;
  for (const sel of [
    'ytd-watch-metadata h1.ytd-watch-metadata yt-formatted-string',
    'h1.ytd-watch-metadata', '#title h1', '#title yt-formatted-string',
    'h1 yt-formatted-string.ytd-watch-metadata',
  ]) {
    const el = document.querySelector(sel);
    if (el?.textContent.trim()) { title = el.textContent.trim(); break; }
  }
  for (const sel of [
    'ytd-channel-name yt-formatted-string#text a',
    'ytd-channel-name yt-formatted-string#text',
    '#channel-name yt-formatted-string a',
    '#channel-name a', '#owner #channel-name a',
  ]) {
    const el = document.querySelector(sel);
    if (el?.textContent.trim()) { channel = el.textContent.trim(); break; }
  }
  return { url, title, channel };
}

function createMainButton() {
  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.title = 'Resumir este video con Gemini';
  btn.innerHTML = `${GEMINI_SVG}<span>Resumen</span>`;
  btn.style.cssText = `
    display: inline-flex !important; align-items: center !important;
    gap: 6px !important; padding: 0 16px !important; height: 36px !important;
    background: var(--yt-spec-badge-chip-background, rgba(255,255,255,0.1)) !important;
    color: var(--yt-spec-text-primary, #fff) !important;
    border: none !important; border-radius: 18px !important;
    cursor: pointer !important; font-size: 14px !important;
    font-weight: 500 !important; font-family: "Roboto","Arial",sans-serif !important;
    line-height: 1 !important; margin-left: 8px !important;
    white-space: nowrap !important; outline: none !important;
    box-sizing: border-box !important; flex-shrink: 0 !important;
  `;
  btn.addEventListener('mouseenter', () => btn.style.setProperty('background','var(--yt-spec-10-percent-layer,rgba(255,255,255,0.18))','important'));
  btn.addEventListener('mouseleave', () => btn.style.setProperty('background','var(--yt-spec-badge-chip-background,rgba(255,255,255,0.1))','important'));
  btn.addEventListener('click', () => sendToGemini(getMainVideoInfo(), btn, btn.querySelector('span')));
  return btn;
}

function injectMainButton() {
  if (!window.location.pathname.startsWith('/watch')) return false;
  if (document.getElementById(BUTTON_ID)) return true;
  let container = null;
  for (const sel of CONTAINER_SELECTORS) {
    const el = document.querySelector(sel);
    if (el?.offsetParent !== null) { container = el; break; }
  }
  if (!container) {
    const likeBtn = document.querySelector('segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer');
    if (likeBtn) container = likeBtn.parentElement;
  }
  if (!container) return false;
  container.appendChild(createMainButton());
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// BOTÓN HOVER — nuevo layout: YT-LOCKUP-VIEW-MODEL
// ══════════════════════════════════════════════════════════════════════════════
function getThumbInfoFromLockup(lockup) {
  const linkEl = lockup.querySelector('a[href*="/watch"]');
  const url = linkEl ? 'https://www.youtube.com' + linkEl.getAttribute('href').split('&')[0] : null;
  const titleEl = lockup.querySelector('h3, yt-lockup-metadata-view-model h3, [class*="title"]');
  const title = titleEl?.textContent.trim() || null;
  const channelEl = lockup.querySelector('yt-content-metadata-view-model span, yt-decorated-avatar-view-model + * span, a[href*="/@"]');
  const channel = channelEl?.textContent.trim() || null;
  return { url, title, channel };
}

function createHoverButton(lockup) {
  const btn = document.createElement('button');
  btn.className = HOVER_BTN_CLASS;
  btn.title = 'Resumir con Gemini';
  btn.innerHTML = GEMINI_SVG;
  btn.style.cssText = `
    position: absolute !important;
    top: 4px !important;
    left: 4px !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
    background: rgba(0,0,0,0.8) !important;
    color: #fff !important;
    border: none !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 9999 !important;
    padding: 0 !important;
    opacity: 0;
    transition: opacity 0.15s ease;
    outline: none !important;
    pointer-events: auto !important;
  `;
  btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(0,0,0,1)'; btn.style.opacity = '1'; });
  btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(0,0,0,0.8)');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const info = getThumbInfoFromLockup(lockup);
    if (!info.url) return;
    sendToGemini(info, btn, null);
  });
  return btn;
}

function attachHoverButtonToLockup(lockup) {
  if (lockup.dataset.geminiAttached) return;
  lockup.dataset.geminiAttached = '1';
  const thumb = lockup.querySelector('yt-thumbnail-view-model, a[href*="/watch"]');
  if (!thumb) return;
  thumb.style.position = 'relative';
  thumb.style.overflow = 'hidden';
  const btn = createHoverButton(lockup);
  thumb.appendChild(btn);
  lockup.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
  lockup.addEventListener('mouseleave', () => { btn.style.opacity = '0'; });
}

function injectHoverButtons() {
  document.querySelectorAll('yt-lockup-view-model').forEach(attachHoverButtonToLockup);
  document.querySelectorAll('ytd-compact-video-renderer').forEach(el => {
    if (el.dataset.geminiAttached) return;
    el.dataset.geminiAttached = '1';
    const thumb = el.querySelector('a#thumbnail');
    if (!thumb) return;
    thumb.style.position = 'relative';
    thumb.style.overflow = 'hidden';
    const btn = createHoverButton(el);
    thumb.appendChild(btn);
    el.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { btn.style.opacity = '0'; });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// POLLING Y NAVEGACIÓN SPA
// ══════════════════════════════════════════════════════════════════════════════
let pollInterval = null;
let pollCount = 0;

function startPolling() {
  pollCount = 0;
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => {
    pollCount++;
    injectMainButton();
    injectHoverButtons();
    if (pollCount >= 60) { clearInterval(pollInterval); pollInterval = null; }
  }, 500);
}

window.addEventListener('yt-navigate-start', () => {
  const old = document.getElementById(BUTTON_ID);
  if (old) old.remove();
});
window.addEventListener('yt-navigate-finish', () => setTimeout(startPolling, 300));

const sidebarObserver = new MutationObserver(injectHoverButtons);
function attachSidebarObserver() {
  const sidebar = document.querySelector('#secondary, ytd-watch-next-secondary-results-renderer');
  if (sidebar) sidebarObserver.observe(sidebar, { childList: true, subtree: true });
}

if (document.readyState === 'complete') { startPolling(); setTimeout(attachSidebarObserver, 2000); }
else { window.addEventListener('load', () => { startPolling(); setTimeout(attachSidebarObserver, 2000); }); }
