// Content script - runs in isolated context

// Debug mode - only logs if URL contains ?wpt_debug
const DEBUG = false; // Set to true or use ?wpt_debug URL parameter for debugging
const urlDebug = window.location.search.includes('wpt_debug');
function debug(...args) {
  if (DEBUG || urlDebug) console.log('[WP Trac Triager]', ...args);
}

// Visual indicator that extension loaded (temporary)
if (DEBUG) {
  const indicator = document.createElement('div');
  indicator.textContent = '✅ WP Trac Triager Loaded';
  indicator.style.cssText = 'position:fixed;top:10px;left:10px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:99999;font-size:12px;font-family:sans-serif;';
  setTimeout(() => document.body.appendChild(indicator), 1000);
  setTimeout(() => indicator.remove(), 3000);
}

debug('Extension initialized');

// Step 1: Inject script into page context
function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/page-inject.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Step 2: Listen for data from injected script
document.addEventListener('wpt-data-ready', function() {
  const dataElement = document.getElementById('wpt-contributor-data');
  if (dataElement) {
    try {
      const contributorData = JSON.parse(dataElement.getAttribute('data-contributors'));
      debug('Got contributor data:', Object.keys(contributorData).length, 'users');
      highlightContributors(contributorData);
    } catch (error) {
      debug('Error parsing contributor data:', error);
    }
  } else {
    debug('No contributor data element found');
  }
});

// Step 3: Highlight contributors with role-specific colors
function highlightContributors(wpTracContributorLabels) {
  const comments = document.querySelectorAll('.change');

  // Color scheme for different roles
  const roleColors = {
    'Project Lead': { border: '#9C27B0', bg: '#F3E5F5', badge: '#9C27B0' }, // Purple
    'Lead Developer': { border: '#2196F3', bg: '#E3F2FD', badge: '#2196F3' }, // Blue
    'Core Committer': { border: '#4CAF50', bg: '#E8F5E9', badge: '#4CAF50' }, // Green
    'Emeritus Committer': { border: '#FF9800', bg: '#FFF3E0', badge: '#FF9800' }, // Orange
    'Lead Tester': { border: '#E91E63', bg: '#FCE4EC', badge: '#E91E63' }, // Pink
    'Themes Committer': { border: '#00BCD4', bg: '#E0F7FA', badge: '#00BCD4' }, // Cyan
    'default': { border: '#607D8B', bg: '#ECEFF1', badge: '#607D8B' } // Gray
  };

  let highlightedCount = 0;

  comments.forEach(comment => {
    const authorLink = comment.querySelector('.trac-author');
    if (authorLink) {
      const username = authorLink.textContent.trim();

      if (wpTracContributorLabels[username]) {
        const role = wpTracContributorLabels[username];
        const colors = roleColors[role] || roleColors['default'];

        // Add visual highlight - ONLY to the parent div.change, not h3.change
        comment.style.borderLeft = `4px solid ${colors.border}`;
        comment.style.backgroundColor = colors.bg;
        comment.style.paddingLeft = '12px'; // Extra space to prevent avatar overlap

        // Remove duplicate styles from h3.change, but keep avatar spacing
        const h3 = comment.querySelector('h3.change');
        if (h3) {
          h3.style.borderLeft = 'none';
          h3.style.backgroundColor = 'transparent';
          h3.style.paddingLeft = '8px'; // Extra padding for avatar breathing room
        }

        // Find and hide/replace Trac's original .contributor-label badge
        const authorContainer = authorLink.closest('.username-line') || authorLink.parentElement;
        const tracBadge = authorContainer.querySelector('.contributor-label');
        if (tracBadge) {
          // Hide Trac's badge since we'll show our colored one
          tracBadge.style.display = 'none';
        }

        // Check if our badge already exists
        let ourBadge = authorContainer.querySelector('.wpt-role-badge');

        if (!ourBadge) {
          // Create our colored badge
          ourBadge = document.createElement('span');
          ourBadge.className = 'wpt-role-badge';
          ourBadge.textContent = role;

          // Insert after the username span
          const usernameSpan = authorLink.querySelector('.username');
          if (usernameSpan) {
            usernameSpan.parentElement.insertBefore(ourBadge, usernameSpan.nextSibling);
          } else {
            authorLink.appendChild(ourBadge);
          }
        }

        // Style our badge with role-specific color
        ourBadge.style.cssText = `
          display: inline-block;
          background: ${colors.badge};
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 8px;
        `;

        highlightedCount++;
      }
    }
  });
}

