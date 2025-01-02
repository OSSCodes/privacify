chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});


chrome.runtime.onInstalled.addListener(() => {
  // Detect platform and set the appropriate shortcut
  const platform = navigator.userAgent.toLowerCase();
  let shortcut = '[Alt+Shift+P]';  // Default for Windows/Linux

  if (platform.includes('mac')) {
    shortcut = '[Cmd+Shift+P]';  // macOS shortcut
  }
  chrome.contextMenus.create({
    id: "pasteWithPrivacify",
    title: "Paste with Privacify "+shortcut,
    contexts: ["editable"],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pasteWithPrivacify') {
    chrome.tabs.sendMessage(tab.id, { action: 'pasteWithPrivacify' });
  }
});

chrome.runtime.onInstalled.addListener(function() {
  const  pasteWarning = true;
    chrome.storage.local.set({ pasteWarning }, function() {
    });
});

chrome.runtime.onInstalled.addListener(function() {
  const  showToast = true;
    chrome.storage.local.set({ showToast }, function() {
    });
});

// Shortcut key handler (for Alt+Shift+P or Command+Shift+P)
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-pasteWithPrivacify") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'pasteWithPrivacify' });
      }
    });
  }
});