// Content script - runs in isolated context
console.log('🚀 WP Trac Triager Content Script LOADED!');

// Step 1: Inject script into page context
function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/page-inject.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
  console.log('💉 Injected page script');
}

// Step 2: Listen for data from injected script
document.addEventListener('wpt-data-ready', function() {
  console.log('📨 Received data ready event!');

  const dataElement = document.getElementById('wpt-contributor-data');
  if (dataElement) {
    const contributorData = JSON.parse(dataElement.getAttribute('data-contributors'));
    console.log('✅ Got contributor data:', Object.keys(contributorData).length, 'users');

    highlightContributors(contributorData);
  } else {
    console.error('❌ Data element not found');
  }
});

// Step 3: Highlight contributors with role-specific colors
function highlightContributors(wpTracContributorLabels) {
  const comments = document.querySelectorAll('.change');
  console.log('✅ Found', comments.length, 'comments');

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

        console.log('⭐ HIGHLIGHTING:', username, '-', role, colors);

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

  console.log('✅ Highlighted', highlightedCount, 'comments!');
}

// Helper: Get component maintainer information
function getComponentMaintainerInfo() {
  // Check if maintainer data is available
  if (typeof COMPONENT_MAINTAINERS === 'undefined' || typeof MAINTAINER_PROFILES === 'undefined') {
    console.warn('[WP Trac Triager] Maintainer data not loaded');
    return null;
  }

  // Get the component from the ticket
  const componentElement = document.querySelector('#ticket td[headers="h_component"]');
  if (!componentElement) {
    console.warn('[WP Trac Triager] Component field not found');
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
function getRecentComments(count = 3) {
  const changes = document.querySelectorAll('.change');
  if (changes.length === 0) return [];

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
    const authorElement = change.querySelector('.trac-author');
    let author = 'unknown';

    if (authorElement) {
      // Try to get username from href first (more reliable)
      const href = authorElement.getAttribute('href');
      if (href) {
        const match = href.match(/[?&](?:reporter|owner|author)=([^&]+)/);
        if (match) {
          author = match[1];
        }
      }

      // Fallback to text content (but this might include role)
      if (author === 'unknown') {
        author = authorElement.textContent.trim();
      }
    }

    // Check if author has a role (from wpTracContributorLabels)
    const dataElement = document.getElementById('wpt-contributor-data');
    let role = null;
    let roleColor = null;

    if (dataElement) {
      try {
        const contributorData = JSON.parse(dataElement.getAttribute('data-contributors'));
        if (contributorData && contributorData[author]) {
          role = contributorData[author];

          // Map role to color (same colors as highlighting)
          const roleColors = {
            'Project Lead': '#9C27B0',
            'Lead Developer': '#2196F3',
            'Core Committer': '#4CAF50',
            'Emeritus Committer': '#FF9800',
            'Lead Tester': '#E91E63',
            'Themes Committer': '#00BCD4'
          };
          roleColor = roleColors[role] || '#607D8B';
        }
      } catch (e) {
        console.log('Error parsing contributor data:', e);
      }
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
function createKeywordSidebar() {
  console.log('🔑 Creating keyword sidebar...');

  // Check if data is available
  if (typeof KEYWORD_DATA === 'undefined') {
    console.error('❌ KEYWORD_DATA not available');
    console.log('Available globals:', Object.keys(window).filter(k => k.includes('KEYWORD')));
    return;
  }
  console.log('✅ KEYWORD_DATA loaded:', Object.keys(KEYWORD_DATA).length, 'keywords');

  // Get keywords from the ticket
  // Note: The td doesn't have class="keywords", it has headers="h_keywords"
  const keywordsElement = document.querySelector('#ticket td[headers="h_keywords"]');
  console.log('Looking for keywords in:', keywordsElement);

  if (!keywordsElement) {
    console.error('❌ No keywords field found with selector: td[headers="h_keywords"]');
    return;
  }

  const keywordText = keywordsElement.textContent.trim();
  if (!keywordText) {
    console.log('ℹ️ No keywords on this ticket');
    return;
  }

  const keywords = keywordText.split(/\s+/).filter(k => k.length > 0);
  console.log('📋 Found keywords:', keywords);

  // Extract keyword history
  const keywordHistory = extractKeywordHistory();
  console.log('📅 Keyword history:', keywordHistory);

  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'wpt-keyword-sidebar';

  // Load saved position or use defaults
  const savedPosition = localStorage.getItem('wpt-sidebar-position');
  let sidebarPos = { right: '20px', top: '100px', left: 'auto', bottom: 'auto' };
  if (savedPosition) {
    sidebarPos = JSON.parse(savedPosition);
  }

  sidebar.style.cssText = `
    position: fixed;
    right: ${sidebarPos.right};
    top: ${sidebarPos.top};
    left: ${sidebarPos.left};
    bottom: ${sidebarPos.bottom};
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 16px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
  `;

  // Header (acts as drag handle)
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 12px 0;
    cursor: grab;
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
  toggleBtn.textContent = '−';
  toggleBtn.style.cssText = `
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 18px;
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

  // Make sidebar draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    header.style.cursor = 'grabbing';

    // Get initial mouse position
    initialX = e.clientX;
    initialY = e.clientY;

    // Get current sidebar position
    const rect = sidebar.getBoundingClientRect();
    currentX = rect.left;
    currentY = rect.top;

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    e.preventDefault();

    // Calculate new position
    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    // Update sidebar position
    sidebar.style.left = newX + 'px';
    sidebar.style.top = newY + 'px';
    sidebar.style.right = 'auto';
    sidebar.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'grab';

      // Save position to localStorage
      const position = {
        left: sidebar.style.left,
        top: sidebar.style.top,
        right: 'auto',
        bottom: 'auto'
      };
      localStorage.setItem('wpt-sidebar-position', JSON.stringify(position));
    }
  });

  sidebar.appendChild(header);

  // Content wrapper (everything that can be collapsed)
  const content = document.createElement('div');
  content.id = 'wpt-sidebar-content';
  content.style.cssText = `
    display: block;
  `;

  // Toggle collapse/expand functionality
  const savedCollapsed = localStorage.getItem('wpt-sidebar-collapsed');
  let isCollapsed = savedCollapsed === 'true';

  if (isCollapsed) {
    content.style.display = 'none';
    toggleBtn.textContent = '+';
  }

  // Prevent dragging when interacting with toggle button
  toggleBtn.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isCollapsed = !isCollapsed;

    if (isCollapsed) {
      content.style.display = 'none';
      toggleBtn.textContent = '+';
    } else {
      content.style.display = 'block';
      toggleBtn.textContent = '−';
    }

    // Save state
    localStorage.setItem('wpt-sidebar-collapsed', isCollapsed);
  });

  // Add recent comments section
  const recentComments = getRecentComments(3);
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

      // Build meta text with proper spacing
      let metaText = `${comment.date} by ${comment.author}`;
      if (comment.role) {
        metaText += ` (${comment.role})`;
      }
      commentMeta.textContent = metaText;

      commentItem.appendChild(commentLink);
      commentItem.appendChild(commentMeta);
      recentCommentsBox.appendChild(commentItem);
    });

    content.appendChild(recentCommentsBox);
  }

  // Add component maintainer info
  const maintainerInfo = getComponentMaintainerInfo();
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
      maintainerLink.textContent = maintainer.displayName;
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
          margin-left: 6px;
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
  keywordsContext.innerHTML = `According to the keywords, the current state of this issue is:`;
  keywordsHeader.appendChild(keywordsContext);

  content.appendChild(keywordsHeader);

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

        const historyText = document.createElement('span');
        historyText.textContent = `Added ${history.date} by ${history.author}`;

        if (history.commentLink) {
          const link = document.createElement('a');
          link.href = history.commentLink;
          link.textContent = ' → View comment';
          link.style.cssText = `
            color: #2271b1;
            text-decoration: none;
            margin-left: 4px;
          `;
          link.onmouseover = () => link.style.textDecoration = 'underline';
          link.onmouseout = () => link.style.textDecoration = 'none';
          historyDiv.appendChild(historyText);
          historyDiv.appendChild(link);
        } else {
          historyDiv.textContent = `Added ${history.date} by ${history.author}`;
        }

        item.appendChild(historyDiv);
      }

      content.appendChild(item);
    }
  });

  // Append content to sidebar, then sidebar to body
  sidebar.appendChild(content);
  document.body.appendChild(sidebar);
  console.log('✅ Keyword sidebar created!');
}

// Start the process
injectPageScript();

// Add keyword sidebar after page loads
document.addEventListener('wpt-data-ready', function() {
  // Wait a bit for highlighting to complete
  setTimeout(createKeywordSidebar, 500);
});
