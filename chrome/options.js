document.addEventListener("DOMContentLoaded", () => {
  // Switch between tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Hide all sections and show the selected tab's section
      document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  

  // Load stored settings (patterns and domains) from chrome.storage
  function loadSettings() {
    chrome.storage.local.get(['patterns', 'enabledDomains', 'showToast', 'toastPosition','isForcePasteEnabled'], (data) => {
      const patterns = data.patterns || [];
      const enabledDomains = data.enabledDomains || [];
      const showToast = data.showToast !== undefined ? data.showToast : true;
      const isForcePasteEnabled = data.isForcePasteEnabled !== undefined ? data.isForcePasteEnabled : true;
      const toastPosition = data.toastPosition || 'bottom-right';

      // Apply settings to UI elements
      document.getElementById('showToast').checked = showToast;
      document.querySelector(`input[name="toastPosition"][value="${toastPosition}"]`).checked = true;
      document.getElementById('forcePaste').checked = isForcePasteEnabled;

      // Render patterns in table
      const patternList = document.getElementById('patternList');
      patternList.innerHTML = '';
      patterns.forEach((pattern, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${pattern.regex}</td>
          <td>${pattern.maskValue}</td>
          <td>
            <button class="editPattern" data-index="${index}">Edit</button>
            <button class="deletePattern" data-index="${index}">Delete</button>
          </td>
        `;
        patternList.appendChild(row);
      });

      // Render domains in table
      const domainList = document.getElementById('domainList');
      domainList.innerHTML = '';
      enabledDomains.forEach((domain, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${domain}</td>
          <td>
            <button class="editDomain" data-index="${index}">Edit</button>
            <button class="deleteDomain" data-index="${index}">Delete</button>
          </td>
        `;
        domainList.appendChild(row);
      });
    });
  }



  const radioButtons = document.querySelectorAll('input[name="toastPosition"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const toastPosition = e.target.value;
      chrome.storage.local.set({ toastPosition });
    });
  });




  document.getElementById('forcePaste').addEventListener('change', (e) => {
    console.log('value changed : ', e.target.checked);
    const isForcePasteEnabled = e.target.checked;
    chrome.storage.local.set({ isForcePasteEnabled });

    const showToastCheckbox = document.getElementById('showToast');
    if (isForcePasteEnabled) {
        showToastCheckbox.checked = true;
        showToastCheckbox.disabled = true; // Disable showToast when forcePaste is checked
        chrome.storage.local.set({ showToast: true });
    } else {
        showToastCheckbox.disabled = false; // Enable showToast when forcePaste is unchecked
    }
  });

  document.getElementById('showToast').addEventListener('change', (e) => {
      const showToast = e.target.checked;
      chrome.storage.local.set({ showToast });
  });



  // Add a new pattern
  document.getElementById('addPatternButton').addEventListener('click', () => {
    const regexPattern = document.getElementById('regexPattern').value;
    const maskedValue = document.getElementById('maskedValue').value;
    if (regexPattern && maskedValue) {
      chrome.storage.local.get('patterns', (data) => {
        const patterns = data.patterns || [];
        patterns.push({ regex: regexPattern, maskValue: maskedValue });
        chrome.storage.local.set({ patterns }, loadSettings);
        document.getElementById('regexPattern').value = "";
        document.getElementById('maskedValue').value = "";
      });
    }
  });

  // Clear pattern
  document.getElementById('clearPatternsButton').addEventListener('click', () => {
    document.getElementById('regexPattern').value = "";
    document.getElementById('maskedValue').value = "";
  });

  // Add a new domain
  document.getElementById('addDomainButton').addEventListener('click', () => {
    const domainName = document.getElementById('domainName').value;
    if (domainName) {
      chrome.storage.local.get('enabledDomains', (data) => {
        const enabledDomains = data.enabledDomains || [];
        enabledDomains.push(domainName);
        chrome.storage.local.set({ enabledDomains }, loadSettings);
        document.getElementById('domainName').value = "";
      });
    }
  });

  // Clear domain
  document.getElementById('clearDomainsButton').addEventListener('click', () => {
    document.getElementById('domainName').value = "";
  });

  // Edit and Delete Pattern
  document.getElementById('patternList').addEventListener('click', (e) => {
    if (e.target.classList.contains('editPattern')) {
      const index = e.target.dataset.index;
      chrome.storage.local.get('patterns', (data) => {
        const patterns = data.patterns || [];
        const pattern = patterns[index];
        document.getElementById('regexPattern').value = pattern.regex;
        document.getElementById('maskedValue').value = pattern.maskValue;
        deletePattern(index);
      });
    }
    if (e.target.classList.contains('deletePattern')) {
      const index = e.target.dataset.index;
      deletePattern(index);
    }
  });

  // Edit and Delete Domain
  document.getElementById('domainList').addEventListener('click', (e) => {
    if (e.target.classList.contains('editDomain')) {
      const index = e.target.dataset.index;
      chrome.storage.local.get('enabledDomains', (data) => {
        const enabledDomains = data.enabledDomains || [];
        const domain = enabledDomains[index];
        document.getElementById('domainName').value = domain;
        deleteDomain(index);
      });
    }
    if (e.target.classList.contains('deleteDomain')) {
      const index = e.target.dataset.index;
      deleteDomain(index);
    }
  });

  // Delete a pattern
  function deletePattern(index) {
    chrome.storage.local.get('patterns', (data) => {
      const patterns = data.patterns || [];
      patterns.splice(index, 1);
      chrome.storage.local.set({ patterns }, loadSettings);
    });
  }

  // Delete a domain
  function deleteDomain(index) {
    chrome.storage.local.get('enabledDomains', (data) => {
      const enabledDomains = data.enabledDomains || [];
      enabledDomains.splice(index, 1);
      chrome.storage.local.set({ enabledDomains }, loadSettings);
    });
  }

  // Initialize the page by loading settings
  loadSettings();
});
