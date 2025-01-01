chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});


chrome.runtime.onInstalled.addListener(() => {
  // Create the main menu "Privacify"
  chrome.contextMenus.create({
    id: "privacifyMenu", 
    title: "Privacify", 
    contexts: ["editable"], 
    type: "normal" 
  });

  // Create the "Paste with Privacify" submenu under the "Privacify" menu
  chrome.contextMenus.create({
    id: "pasteWithPrivacify",
    title: "Paste with Privacify",
    parentId: "privacifyMenu",  // This makes it a child of the "Privacify" menu
    contexts: ["editable"]
  });

  // Create the "Paste without Privacify" submenu under the "Privacify" menu
  chrome.contextMenus.create({
    id: "pasteWithoutPrivacify",
    title: "Paste without Privacify",
    parentId: "privacifyMenu",  // This makes it a child of the "Privacify" menu
    contexts: ["editable"]
  });
});


// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pasteWithPrivacify') {
    chrome.tabs.sendMessage(tab.id, { action: 'pasteWithPrivacify' });
  } else if (info.menuItemId === 'pasteWithoutPrivacify') {
    chrome.tabs.sendMessage(tab.id, { action: 'pasteWithoutPrivacify' });
  }
});
