// content_gemini.js — v3
// Lee la clave única del hash de la URL y la usa para obtener el texto

const MAX_ATTEMPTS = 40;
const RETRY_INTERVAL = 500;

const EDITOR_SELECTORS = [
  'rich-textarea .ql-editor[contenteditable="true"]',
  'rich-textarea div[contenteditable="true"]',
  '.ql-editor[contenteditable="true"]',
  'div[contenteditable="true"][data-placeholder]',
  'div[contenteditable="true"]',
];

const SEND_BUTTON_SELECTORS = [
  'button[aria-label="Send message"]',
  'button[aria-label="Enviar mensaje"]',
  'button.send-button',
  'button[data-mat-icon-name="send"]',
];

function findEditor() {
  for (const sel of EDITOR_SELECTORS) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) return el;
  }
  return null;
}

function findSendButton() {
  for (const sel of SEND_BUTTON_SELECTORS) {
    try {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return el;
    } catch(e) {}
  }
  const allButtons = document.querySelectorAll('button');
  for (const btn of allButtons) {
    const label = (btn.getAttribute('aria-label') || '').toLowerCase();
    if ((label.includes('send') || label.includes('enviar')) && btn.offsetParent !== null) return btn;
  }
  return null;
}

function injectTextAndSend(editor, text) {
  editor.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  selection.removeAllRanges();
  selection.addRange(range);

  const inserted = document.execCommand('insertText', false, text);
  if (!inserted) {
    editor.textContent = text;
    editor.dispatchEvent(new InputEvent('input', {
      bubbles: true, cancelable: true, inputType: 'insertText', data: text,
    }));
  }
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

  setTimeout(() => {
    const sendBtn = findSendButton();
    if (sendBtn && !sendBtn.disabled) { sendBtn.click(); return; }

    editor.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13,
    }));
    editor.dispatchEvent(new KeyboardEvent('keyup', {
      bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13,
    }));

    setTimeout(() => {
      const sendBtn2 = findSendButton();
      if (sendBtn2) sendBtn2.click();
    }, 500);
  }, 800);
}

function waitAndInject(text) {
  let attempts = 0;
  const tryOnce = () => {
    attempts++;
    const editor = findEditor();
    if (editor) { setTimeout(() => injectTextAndSend(editor, text), 300); return; }
    if (attempts < MAX_ATTEMPTS) setTimeout(tryOnce, RETRY_INTERVAL);
  };
  setTimeout(tryOnce, 1000);
}

// Leer la clave única del hash de la URL (#gemini_TIMESTAMP_RANDOM)
const key = location.hash.slice(1); // quitar el '#'

if (key && key.startsWith('gemini_')) {
  chrome.storage.local.get([key], (result) => {
    const text = result[key];
    if (text) {
      chrome.storage.local.remove(key); // limpiar solo esta clave
      waitAndInject(text);
    }
  });
}
