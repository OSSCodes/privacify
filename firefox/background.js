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

// Action when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});


chrome.runtime.onInstalled.addListener(() => {
  // Detect platform and set the appropriate shortcut
  const platform = navigator.userAgent.toLowerCase();
  const shortcut = platform.includes('mac') ? '[Cmd+Shift+P]' : '[Alt+Shift+P]';
  // Create context menu item
  chrome.contextMenus.create({
    id: "pasteWithPrivacify",
    title: "Paste with Privacify " + shortcut,
    contexts: ["editable"],
  });
  // Set default values in storage
  chrome.storage.local.set({
    patterns: defaults.patterns,
    enabledDomains: defaults.enabledDomains,
    pasteWarning: true,
    showToast: true
  }, () => {
    console.log("Default loaded.");
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pasteWithPrivacify') {
    chrome.tabs.sendMessage(tab.id, { action: 'pasteWithPrivacify' });
  }
});


// Shortcut key handler (for Alt+Shift+P or Ctrl+Shift+P)
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