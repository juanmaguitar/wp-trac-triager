// WP Trac Triager - Options Page Script

const defaultSidebarSections = [
  { id: 'quick-info', icon: '📊', name: 'Quick Info', description: 'Ticket summary and metadata', enabled: true, order: 0, locked: true },
  { id: 'release-schedule', icon: '📅', name: 'WordPress Release', description: 'Release milestones and schedule', enabled: true, order: 1 },
  { id: 'recent-comments', icon: '💬', name: 'Recent Comments', description: 'Last 3 comments on ticket', enabled: true, order: 2 },
  { id: 'milestone-timeline', icon: '📊', name: 'Milestone History', description: 'Timeline of milestone changes', enabled: true, order: 3 },
  { id: 'keyword-history', icon: '🔄', name: 'Keyword Change History', description: 'Timeline of keyword additions/removals', enabled: true, order: 4 },
  { id: 'maintainers', icon: '🔧', name: 'Component Maintainers', description: 'Maintainer information', enabled: true, order: 5 },
  { id: 'keywords', icon: '🏷️', name: 'TRAC Keywords', description: 'Keyword explanations', enabled: true, order: 6 }
];

const defaultConfig = {
  highlightComments: true,
  targetWpVersion: '7.0',
  sidebarSections: defaultSidebarSections
};

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || defaultConfig;

    // Set toggle switches
    document.getElementById('highlightComments').checked = config.highlightComments !== false;

    // Set target WordPress version
    document.getElementById('targetWpVersion').value = config.targetWpVersion || '7.0';

    // Merge saved sections with defaults (adds any new sections)
    let sections = config.sidebarSections || defaultSidebarSections;

    if (config.sidebarSections) {
      // Create a map of existing sections by ID
      const existingSectionsMap = {};
      config.sidebarSections.forEach(section => {
        existingSectionsMap[section.id] = section;
      });

      // Merge: keep existing sections, add new ones from defaults
      sections = defaultSidebarSections.map(defaultSection => {
        if (existingSectionsMap[defaultSection.id]) {
          // Keep user's saved settings for this section
          return existingSectionsMap[defaultSection.id];
        } else {
          // Add new section from defaults
          return defaultSection;
        }
      });

      // Save merged sections back to storage
      config.sidebarSections = sections;
      chrome.storage.sync.set({ config: config });
    }

    renderSidebarSections(sections);
  });
}

// Render sidebar sections list
function renderSidebarSections(sections) {
  const container = document.getElementById('sidebarSectionsList');
  container.innerHTML = '';

  // Sort by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  sortedSections.forEach((section, index) => {
    const item = document.createElement('div');
    item.className = `sidebar-section-item ${section.locked ? 'locked' : ''}`;
    item.draggable = !section.locked;
    item.dataset.sectionId = section.id;
    item.dataset.order = index;

    item.innerHTML = `
      ${section.locked ? '<span class="lock-indicator">🔒</span>' : '<span class="drag-handle">≡</span>'}
      <span class="section-icon">${section.icon}</span>
      <div class="section-info">
        <div class="section-name">${section.name}</div>
        <div class="section-description">${section.description}</div>
      </div>
      <label class="toggle-switch section-toggle">
        <input type="checkbox" ${section.enabled ? 'checked' : ''} ${section.locked ? 'disabled' : ''} data-section-id="${section.id}">
        <span class="slider"></span>
      </label>
    `;

    // Add drag event listeners (only for non-locked items)
    if (!section.locked) {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragenter', handleDragEnter);
      item.addEventListener('dragleave', handleDragLeave);
    }

    // Add toggle event listener
    const toggle = item.querySelector('input[type="checkbox"]');
    if (toggle) {
      toggle.addEventListener('change', () => {
        section.enabled = toggle.checked;
        saveSidebarSections();
      });
    }

    container.appendChild(item);
  });
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.sidebar-section-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (!this.classList.contains('locked')) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this && !this.classList.contains('locked')) {
    // Get current order
    const allItems = Array.from(document.querySelectorAll('.sidebar-section-item:not(.locked)'));
    const draggedIndex = allItems.indexOf(draggedElement);
    const targetIndex = allItems.indexOf(this);

    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedElement, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedElement, this);
    }

    saveSidebarSections();
  }

  this.classList.remove('drag-over');
  return false;
}

// Save sidebar sections order and visibility
function saveSidebarSections() {
  const items = document.querySelectorAll('.sidebar-section-item');
  const sections = [];

  items.forEach((item, index) => {
    const sectionId = item.dataset.sectionId;
    const toggle = item.querySelector('input[type="checkbox"]');
    const enabled = toggle ? toggle.checked : true;
    const section = defaultSidebarSections.find(s => s.id === sectionId);

    if (section) {
      sections.push({
        ...section,
        enabled: section.locked ? true : enabled,
        order: index
      });
    }
  });

  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || defaultConfig;
    config.sidebarSections = sections;
    chrome.storage.sync.set({ config: config });
  });
}

// Reset sidebar layout to default
function resetSidebarLayout() {
  if (!confirm('Reset sidebar sections to default order and visibility?')) {
    return;
  }

  renderSidebarSections(defaultSidebarSections);
  saveSidebarSections();
  showStatusMessage('Sidebar layout reset to defaults', 'success');
}

// Save settings
function saveSettings() {
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || defaultConfig;

    config.highlightComments = document.getElementById('highlightComments').checked;
    config.targetWpVersion = document.getElementById('targetWpVersion').value;

    // Sidebar sections are saved automatically on change, so just keep existing
    if (!config.sidebarSections) {
      config.sidebarSections = defaultSidebarSections;
    }

    chrome.storage.sync.set({ config: config }, function() {
      showStatusMessage('Settings saved successfully!', 'success');
    });
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
  document.getElementById('resetSidebarLayout').addEventListener('click', resetSidebarLayout);
});
