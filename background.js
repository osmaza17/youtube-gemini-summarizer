// background.js — v8
// Cada solicitud usa una clave única para evitar colisiones entre pestañas

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'openGeminiWithSummary') {
    const { videoUrl, videoTitle, videoChannel, prompt } = message;
    const videoInfo = [
      videoTitle   ? `Título: ${videoTitle}`  : null,
      videoChannel ? `Canal: ${videoChannel}` : null,
      `URL: ${videoUrl}`,
    ].filter(Boolean).join('\n');
    const text = prompt.replace('(detalles del video)', videoInfo);
    openGeminiTab(text, sendResponse);
    return true;
  }

  if (message.action === 'openGeminiWithText') {
    openGeminiTab(message.text, sendResponse);
    return true;
  }

});

function openGeminiTab(text, sendResponse) {
  // Clave única por pestaña: nunca colisionará con otras simultáneas
  const key = 'gemini_' + Date.now() + '_' + Math.random().toString(36).slice(2);

  chrome.storage.local.set({ [key]: text }, () => {
    // Pasamos la clave en el hash de la URL para que content_gemini.js la lea
    chrome.tabs.create(
      { url: `https://gemini.google.com/app#${key}`, active: false },
      (tab) => sendResponse && sendResponse({ success: true, tabId: tab.id })
    );
  });
}
