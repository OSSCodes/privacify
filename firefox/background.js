chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pasteWithPrivacify",
    title: "Paste with Privacify",
    contexts: ["editable"],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pasteWithPrivacify') {
    chrome.tabs.sendMessage(tab.id, { action: 'pasteWithPrivacify' });
  }
});