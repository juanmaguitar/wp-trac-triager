// WP Trac Triager - Main Content Script
// Enhances WordPress Trac tickets with triage helpers

(function() {
  'use strict';

  // Configuration
  let config = {
    highlightComments: true,
    showKeywordSidebar: true,
    showMaintainerInfo: true,
    customUsers: {
      coreCommitters: [],
      leadTesters: [],
      componentMaintainers: []
    }
  };

  // Load configuration from storage
  function loadConfig() {
    chrome.storage.sync.get(['config'], function(result) {
      if (result.config) {
        config = { ...config, ...result.config };
      }
      initialize();
    });
  }

  // Initialize the extension
  function initialize() {
    if (!isTicketPage()) {
      return;
    }

    console.log('[WP Trac Triager] Initializing...');
    console.log('[WP Trac Triager] Data check:', {
      KEYWORD_DATA: typeof KEYWORD_DATA !== 'undefined',
      COMPONENT_MAINTAINERS: typeof COMPONENT_MAINTAINERS !== 'undefined',
      CATEGORY_CONFIG: typeof CATEGORY_CONFIG !== 'undefined',
      MAINTAINER_PROFILES: typeof MAINTAINER_PROFILES !== 'undefined'
    });

    if (config.highlightComments) {
      highlightComments();
    }

    if (config.showKeywordSidebar) {
      createKeywordSidebar();
    }

    if (config.showMaintainerInfo) {
      createMaintainerInfoBox();
    }

    console.log('[WP Trac Triager] Initialized successfully');
  }

  // Check if we're on a ticket page
  function isTicketPage() {
    return window.location.pathname.match(/\/ticket\/\d+/);
  }

  // Extract ticket keywords
  function getTicketKeywords() {
    const keywordsElement = document.querySelector('#ticket td.keywords');
    if (!keywordsElement) return [];

    const keywordText = keywordsElement.textContent.trim();
    if (!keywordText) return [];

    return keywordText.split(/\s+/).filter(k => k.length > 0);
  }

  // Extract ticket component
  function getTicketComponent() {
    const componentElement = document.querySelector('#ticket td.component');
    return componentElement ? componentElement.textContent.trim() : null;
  }

  // Highlight comments from important users
  function highlightComments() {
    const comments = document.querySelectorAll('.change, #ticket');
    console.log('[WP Trac Triager] Found comments:', comments.length);

    let highlightedCount = 0;
    comments.forEach(comment => {
      const authorLink = comment.querySelector('.author, .trac-author-user');
      if (!authorLink) return;

      const username = extractUsername(authorLink);
      if (!username) return;

      const userType = getUserType(comment, username, authorLink);
      if (!userType) return;

      // Add highlight styling
      addCommentHighlight(comment, userType.type, username, userType.label);
      highlightedCount++;
    });

    console.log('[WP Trac Triager] Highlighted comments:', highlightedCount);
  }

  // Extract username from author link
  function extractUsername(authorLink) {
    const href = authorLink.getAttribute('href');
    if (href && href.includes('/query?')) {
      const match = href.match(/reporter=([^&]+)/);
      if (match) return match[1];
    }
    return authorLink.textContent.trim().replace(/^@/, '');
  }

  // Determine user type by detecting role label in the DOM
  function getUserType(comment, username, authorLink) {
    // First, check for Trac's built-in role labels next to the username
    const roleLabel = detectRoleLabel(comment, authorLink);
    if (roleLabel) {
      console.log('[WP Trac Triager] Found role via Trac label:', username, roleLabel);
      return roleLabel;
    }

    // Fallback: Check if component maintainer (from our data)
    const component = getTicketComponent();
    if (component && typeof COMPONENT_MAINTAINERS !== 'undefined' && COMPONENT_MAINTAINERS[component]) {
      if (COMPONENT_MAINTAINERS[component].includes(username)) {
        console.log('[WP Trac Triager] Found component maintainer:', username);
        return { type: 'component-maintainer', label: 'Component Maintainer' };
      }
    }

    // Check if ticket reporter
    const reporterElement = document.querySelector('#ticket .trac-author-user');
    if (reporterElement) {
      const reporter = extractUsername(reporterElement);
      if (reporter === username) {
        console.log('[WP Trac Triager] Found reporter:', username);
        return { type: 'reporter', label: 'Reporter' };
      }
    }

    // Check wpTracContributorLabels from the page
    if (typeof wpTracContributorLabels !== 'undefined' && wpTracContributorLabels[username]) {
      const label = wpTracContributorLabels[username];
      console.log('[WP Trac Triager] Found contributor from Trac:', username, label);

      // Map Trac labels to our types
      const typeMap = {
        'Project Lead': 'core-committer',
        'Lead Developer': 'core-committer',
        'Core Committer': 'core-committer',
        'Emeritus Committer': 'emeritus-committer',
        'Lead Tester': 'lead-tester',
        'Themes Committer': 'contributor',
        'Contributing Developer': 'contributor'
      };

      const type = typeMap[label] || 'contributor';
      return { type, label };
    }

    // Fallback: Check custom user lists from settings (if user wants to add additional users)
    const customCommitters = config.customUsers.coreCommitters || [];
    const customTesters = config.customUsers.leadTesters || [];

    if (customCommitters.includes(username)) {
      console.log('[WP Trac Triager] Found custom committer:', username);
      return { type: 'core-committer', label: 'Core Committer' };
    }
    if (customTesters.includes(username)) {
      console.log('[WP Trac Triager] Found custom tester:', username);
      return { type: 'lead-tester', label: 'Lead Tester' };
    }

    return null;
  }

  // Detect role label from Trac HTML (e.g., "Core Committer", "Emeritus Committer", "Lead Tester")
  function detectRoleLabel(comment, authorLink) {
    // Strategy 1: Look for text immediately after the username
    // The structure is usually: <a>@username</a> Role Label

    // Get the parent container that holds both username and role
    let container = authorLink.parentElement;
    if (!container) return null;

    // Get all text content after the author link
    const fullText = container.textContent;
    const usernameText = authorLink.textContent;
    const afterUsername = fullText.substring(fullText.indexOf(usernameText) + usernameText.length).trim();

    // Extract the role label (first few words after username, before timestamp)
    const roleLabelMatch = afterUsername.match(/^([A-Za-z\s]+?)(?:\s*\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago|$)/);

    if (roleLabelMatch) {
      const potentialRole = roleLabelMatch[1].trim();

      // Map known role labels to our types
      const roleMap = {
        'Core Committer': { type: 'core-committer', label: 'Core Committer' },
        'Emeritus Committer': { type: 'emeritus-committer', label: 'Emeritus Committer' },
        'Lead Tester': { type: 'lead-tester', label: 'Lead Tester' },
        'Component Maintainer': { type: 'component-maintainer', label: 'Component Maintainer' },
        'Core Developer': { type: 'core-committer', label: 'Core Developer' },
        'Contributing Developer': { type: 'contributor', label: 'Contributing Developer' }
      };

      if (roleMap[potentialRole]) {
        return roleMap[potentialRole];
      }
    }

    return null;
  }

  // Add visual highlight to comment
  function addCommentHighlight(comment, userType, username, roleLabel) {
    comment.classList.add('wpt-highlighted');
    comment.classList.add(`wpt-${userType}`);

    // Create badge
    const badge = document.createElement('div');
    badge.className = `wpt-badge wpt-badge-${userType}`;

    const badgeConfig = {
      'core-committer': { icon: '⚡' },
      'emeritus-committer': { icon: '🏆' },
      'component-maintainer': { icon: '🔧' },
      'lead-tester': { icon: '🧪' },
      'contributor': { icon: '💻' },
      'reporter': { icon: '📝' }
    };

    const iconConfig = badgeConfig[userType] || { icon: '👤' };
    badge.innerHTML = `<span class="wpt-badge-icon">${iconConfig.icon}</span> ${roleLabel}`;

    // Insert badge after author (but hide if Trac already shows the label)
    const author = comment.querySelector('.author, .trac-author-user');
    if (author && author.parentNode) {
      // Check if Trac already displays the role label
      const tracRoleVisible = hasVisibleTracRoleLabel(comment);

      if (!tracRoleVisible) {
        author.parentNode.insertBefore(badge, author.nextSibling);
      }
    }
  }

  // Check if Trac already displays a role label visibly
  function hasVisibleTracRoleLabel(comment) {
    // If we detect a role label in the text, Trac is showing it
    // We'll still add our visual border highlight, but skip the redundant badge
    const headerText = comment.querySelector('.trac-author-user')?.parentElement?.textContent || '';
    const knownRoles = ['Core Committer', 'Emeritus Committer', 'Lead Tester', 'Component Maintainer'];

    return knownRoles.some(role => headerText.includes(role));
  }

  // Create keyword explanation sidebar
  function createKeywordSidebar() {
    if (typeof KEYWORD_DATA === 'undefined') {
      console.warn('[WP Trac Triager] KEYWORD_DATA not loaded');
      return;
    }

    const keywords = getTicketKeywords();
    if (keywords.length === 0) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'wpt-keyword-sidebar';
    sidebar.className = 'wpt-sidebar';

    // Header
    const header = document.createElement('div');
    header.className = 'wpt-sidebar-header';
    header.innerHTML = `
      <h3>Trac Keywords</h3>
      <button class="wpt-toggle-btn" title="Toggle sidebar">−</button>
    `;
    sidebar.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'wpt-sidebar-content';

    // Group keywords by category
    const categorizedKeywords = {};
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const keywordData = KEYWORD_DATA[keywordLower];

      if (keywordData) {
        const category = keywordData.category;
        if (!categorizedKeywords[category]) {
          categorizedKeywords[category] = [];
        }
        categorizedKeywords[category].push({ keyword, data: keywordData });
      } else {
        // Unknown keyword
        if (!categorizedKeywords['unknown']) {
          categorizedKeywords['unknown'] = [];
        }
        categorizedKeywords['unknown'].push({
          keyword,
          data: {
            label: keyword,
            description: 'Unknown keyword',
            color: '#999'
          }
        });
      }
    });

    // Render categories
    Object.keys(categorizedKeywords).sort().forEach(category => {
      const categoryConfig = CATEGORY_CONFIG[category] || { icon: '❓', name: 'Other' };

      const categorySection = document.createElement('div');
      categorySection.className = 'wpt-keyword-category';

      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'wpt-keyword-category-header';
      categoryHeader.textContent = `${categoryConfig.icon} ${categoryConfig.name}`;
      categorySection.appendChild(categoryHeader);

      categorizedKeywords[category].forEach(({ keyword, data }) => {
        const keywordItem = document.createElement('div');
        keywordItem.className = 'wpt-keyword-item';
        if (data.critical) {
          keywordItem.classList.add('wpt-keyword-critical');
        }

        keywordItem.innerHTML = `
          <div class="wpt-keyword-label" style="border-left-color: ${data.color}">
            <strong>${data.label}</strong>
            ${data.critical ? '<span class="wpt-critical-badge">Critical</span>' : ''}
          </div>
          <div class="wpt-keyword-description">${data.description}</div>
          <div class="wpt-keyword-usage"><em>Usage:</em> ${data.usage}</div>
        `;

        categorySection.appendChild(keywordItem);
      });

      content.appendChild(categorySection);
    });

    sidebar.appendChild(content);

    // Add toggle functionality
    const toggleBtn = header.querySelector('.wpt-toggle-btn');
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('wpt-collapsed');
      toggleBtn.textContent = sidebar.classList.contains('wpt-collapsed') ? '+' : '−';
    });

    document.body.appendChild(sidebar);
  }

  // Create component maintainer info box
  function createMaintainerInfoBox() {
    if (typeof COMPONENT_MAINTAINERS === 'undefined') {
      console.warn('[WP Trac Triager] COMPONENT_MAINTAINERS not loaded');
      return;
    }

    const component = getTicketComponent();
    if (!component) return;

    const maintainers = COMPONENT_MAINTAINERS[component];
    if (!maintainers || maintainers.length === 0) {
      return; // No maintainers listed
    }

    // Find where to insert the box
    const componentField = document.querySelector('#ticket td.component');
    if (!componentField) return;

    const infoBox = document.createElement('div');
    infoBox.className = 'wpt-maintainer-box';

    infoBox.innerHTML = `
      <div class="wpt-maintainer-header">
        <strong>🔧 Component Maintainers:</strong>
      </div>
      <div class="wpt-maintainer-list">
        ${maintainers.map(username => {
          const profile = MAINTAINER_PROFILES[username];
          const displayName = profile ? profile.name : username;
          const profileUrl = profile ? profile.profile : `https://profiles.wordpress.org/${username}/`;
          const role = profile ? profile.role : '';

          return `
            <div class="wpt-maintainer-item">
              <a href="${profileUrl}" target="_blank" title="${role}">
                ${displayName}
              </a>
              ${role ? `<span class="wpt-maintainer-role">${role}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Check for recent comments from maintainers
    const maintainerComments = findMaintainerComments(maintainers);
    if (maintainerComments.length > 0) {
      const lastComment = maintainerComments[0];
      const timeInfo = document.createElement('div');
      timeInfo.className = 'wpt-maintainer-activity';
      timeInfo.innerHTML = `
        ✓ Last maintainer comment: <strong>${lastComment.author}</strong>
        <span class="wpt-time">${lastComment.timeAgo}</span>
      `;
      infoBox.appendChild(timeInfo);
    }

    // Insert after component field
    componentField.parentNode.insertBefore(infoBox, componentField.nextSibling);
  }

  // Find comments from component maintainers
  function findMaintainerComments(maintainers) {
    const comments = [];
    const changeElements = document.querySelectorAll('.change');

    changeElements.forEach(change => {
      const authorLink = change.querySelector('.trac-author-user');
      if (!authorLink) return;

      const username = extractUsername(authorLink);
      if (maintainers.includes(username)) {
        const timeElement = change.querySelector('.date');
        const timeText = timeElement ? timeElement.getAttribute('title') || timeElement.textContent : '';

        comments.push({
          author: username,
          timeAgo: timeText,
          element: change
        });
      }
    });

    return comments;
  }

  // Start the extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
  } else {
    loadConfig();
  }

})();
