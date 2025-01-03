// Listen for the action from background.js (when user clicks the context menu)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pasteWithPrivacify') {
    processPaste();
  } 
});



document.addEventListener('paste', pasteEventListenerFunction);



async function pasteEventListenerFunction(event) {

  chrome.storage.local.get(['pasteWarning', 'toastPosition', 'patterns'],async function(data){
    const toastPosition = data.toastPosition || 'bottom-right';
    const pasteWarning = data.pasteWarning !== undefined ? data.pasteWarning : true;
    const patterns = data.patterns || [];
    const content = await navigator.clipboard.readText();
    if(pasteWarning && await isDomainWhitelisted()) {
        let hasMatches = false; // Flag to indicate whether any match is found

        for (const pattern of patterns) {
          try {
            const regex = new RegExp(pattern.regex, 'g');
            const matches = content.match(regex);
            if (matches && matches.length>0) {
              hasMatches = true; // Set flag to true if matches are found
              break; // Exit the loop as we found a match
            }
          } catch (error) {
            console.error(`Invalid regex: ${pattern.regex} - Error: ${error.message}`);
          }
        }
  
        if(hasMatches){
          showToastMessage(toastPosition, 'SENSITIVE DATA PRESENT. PROCEED WITH CAUTION! USE PASTE WITH PRIVACIFY TO AVOID ACCIDENTAL DATA EXPOSURE!');
        }
      
    }
  });
}


// Function to check if the domain is whitelisted
async function isDomainWhitelisted() {
  const domain = window.location.hostname;
  return new Promise((resolve) => {
    chrome.storage.local.get(['enabledDomains'], function (data) {
      const enabledDomains = data.enabledDomains || [];
      resolve(enabledDomains.includes(domain));
    });
  });
}



// Function to process the paste action
async function processPaste() {
  // Check for clipboard content programmatically (for context menu)
  try {
    const clipboardText = await navigator.clipboard.readText();
    handlePasteEvent('action', clipboardText);
  } catch (err) {
    console.error('Failed to read clipboard content:', err);
  }
}



// Function to process the paste action
function handlePasteEvent(type, clipboardText) {
  chrome.storage.local.get(['enabledDomains', 'patterns', 'showToast', 'toastPosition','pasteWarning'], function (data) {
    const enabledDomains = data.enabledDomains || [];
    const patterns = data.patterns || [];
    const showToast = data.showToast !== undefined ? data.showToast : true;
    const toastPosition = data.toastPosition || 'bottom-right';
    const currentDomain = window.location.hostname;
    const pasteWarning = data.pasteWarning !== undefined ? data.pasteWarning : true;

    // Only proceed if domain is whitelisted
    if (!enabledDomains.includes(currentDomain) && type === 'action') {
      showToastMessage(toastPosition, 'Domain not whitelisted.');
      return;
    }

    let content = clipboardText;

    // Replace sensitive data using regex patterns and masked values
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex, 'g');
      content = content.replace(regex, pattern.maskValue);
    });

    const activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA') {
      insertTextAtCursor(activeElement, content);
    } else if (activeElement.isContentEditable) {
      insertTextAtCursorContentEditable(activeElement, content);
    }

    // Show toast message if enabled
    if (showToast) {
      showToastMessage(toastPosition, 'Sensitive data has been masked and pasted successfully!');
    }
  })
}



// Function to insert text at cursor position in a textarea
function insertTextAtCursor(textarea, text) {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  // Insert the text at the cursor position
  textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos);

  // Move the cursor to the end of the inserted text
  textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
  textarea.focus();
}

// Function to insert text at cursor position in a contenteditable div
function insertTextAtCursorContentEditable(contentEditableElement, text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // Create a new Text node with the text content
  const textNode = document.createTextNode(text);

  // Insert the text node at the current cursor position
  range.deleteContents();
  range.insertNode(textNode);

  // Move the cursor to the end of the inserted text node
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);

  selection.removeAllRanges();
  selection.addRange(range);
}

// Function to show toast message
function showToastMessage(position, message) {
  const toast = document.createElement('div');
  toast.classList.add('privacify-toast');
  toast.innerText = message;

  // Position the toast based on user configuration
  switch (position) {
    case 'top-left':
      toast.style.top = '10px';
      toast.style.left = '10px';
      break;
    case 'top-right':
      toast.style.top = '10px';
      toast.style.right = '10px';
      break;
    case 'bottom-left':
      toast.style.bottom = '10px';
      toast.style.left = '10px';
      break;
    case 'bottom-right':
      toast.style.bottom = '10px';
      toast.style.right = '10px';
      break;
    case 'center':
      toast.style.top = '50%';
      toast.style.left = '50%';
      toast.style.transform = 'translate(-50%, -50%)';
      break;
  }

  // Apply some basic styles for the toast
  toast.style.position = 'fixed';
  toast.style.padding = '10px';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  toast.style.color = '#fff';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '9999';

  document.body.appendChild(toast);

  // Automatically hide the toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