// Helper: Get component maintainer information
function getComponentMaintainerInfo() {
  // Check if maintainer data is available
  if (typeof COMPONENT_MAINTAINERS === 'undefined' || typeof MAINTAINER_PROFILES === 'undefined') {
    return null;
  }

  // Get the component from the ticket
  const componentElement = document.querySelector('#ticket td[headers="h_component"]');
  if (!componentElement) {
    return null;
  }

  const component = componentElement.textContent.trim();
  const maintainers = COMPONENT_MAINTAINERS[component];

  if (!maintainers || maintainers.length === 0) {
    return null; // No maintainers for this component
  }

  // Build maintainer info with profiles and last comments
  const maintainerList = maintainers.map(username => {
    const profile = MAINTAINER_PROFILES[username];
    const displayName = profile ? profile.name : username;
    const profileUrl = profile ? profile.profile : `https://profiles.wordpress.org/${username}/`;
    const role = profile ? profile.role : '';

    // Find last comment from this maintainer
    const lastComment = findLastCommentByUser(username);

    return {
      username,
      displayName,
      profileUrl,
      role,
      lastComment
    };
  });

  return {
    component,
    maintainers: maintainerList
  };
}

// Helper: Find last comment by specific user
function findLastCommentByUser(username) {
  const changes = document.querySelectorAll('.change');

  // Search backwards (most recent first)
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i];
    const authorElement = change.querySelector('.trac-author');

    if (authorElement && authorElement.textContent.trim() === username) {
      // Extract comment ID and date
      const commentId = change.id;
      const changeHeader = change.querySelector('h3.change');
      let date = 'unknown';

      if (changeHeader) {
        const headerText = changeHeader.textContent;
        const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
        if (timeMatch) {
          date = timeMatch[1];
        }
      }

      return {
        link: `#${commentId}`,
        date
      };
    }
  }

  return null; // User hasn't commented
}

// Helper: Get last N comments information
function getRecentComments(count = 3, contributorData = {}) {
  const changes = document.querySelectorAll('.change');
  if (changes.length === 0) return [];

  // Define role colors (same as highlighting)
  const roleColors = {
    'Project Lead': '#9C27B0',
    'Lead Developer': '#2196F3',
    'Core Committer': '#4CAF50',
    'Emeritus Committer': '#FF9800',
    'Lead Tester': '#E91E63',
    'Themes Committer': '#00BCD4'
  };

  const recentComments = [];
  // Start from the end and go backwards
  for (let i = changes.length - 1; i >= 0 && recentComments.length < count; i--) {
    const change = changes[i];

    // Extract comment number from ID
    // Handles formats like "comment:9" or "trac-change-28-1770132177551298"
    const commentId = change.id;
    let commentNumber = null;

    if (commentId) {
      if (commentId.startsWith('comment:')) {
        commentNumber = commentId.replace('comment:', '');
      } else if (commentId.startsWith('trac-change-')) {
        // Extract number from "trac-change-28-1770132177551298" -> "28"
        const match = commentId.match(/trac-change-(\d+)-/);
        commentNumber = match ? match[1] : null;
      }
    }

    // Skip if no valid comment ID
    if (!commentNumber) continue;

    // Extract author (username only, without role label)
    // Try multiple selectors
    const authorElement = change.querySelector('.trac-author, .trac-author-user, a[href*="query"]');
    let author = 'unknown';

    if (authorElement) {
      // Try to get username from href first (more reliable)
      const href = authorElement.getAttribute('href');
      if (href) {
        // Try multiple patterns
        const patterns = [
          /[?&](?:reporter|owner|author)=([^&]+)/,
          /profiles\.wordpress\.org\/([^\/]+)/
        ];

        for (const pattern of patterns) {
          const match = href.match(pattern);
          if (match) {
            author = match[1];
            break;
          }
        }
      }

      // Fallback: extract from text content, removing role labels
      if (author === 'unknown') {
        const text = authorElement.textContent.trim();
        // Remove common role labels that might be appended
        author = text.replace(/\s*(Core Committer|Lead Tester|Project Lead|Lead Developer|Emeritus Committer|Themes Committer).*$/, '');
      }
    }


    // Check if author has a role
    let role = null;
    let roleColor = null;

    if (contributorData[author]) {
      role = contributorData[author];
      roleColor = roleColors[role] || '#607D8B';
    }

    // Extract date
    const changeHeader = change.querySelector('h3.change');
    let date = 'unknown';
    if (changeHeader) {
      const headerText = changeHeader.textContent;
      const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
      if (timeMatch) {
        date = timeMatch[1];
      }
    }

    recentComments.push({
      number: commentNumber,
      author: author,
      role: role,
      roleColor: roleColor,
      date: date,
      link: `#${commentId}`
    });
  }

  return recentComments;
}

