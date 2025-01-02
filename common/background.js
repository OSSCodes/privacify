chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

// Default patterns to preload
const defaults = {
  patterns: [
    { "regex": "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "maskValue": "[email]" },
    { "regex": "[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+", "maskValue": "[token]" },
    { "regex": "[A-Za-z]:\\\\([A-Za-z0-9 ()]+\\\\)*[A-Za-z0-9]+", "maskValue": "[directory]" },
    { "regex": "\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+", "maskValue": "[directory]" }
  ],
  enabledDomains: [
    "chatgpt.com", "gemini.google.com"
  ]
};

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

  
  chrome.storage.local.set({ patterns: defaults.patterns, enabledDomains: defaults.enabledDomains }, () => {
    console.log("Default loaded.");
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