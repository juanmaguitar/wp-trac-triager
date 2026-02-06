// WP Trac Triager - Options Page Script

const defaultConfig = {
  highlightComments: true,
  showKeywordSidebar: true,
  showMaintainerInfo: true,
  targetWpVersion: '7.0'
};

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || defaultConfig;

    // Set toggle switches
    document.getElementById('highlightComments').checked = config.highlightComments;
    document.getElementById('showKeywordSidebar').checked = config.showKeywordSidebar;
    document.getElementById('showMaintainerInfo').checked = config.showMaintainerInfo;

    // Set target WordPress version
    document.getElementById('targetWpVersion').value = config.targetWpVersion || '7.0';
  });
}

// Save settings
function saveSettings() {
  const config = {
    highlightComments: document.getElementById('highlightComments').checked,
    showKeywordSidebar: document.getElementById('showKeywordSidebar').checked,
    showMaintainerInfo: document.getElementById('showMaintainerInfo').checked,
    targetWpVersion: document.getElementById('targetWpVersion').value
  };

  chrome.storage.sync.set({ config: config }, function() {
    showStatusMessage('Settings saved successfully!', 'success');
  });
}

// Reset to defaults
function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  chrome.storage.sync.set({ config: defaultConfig }, function() {
    loadSettings();
    showStatusMessage('Settings reset to defaults', 'success');
  });
}

// Show status message
function showStatusMessage(message, type = 'success') {
  const statusElement = document.getElementById('statusMessage');
  const statusText = document.getElementById('statusText');

  statusText.textContent = message;
  statusElement.className = `status-message show ${type}`;

  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();

  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
});