// Helper: Extract keyword history from change log
function extractKeywordHistory() {
  const history = {};
  const changes = document.querySelectorAll('.change');

  changes.forEach(change => {
    // Find keyword changes in this comment
    const changeItems = change.querySelectorAll('ul.changes li');
    changeItems.forEach(item => {
      const text = item.textContent;

      // Look for "Keywords something added" or "Keywords something removed"
      if (text.includes('Keywords') && (text.includes('added') || text.includes('removed'))) {
        // Extract the action and keyword(s)
        const match = text.match(/Keywords?\s+(.+?)\s+(added|removed)/);
        if (match) {
          const keywordStr = match[1].trim();
          const action = match[2];
          const keywords = keywordStr.split(/\s+/);

          // Get comment link and date
          const commentId = change.id; // e.g., "comment:1"
          const commentLink = commentId ? `#${commentId}` : null;

          // Look for time in the change header (h3.change or nearby)
          const changeHeader = change.querySelector('h3.change');
          let timeText = 'unknown';
          if (changeHeader) {
            // Extract from header text (e.g., "16 months ago")
            const headerText = changeHeader.textContent;
            const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
            if (timeMatch) {
              timeText = timeMatch[1]; // This includes "ago"
            }
          }

          const authorElement = change.querySelector('.trac-author');
          const author = authorElement ? authorElement.textContent.trim() : 'unknown';

          keywords.forEach(kw => {
            if (action === 'added') {
              history[kw.toLowerCase()] = {
                date: timeText,
                commentLink,
                author,
                action: 'added'
              };
            }
          });
        }
      }
    });
  });

  return history;
}

