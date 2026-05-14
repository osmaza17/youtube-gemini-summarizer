const DEFAULT_PROMPT = `Analiza el siguiente vídeo de YouTube y escribe un resumen estructurado en español.
El resumen debe organizarse en secciones y subsecciones que sigan el orden cronológico del vídeo.
 Sin bullet points. Sin timestamps. Secciones separadas en párrafos para facilitar la lectura.
El objetivo es que quien lea el resumen entienda con precisión qué se dice en el video, con el mismo nivel de detalle, sin necesidad de verlo.
El vídeo que debes analizar es el siguiente:
(detalles del video)`;

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('prompt');
  const saveBtn  = document.getElementById('save');
  const resetBtn = document.getElementById('reset');
  const status   = document.getElementById('status');

  chrome.storage.sync.get(['customPrompt'], (result) => {
    textarea.value = result.customPrompt !== undefined ? result.customPrompt : DEFAULT_PROMPT;
  });

  saveBtn.addEventListener('click', () => {
    if (!textarea.value.includes('(detalles del video)')) {
      status.style.color = '#e37400';
      status.textContent = '⚠ Missing (detalles del video)';
      setTimeout(() => { status.textContent = ''; }, 3000);
      return;
    }
    chrome.storage.sync.set({ customPrompt: textarea.value }, () => {
      status.style.color = '#188038';
      status.textContent = '✓ Saved';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });

  resetBtn.addEventListener('click', () => {
    textarea.value = DEFAULT_PROMPT;
    chrome.storage.sync.set({ customPrompt: DEFAULT_PROMPT }, () => {
      status.textContent = '✓ Reset';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});
