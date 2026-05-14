chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openGeminiWithText') {
    openGeminiTab(message.text, sendResponse);
    return true;
  }
});

function openGeminiTab(text, sendResponse) {
  const key = 'gemini_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  chrome.storage.local.set({ [key]: text }, () => {
    chrome.tabs.create(
      { url: `https://gemini.google.com/app#${key}`, active: false },
      (tab) => sendResponse && sendResponse({ success: true, tabId: tab.id })
    );
  });
}