// Step 4: Create keyword sidebar
function createKeywordSidebar(contributorData = {}) {
  debug('Creating keyword sidebar...');

  // Check if data is available
  if (typeof KEYWORD_DATA === 'undefined') {
    debug('ERROR: KEYWORD_DATA not available');
    return;
  }
  debug('KEYWORD_DATA available');

  // Get keywords from the ticket
  // Note: The td doesn't have class="keywords", it has headers="h_keywords"
  const keywordsElement = document.querySelector('#ticket td[headers="h_keywords"]');

  if (!keywordsElement) {
    debug('ERROR: Keywords element not found with selector: #ticket td[headers="h_keywords"]');
    return;
  }
  debug('Found keywords element:', keywordsElement);

  const keywordText = keywordsElement.textContent.trim();
  const keywords = keywordText ? keywordText.split(/\s+/).filter(k => k.length > 0) : [];
  debug('Keywords extracted:', keywords.length, 'keywords');

  // Extract keyword history
  const keywordHistory = extractKeywordHistory();
  debug('Keyword history extracted');

  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'wpt-keyword-sidebar';
  debug('Sidebar element created');

  // Integrated sidebar styling (fixed to right edge, content adjusts to not overlap)
  sidebar.style.cssText = `
    position: fixed;
    top: 80px;
    right: 0;
    width: 340px;
    height: calc(100vh - 80px);
    background: white;
    border-left: 1px solid #ddd;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    padding: 16px;
    overflow-y: auto;
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);
  `;

  // Create toggle button that appears when sidebar is hidden
  const sidebarToggleBtn = document.createElement('button');
  sidebarToggleBtn.id = 'wpt-sidebar-toggle';
  sidebarToggleBtn.innerHTML = '◀'; // Left arrow
  sidebarToggleBtn.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 32px;
    height: 80px;
    background: white;
    border: 1px solid #ddd;
    border-right: none;
    border-radius: 8px 0 0 8px;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #666;
    z-index: 1001;
    transition: background 0.2s;
  `;
  sidebarToggleBtn.onmouseover = () => {
    sidebarToggleBtn.style.background = '#f0f0f0';
  };
  sidebarToggleBtn.onmouseout = () => {
    sidebarToggleBtn.style.background = 'white';
  };

  // Adjust main content to make room for sidebar
  const mainContent = document.querySelector('#main') || document.querySelector('#content') || document.querySelector('body');

  // Function to toggle sidebar visibility
  function toggleSidebarVisibility(show) {
    if (show) {
      sidebar.style.transform = 'translateX(0)';
      sidebarToggleBtn.style.display = 'none';
      if (mainContent) {
        mainContent.style.marginRight = '340px';
        mainContent.style.transition = 'margin-right 0.3s ease-in-out';
      }
    } else {
      sidebar.style.transform = 'translateX(100%)';
      sidebarToggleBtn.style.display = 'flex';
      if (mainContent) {
        mainContent.style.marginRight = '0';
        mainContent.style.transition = 'margin-right 0.3s ease-in-out';
      }
    }
    // Save state
    localStorage.setItem('wpt-sidebar-visible', show ? 'true' : 'false');
  }

  // Check saved visibility state
  const savedVisible = localStorage.getItem('wpt-sidebar-visible');
  const isVisible = savedVisible !== 'false'; // default to visible

  if (mainContent) {
    mainContent.style.marginRight = isVisible ? '340px' : '0';
    debug('Main content adjusted, marginRight:', mainContent.style.marginRight);
  } else {
    debug('WARNING: Could not find main content element');
  }

  // Initialize visibility
  if (!isVisible) {
    toggleSidebarVisibility(false);
  }

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 12px 0;
    user-select: none;
  `;

  const headerTitle = document.createElement('h3');
  headerTitle.textContent = '🔍 TRAC Visual Helper';
  headerTitle.style.cssText = `
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '▶'; // Right arrow to indicate hiding to the right
  toggleBtn.title = 'Hide sidebar';
  toggleBtn.style.cssText = `
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    color: #666;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  toggleBtn.onmouseover = () => {
    toggleBtn.style.background = '#f0f0f0';
  };
  toggleBtn.onmouseout = () => {
    toggleBtn.style.background = 'none';
  };

  header.appendChild(headerTitle);
  header.appendChild(toggleBtn);

  sidebar.appendChild(header);

  // Content wrapper
  const content = document.createElement('div');
  content.id = 'wpt-sidebar-content';
  content.style.cssText = `
    display: block;
  `;

  // Toggle button in header hides entire sidebar
  toggleBtn.addEventListener('click', (e) => {
    toggleSidebarVisibility(false);
  });

  // External toggle button shows sidebar
  sidebarToggleBtn.addEventListener('click', (e) => {
    toggleSidebarVisibility(true);
  });

  // Add recent comments section
  const recentComments = getRecentComments(3, contributorData);
  debug('Recent comments found:', recentComments.length);
  if (recentComments.length > 0) {
    const recentCommentsBox = document.createElement('div');
    recentCommentsBox.style.cssText = `
      margin-bottom: 16px;
      padding: 12px;
      background: #f0f6fc;
      border-left: 3px solid #0969da;
      border-radius: 4px;
    `;

    const commentsLabel = document.createElement('div');
    commentsLabel.style.cssText = `
      font-size: 13px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    `;
    commentsLabel.textContent = '💬 Recent Comments';
    recentCommentsBox.appendChild(commentsLabel);

    // Add each comment
    recentComments.forEach((comment, index) => {
      const commentItem = document.createElement('div');
      commentItem.style.cssText = `
        padding: 6px 0;
        ${index < recentComments.length - 1 ? 'border-bottom: 1px solid #d0d7de;' : ''}
      `;

      const commentLink = document.createElement('a');
      commentLink.href = comment.link;
      commentLink.textContent = `#${comment.number}`;
      commentLink.style.cssText = `
        font-weight: bold;
        color: ${comment.roleColor || '#0969da'};
        text-decoration: none;
        font-size: 13px;
      `;
      commentLink.onmouseover = () => commentLink.style.textDecoration = 'underline';
      commentLink.onmouseout = () => commentLink.style.textDecoration = 'none';

      const commentMeta = document.createElement('div');
      commentMeta.style.cssText = `
        font-size: 11px;
        color: #666;
        margin-top: 2px;
      `;

      // Build meta text with linked author name
      commentMeta.innerHTML = `${comment.date} by `;

      const authorLink = document.createElement('a');
      authorLink.href = `https://profiles.wordpress.org/${comment.author}/`;
      authorLink.target = '_blank';
      authorLink.textContent = comment.author;
      authorLink.style.cssText = `
        color: #0969da;
        text-decoration: none;
      `;
      authorLink.onmouseover = () => authorLink.style.textDecoration = 'underline';
      authorLink.onmouseout = () => authorLink.style.textDecoration = 'none';

      commentMeta.appendChild(authorLink);

      if (comment.role) {
        const roleSpan = document.createElement('span');
        roleSpan.textContent = ` (${comment.role})`;
        commentMeta.appendChild(roleSpan);
      }

      commentItem.appendChild(commentLink);
      commentItem.appendChild(commentMeta);
      recentCommentsBox.appendChild(commentItem);
    });

    content.appendChild(recentCommentsBox);
    debug('Recent comments section added to content');
  }

  // Add component maintainer info
  const maintainerInfo = getComponentMaintainerInfo();
  debug('Maintainer info:', maintainerInfo ? maintainerInfo.component : 'none');
  if (maintainerInfo) {
    const maintainerBox = document.createElement('div');
    maintainerBox.style.cssText = `
      margin-bottom: 16px;
      padding: 12px;
      background: #fff8e6;
      border-left: 3px solid #f59e0b;
      border-radius: 4px;
    `;

    const maintainerLabel = document.createElement('div');
    maintainerLabel.style.cssText = `
      font-size: 13px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    `;
    maintainerLabel.textContent = '🔧 Component Maintainers';
    maintainerBox.appendChild(maintainerLabel);

    // Add context description
    const contextDesc = document.createElement('div');
    contextDesc.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.5;
    `;
    contextDesc.innerHTML = `This issue is categorized as part of the <strong>${maintainerInfo.component}</strong> component, which is maintained by:`;
    maintainerBox.appendChild(contextDesc);

    // Add each maintainer
    maintainerInfo.maintainers.forEach((maintainer, index) => {
      const maintainerItem = document.createElement('div');
      maintainerItem.style.cssText = `
        padding: 6px 0;
        ${index < maintainerInfo.maintainers.length - 1 ? 'border-bottom: 1px solid #fde68a;' : ''}
      `;

      const maintainerLink = document.createElement('a');
      maintainerLink.href = maintainer.profileUrl;
      maintainerLink.target = '_blank';
      maintainerLink.textContent = `${maintainer.displayName} (@${maintainer.username})`;
      maintainerLink.style.cssText = `
        font-weight: bold;
        color: #d97706;
        text-decoration: none;
        font-size: 13px;
      `;
      maintainerLink.onmouseover = () => maintainerLink.style.textDecoration = 'underline';
      maintainerLink.onmouseout = () => maintainerLink.style.textDecoration = 'none';

      maintainerItem.appendChild(maintainerLink);

      if (maintainer.role) {
        const roleSpan = document.createElement('span');
        roleSpan.style.cssText = `
          font-size: 11px;
          color: #666;
          margin-left: 4px;
        `;
        roleSpan.textContent = `(${maintainer.role})`;
        maintainerItem.appendChild(roleSpan);
      }

      // Show last comment info if available
      if (maintainer.lastComment) {
        const lastCommentDiv = document.createElement('div');
        lastCommentDiv.style.cssText = `
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        `;
        lastCommentDiv.innerHTML = `Last commented <a href="${maintainer.lastComment.link}" style="color: #d97706; text-decoration: none;">${maintainer.lastComment.date}</a>`;
        maintainerItem.appendChild(lastCommentDiv);
      }

      maintainerBox.appendChild(maintainerItem);
    });

    // Add link to components page
    const componentsLink = document.createElement('div');
    componentsLink.style.cssText = `
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #fde68a;
      font-size: 11px;
    `;

    const link = document.createElement('a');
    link.href = 'https://make.wordpress.org/core/components/';
    link.target = '_blank';
    link.textContent = 'View all WordPress components →';
    link.style.cssText = `
      color: #d97706;
      text-decoration: none;
      font-weight: 500;
    `;
    link.onmouseover = () => link.style.textDecoration = 'underline';
    link.onmouseout = () => link.style.textDecoration = 'none';

    componentsLink.appendChild(link);
    maintainerBox.appendChild(componentsLink);

    content.appendChild(maintainerBox);
    debug('Maintainer section added to content');
  }

  // Add Keywords section header and context
  const keywordsHeader = document.createElement('div');
  keywordsHeader.style.cssText = `
    margin-bottom: 12px;
  `;

  const keywordsTitle = document.createElement('div');
  keywordsTitle.style.cssText = `
    font-size: 13px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  `;
  keywordsTitle.textContent = '🏷️ TRAC Keywords';
  keywordsHeader.appendChild(keywordsTitle);

  const keywordsContext = document.createElement('div');
  keywordsContext.style.cssText = `
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.5;
  `;

  if (keywords.length > 0) {
    keywordsContext.innerHTML = `According to the keywords, the current state of this issue is:`;
  } else {
    keywordsContext.innerHTML = `This ticket has <strong>no keywords</strong> assigned yet. Keywords help categorize and track the status of tickets.`;
  }

  keywordsHeader.appendChild(keywordsContext);

  content.appendChild(keywordsHeader);

  // Show message if no keywords, otherwise list them
  if (keywords.length === 0) {
    const noKeywordsMsg = document.createElement('div');
    noKeywordsMsg.style.cssText = `
      margin-bottom: 16px;
      padding: 12px;
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      border-radius: 4px;
      font-size: 13px;
      color: #856404;
    `;
    noKeywordsMsg.innerHTML = `<strong>ℹ️ No keywords found.</strong><br>Consider adding relevant keywords to help with triage and categorization.`;
    content.appendChild(noKeywordsMsg);
  }

  // Add each keyword
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordData = KEYWORD_DATA[keywordLower];

    if (keywordData) {
      const item = document.createElement('div');
      item.style.cssText = `
        margin-bottom: 16px;
        padding: 12px;
        background: #f9f9f9;
        border-left: 3px solid ${keywordData.color};
        border-radius: 4px;
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      `;
      label.textContent = keywordData.label;

      const description = document.createElement('div');
      description.style.cssText = `
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      `;
      description.textContent = keywordData.description;

      const usage = document.createElement('div');
      usage.style.cssText = `
        font-size: 12px;
        color: #888;
        font-style: italic;
      `;
      usage.textContent = 'Usage: ' + keywordData.usage;

      item.appendChild(label);
      item.appendChild(description);
      item.appendChild(usage);

      // Add keyword history (when it was added)
      const history = keywordHistory[keywordLower];
      if (history) {
        const historyDiv = document.createElement('div');
        historyDiv.style.cssText = `
          font-size: 11px;
          color: #555;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #ddd;
        `;

        // Create text with linked author name
        const addedText = document.createTextNode(`Added ${history.date} by `);
        historyDiv.appendChild(addedText);

        const authorLink = document.createElement('a');
        authorLink.href = `https://profiles.wordpress.org/${history.author}/`;
        authorLink.target = '_blank';
        authorLink.textContent = history.author;
        authorLink.style.cssText = `
          color: #2271b1;
          text-decoration: none;
        `;
        authorLink.onmouseover = () => authorLink.style.textDecoration = 'underline';
        authorLink.onmouseout = () => authorLink.style.textDecoration = 'none';
        historyDiv.appendChild(authorLink);

        if (history.commentLink) {
          const commentLink = document.createElement('a');
          commentLink.href = history.commentLink;
          commentLink.textContent = ' → View comment';
          commentLink.style.cssText = `
            color: #2271b1;
            text-decoration: none;
            margin-left: 4px;
          `;
          commentLink.onmouseover = () => commentLink.style.textDecoration = 'underline';
          commentLink.onmouseout = () => commentLink.style.textDecoration = 'none';
          historyDiv.appendChild(commentLink);
        }

        item.appendChild(historyDiv);
      }

      content.appendChild(item);
    }
  });

  // Append content to sidebar, then sidebar and toggle button to body
  sidebar.appendChild(content);
  debug('About to append sidebar to body. Sidebar HTML length:', sidebar.innerHTML.length);
  document.body.appendChild(sidebar);
  document.body.appendChild(sidebarToggleBtn);
  debug('Sidebar and toggle button appended to body successfully!');
}

// Start the process
injectPageScript();

// Add keyword sidebar after page loads
document.addEventListener('wpt-data-ready', function() {
  // Get contributor data
  const dataElement = document.getElementById('wpt-contributor-data');
  let contributorData = {};

  if (dataElement) {
    try {
      contributorData = JSON.parse(dataElement.getAttribute('data-contributors'));
    } catch (e) {
    }
  }

  // Wait a bit for highlighting to complete
  setTimeout(() => createKeywordSidebar(contributorData), 500);
});
