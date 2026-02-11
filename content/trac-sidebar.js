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

  const roleStats = {};
  let highlightedCount = 0;

  comments.forEach(comment => {
    const authorLink = comment.querySelector('.trac-author');
    if (!authorLink) return;

    const username = authorLink.textContent.trim();

    // Only highlight and badge core team members
    if (!wpTracContributorLabels[username]) return;

    const role = wpTracContributorLabels[username];
    const colors = roleColors[role] || roleColors['default'];

    // Count role appearances for legend (core team only)
    roleStats[role] = (roleStats[role] || 0) + 1;

    // Check if this is a GitHub-synced comment
    const header = comment.querySelector('h3.change');
    const isGitHubSynced = header && (
      header.classList.contains('chat-bot') ||
      header.classList.contains('prbot')
    );

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

    // Add GitHub sync indicator if applicable
    if (isGitHubSynced) {
      let syncBadge = authorContainer.querySelector('.wpt-github-badge');
      if (!syncBadge) {
        syncBadge = document.createElement('span');
        syncBadge.className = 'wpt-github-badge';
        syncBadge.innerHTML = '🔗 GitHub PR';
        syncBadge.style.cssText = `
          display: inline-block;
          background: #24292e;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          margin-left: 4px;
          font-weight: bold;
        `;
        ourBadge.parentNode.insertBefore(syncBadge, ourBadge.nextSibling);
      }
    }

    highlightedCount++;
  });

  // Add authority legend to sidebar (core team only)
  if (Object.keys(roleStats).length > 0) {
    setTimeout(() => addAuthorityLegend(roleStats), 100);
  }
}

// Helper: Create collapsible section with persistent state
function createCollapsibleSection(sectionId, title, icon, defaultExpanded = true) {
  const isExpanded = localStorage.getItem(`wpt-section-${sectionId}`) !== 'false';

  const container = document.createElement('div');
  container.id = `wpt-section-${sectionId}`;
  container.style.cssText = `
    margin-bottom: 16px;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 8px;
    user-select: none;
  `;

  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = `
    font-size: 13px;
    font-weight: bold;
    color: #333;
  `;
  titleDiv.textContent = `${icon} ${title}`;

  const toggleIcon = document.createElement('span');
  toggleIcon.textContent = isExpanded ? '▼' : '▶';
  toggleIcon.style.cssText = `
    font-size: 10px;
    color: #666;
    transition: transform 0.2s;
  `;

  header.appendChild(titleDiv);
  header.appendChild(toggleIcon);

  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    display: ${isExpanded ? 'block' : 'none'};
    transition: all 0.2s ease-in-out;
  `;

  header.addEventListener('click', () => {
    const isCurrentlyExpanded = contentWrapper.style.display !== 'none';
    const newExpanded = !isCurrentlyExpanded;

    contentWrapper.style.display = newExpanded ? 'block' : 'none';
    toggleIcon.textContent = newExpanded ? '▼' : '▶';

    localStorage.setItem(`wpt-section-${sectionId}`, newExpanded ? 'true' : 'false');
  });

  container.appendChild(header);
  container.appendChild(contentWrapper);

  return { container, contentWrapper };
}

// Helper: Get ticket summary information
function getTicketSummary() {
  const summary = {};

  // Ticket ID from page
  const ticketLink = document.querySelector('.trac-id');
  summary.id = ticketLink ? ticketLink.textContent.trim() : '';

  // Status - from span.trac-status
  const statusElement = document.querySelector('.trac-status a');
  summary.status = statusElement ? statusElement.textContent.trim() : '';
  summary.statusUrl = statusElement ? statusElement.href : null;

  // Type - from span.trac-type
  const typeElement = document.querySelector('.trac-type a');
  summary.type = typeElement ? typeElement.textContent.trim() : '';
  summary.typeUrl = typeElement ? typeElement.href : null;

  // Reporter (with link) - use a.trac-author in the reporter cell
  const reporterLink = document.querySelector('#ticket td[headers="h_reporter"] a.trac-author');
  summary.reporter = reporterLink ? reporterLink.textContent.trim() : 'Unknown';
  summary.reporterUrl = reporterLink ? reporterLink.href : null;

  // Owner (with link) - check both link and plain text
  const ownerElement = document.querySelector('#ticket td[headers="h_owner"]');
  const ownerLink = ownerElement ? ownerElement.querySelector('a') : null;
  const ownerText = ownerElement ? ownerElement.textContent.trim() : '';
  summary.owner = ownerText || 'Unowned';
  summary.ownerUrl = ownerLink ? ownerLink.href : null;

  // Milestone (with link)
  const milestoneElement = document.querySelector('#ticket td[headers="h_milestone"]');
  const milestoneLink = milestoneElement ? milestoneElement.querySelector('a') : null;
  summary.milestone = milestoneElement ? milestoneElement.textContent.trim() : '';
  summary.milestoneUrl = milestoneLink ? milestoneLink.href : null;

  // Priority
  const priorityElement = document.querySelector('#ticket td[headers="h_priority"]');
  summary.priority = priorityElement ? priorityElement.textContent.trim() : '';

  // Severity
  const severityElement = document.querySelector('#ticket td[headers="h_severity"]');
  summary.severity = severityElement ? severityElement.textContent.trim() : '';

  // Component (with link)
  const componentElement = document.querySelector('#ticket td[headers="h_component"]');
  const componentLink = componentElement ? componentElement.querySelector('a') : null;
  summary.component = componentElement ? componentElement.textContent.trim() : '';
  summary.componentUrl = componentLink ? componentLink.href : null;

  // Keywords (will be split into individual links later)
  const keywordsElement = document.querySelector('#ticket td[headers="h_keywords"]');
  summary.keywords = keywordsElement ? keywordsElement.textContent.trim() : '';

  // Dates - from the header section
  const openedElement = document.querySelector('.date p');
  if (openedElement) {
    const dateText = openedElement.textContent;
    // Extract "Opened X ago" and "Last modified X ago"
    const openedMatch = dateText.match(/Opened (.+?)(?:Last|$)/);
    const modifiedMatch = dateText.match(/Last modified (.+?)$/);

    summary.opened = openedMatch ? openedMatch[1].trim() : '';
    summary.lastModified = modifiedMatch ? modifiedMatch[1].trim() : '';
  }

  debug('Ticket summary extracted:', summary);
  return summary;
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

    // Extract date - check multiple locations (same as milestone history fix)
    let date = 'unknown';

    // Try 1: Look for .date .timeline link (most reliable)
    const dateDiv = change.querySelector('.date');
    if (dateDiv) {
      const timelineLink = dateDiv.querySelector('.timeline');
      if (timelineLink) {
        date = timelineLink.textContent.trim();
      }
    }

    // Try 2: Look for .trac-time or time-related spans
    if (date === 'unknown') {
      const timeSpan = change.querySelector('.trac-time, .time-ago, [title*="ago"]');
      if (timeSpan) {
        date = timeSpan.textContent.trim();
      }
    }

    // Try 3: Parse from header text as fallback
    if (date === 'unknown') {
      const changeHeader = change.querySelector('h3.change');
      if (changeHeader) {
        const headerText = changeHeader.textContent;
        const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
        if (timeMatch) {
          date = timeMatch[1];
        }
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
    const changeItems = change.querySelectorAll('ul.changes li.trac-field-keywords');
    changeItems.forEach(item => {
      // Parse the full text to understand the structure
      const fullText = item.textContent.replace(/^Keywords\s+/, '').trim();

      // Split by semicolon to get separate actions
      const actions = fullText.split(';').map(s => s.trim());

      // Get all <em> tags to extract keyword names
      const allKeywordTags = Array.from(item.querySelectorAll('em'));
      const keywordNames = allKeywordTags.map(tag => tag.textContent.trim());

      // Get comment metadata (same for all keywords in this change)
      const commentId = change.id;
      const commentLink = commentId ? `#${commentId}` : null;

      const changeHeader = change.querySelector('h3.change');
      let timeText = 'unknown';
      if (changeHeader) {
        const headerText = changeHeader.textContent;
        const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
        if (timeMatch) {
          timeText = timeMatch[1];
        }
      }

      const authorElement = change.querySelector('.trac-author');
      let author = 'unknown';
      if (authorElement) {
        const usernameSpan = authorElement.querySelector('.username');
        if (usernameSpan) {
          author = usernameSpan.textContent.trim();
        } else {
          const cleanAuthor = authorElement.cloneNode(true);
          const badges = cleanAuthor.querySelectorAll('.wpt-role-badge, .wpt-github-badge');
          badges.forEach(badge => badge.remove());
          const fullText = cleanAuthor.textContent.trim();
          author = fullText.replace(/\s*(Core Committer|Lead Developer|Emeritus Committer|Component Maintainer|Lead Tester|Themes Committer|Project Lead|Individual Contributor).*$/, '');
        }
      }

      // Process each action segment
      actions.forEach(actionText => {
        const isAdded = actionText.includes('added');
        const isRemoved = actionText.includes('removed');

        if (!isAdded && !isRemoved) return;

        // Find all keywords mentioned in this action segment
        keywordNames.forEach(keyword => {
          if (actionText.includes(keyword)) {
            const action = isAdded ? 'added' : 'removed';
            if (action === 'added') {
              history[keyword.toLowerCase()] = {
                date: timeText,
                commentLink,
                author,
                action: 'added'
              };
            }
          }
        });
      });
    });
  });

  return history;
}

// Helper: Find patches uploaded by a specific author
function findPatchesByAuthor(author) {
  const attachments = document.querySelectorAll('#attachments .attachment');
  const patches = [];

  attachments.forEach(attachment => {
    const authorElement = attachment.querySelector('.trac-author');
    if (authorElement && authorElement.textContent.trim() === author) {
      // Check if it's a patch file (.patch or .diff)
      const filenameElement = attachment.querySelector('.trac-file');
      if (filenameElement) {
        const filename = filenameElement.textContent.trim();
        if (filename.match(/\.(patch|diff)$/i)) {
          patches.push({
            filename: filename,
            element: attachment
          });
        }
      }
    }
  });

  return patches;
}

// Helper: Analyze keyword validation issues using configurable rules
function analyzeKeywordValidation() {
  if (typeof VALIDATION_RULES === 'undefined') {
    return [];
  }

  const keywordHistory = extractKeywordHistory();
  const validationIssues = [];

  // Get current keywords from the ticket
  const keywordsElement = document.querySelector('#ticket td[headers="h_keywords"]');
  const currentKeywordText = keywordsElement ? keywordsElement.textContent.trim() : '';
  const currentKeywords = currentKeywordText ? currentKeywordText.split(/\s+/).filter(k => k.length > 0) : [];

  // Get contributor data
  const dataElement = document.getElementById('wpt-contributor-data');
  let wpTracContributorLabels = {};
  if (dataElement) {
    try {
      wpTracContributorLabels = JSON.parse(dataElement.getAttribute('data-contributors'));
    } catch (e) {
      // Fallback to empty object
    }
  }

  // Rule 1: Self-applied "needs-testing" by patch author
  const rule1 = VALIDATION_RULES['self-applied-needs-testing'];
  if (rule1 && rule1.enabled) {
    for (const [keyword, change] of Object.entries(keywordHistory)) {
      if (keyword === rule1.keyword && change.action === 'added') {
        const author = change.author;
        const recentPatches = findPatchesByAuthor(author);
        if (recentPatches.length > 0) {
          const authorRole = wpTracContributorLabels[author] || 'Individual Contributor';
          validationIssues.push({
            ruleId: 'self-applied-needs-testing',
            type: rule1.type,
            severity: rule1.severity,
            keyword: keyword,
            author: author,
            authorRole: authorRole,
            message: rule1.message,
            recommendation: rule1.recommendation,
            source: rule1.source
          });
        }
      }
    }
  }

  // Rule 2: Redundant keywords
  const rule2 = VALIDATION_RULES['redundant-keywords'];
  if (rule2 && rule2.enabled) {
    currentKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (rule2.pairs[keywordLower]) {
        const equivalent = rule2.pairs[keywordLower];
        const hasEquivalent = currentKeywords.some(k => k.toLowerCase() === equivalent.toLowerCase());
        if (hasEquivalent) {
          validationIssues.push({
            ruleId: 'redundant-keywords',
            type: rule2.type,
            severity: rule2.severity,
            keyword: keyword,
            equivalent: equivalent,
            message: rule2.message.replace('{keyword}', keyword).replace('{equivalent}', equivalent),
            recommendation: rule2.recommendation.replace('{keyword}', keyword).replace('{equivalent}', equivalent),
            source: rule2.source
          });
        }
      }
    });
  }

  // Rule 3: Authority-restricted keywords (only if enabled)
  const rule3 = VALIDATION_RULES['authority-restricted-keywords'];
  if (rule3 && rule3.enabled && typeof ROLE_HIERARCHY !== 'undefined') {
    for (const [keyword, change] of Object.entries(keywordHistory)) {
      if (rule3.keywords[keyword]) {
        const author = change.author;
        const authorRole = wpTracContributorLabels[author] || 'Individual Contributor';
        const authorRank = ROLE_HIERARCHY[authorRole] || 5;

        const restriction = rule3.keywords[keyword];
        const requiredRank = ROLE_HIERARCHY[restriction.minRole] || 4;

        if (authorRank > requiredRank) {
          validationIssues.push({
            ruleId: 'authority-restricted-keywords',
            type: rule3.type,
            severity: rule3.severity,
            keyword: keyword,
            author: author,
            authorRole: authorRole,
            message: rule3.message
              .replace('{role}', authorRole)
              .replace('{keyword}', keyword)
              .replace('{minRole}', restriction.minRole),
            recommendation: rule3.recommendation.replace('{reason}', restriction.reason),
            source: rule3.source
          });
        }
      }
    }
  }

  return validationIssues;
}

// Helper: Extract keyword change timeline (chronological)
function extractKeywordChangeTimeline() {
  const timeline = [];
  const changes = document.querySelectorAll('.change');

  // Get contributor data
  const dataElement = document.getElementById('wpt-contributor-data');
  let wpTracContributorLabels = {};
  if (dataElement) {
    try {
      wpTracContributorLabels = JSON.parse(dataElement.getAttribute('data-contributors'));
    } catch (e) {
      // Fallback to empty object
    }
  }

  changes.forEach(change => {
    // Find keyword changes in this comment
    const changeItems = change.querySelectorAll('ul.changes li.trac-field-keywords');
    const keywordChanges = { added: [], removed: [] };

    changeItems.forEach(item => {
      // Parse the full text to understand the structure
      // Example: "Keywords changes-requested added; has-patch needs-testing removed"
      const fullText = item.textContent.replace(/^Keywords\s+/, '').trim();

      // Split by semicolon to get separate actions
      const actions = fullText.split(';').map(s => s.trim());

      // Get all <em> tags to extract keyword names
      const allKeywordTags = Array.from(item.querySelectorAll('em'));
      const keywordNames = allKeywordTags.map(tag => tag.textContent.trim());

      actions.forEach(actionText => {
        // Determine if this action is "added" or "removed"
        const isAdded = actionText.includes('added');
        const isRemoved = actionText.includes('removed');

        if (!isAdded && !isRemoved) return;

        // Find all keywords mentioned in this action segment
        keywordNames.forEach(keyword => {
          if (actionText.includes(keyword)) {
            if (isAdded && !keywordChanges.added.includes(keyword)) {
              keywordChanges.added.push(keyword);
            } else if (isRemoved && !keywordChanges.removed.includes(keyword)) {
              keywordChanges.removed.push(keyword);
            }
          }
        });
      });
    });

    // If we found keyword changes, add to timeline
    if (keywordChanges.added.length > 0 || keywordChanges.removed.length > 0) {
      // Extract author - need to get just the username, excluding our badge elements
      const authorElement = change.querySelector('.trac-author');
      let author = 'Unknown';

      if (authorElement) {
        const usernameSpan = authorElement.querySelector('.username');
        if (usernameSpan) {
          author = usernameSpan.textContent.trim();
        } else {
          const cleanAuthor = authorElement.cloneNode(true);
          const badges = cleanAuthor.querySelectorAll('.wpt-role-badge, .wpt-github-badge');
          badges.forEach(badge => badge.remove());
          const fullText = cleanAuthor.textContent.trim();
          author = fullText.replace(/\s*(Core Committer|Lead Developer|Emeritus Committer|Component Maintainer|Lead Tester|Themes Committer|Project Lead|Individual Contributor).*$/, '');
        }
      }

      const authorRole = wpTracContributorLabels[author] || 'Individual Contributor';

      // Extract relative time
      let relativeTime = 'unknown';
      const dateDiv = change.querySelector('.date');
      if (dateDiv) {
        const timelineLink = dateDiv.querySelector('.timeline');
        if (timelineLink) {
          relativeTime = timelineLink.textContent.trim();
        }
      }

      if (relativeTime === 'unknown') {
        const timeSpan = change.querySelector('.trac-time, .time-ago, [title*="ago"]');
        if (timeSpan) {
          relativeTime = timeSpan.textContent.trim();
        }
      }

      if (relativeTime === 'unknown') {
        const changeHeader = change.querySelector('h3.change');
        if (changeHeader) {
          const headerText = changeHeader.textContent;
          const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
          if (timeMatch) {
            relativeTime = timeMatch[1];
          }
        }
      }

      // Extract comment link
      const commentId = change.id;
      const commentLink = commentId ? `#${commentId}` : '';

      timeline.push({
        added: keywordChanges.added,
        removed: keywordChanges.removed,
        author: author,
        authorRole: authorRole,
        relativeTime: relativeTime,
        commentId: commentLink
      });
    }
  });

  return timeline.reverse(); // Oldest first for timeline
}

// Helper: Extract milestone change history
function extractMilestoneHistory() {
  const history = [];
  const changes = document.querySelectorAll('.change');

  // Get contributor data
  const dataElement = document.getElementById('wpt-contributor-data');
  let wpTracContributorLabels = {};
  if (dataElement) {
    try {
      wpTracContributorLabels = JSON.parse(dataElement.getAttribute('data-contributors'));
    } catch (e) {
      // Fallback to empty object
    }
  }

  changes.forEach(change => {
    const milestoneItem = change.querySelector('li.trac-field-milestone');
    if (!milestoneItem) return;

    // Extract milestone values from <em> tags if present, otherwise from text
    const emTags = milestoneItem.querySelectorAll('em');
    let fromMilestone = null;
    let toMilestone = null;

    if (emTags.length === 2) {
      // "changed from X to Y" format
      fromMilestone = emTags[0].textContent.trim();
      toMilestone = emTags[1].textContent.trim();
    } else if (emTags.length === 1) {
      // "set to X" format
      toMilestone = emTags[0].textContent.trim();
    } else {
      // Fallback: parse from text content
      const text = milestoneItem.textContent;
      const fromMatch = text.match(/changed from\s+([^\s]+)\s+to\s+([^\s]+)/);
      const setMatch = text.match(/set to\s+([^\s]+)/);

      if (fromMatch) {
        fromMilestone = fromMatch[1].trim();
        toMilestone = fromMatch[2].trim();
      } else if (setMatch) {
        toMilestone = setMatch[1].trim();
      }
    }

    // Handle empty milestone (when removed from all milestones)
    if (toMilestone === '' || !toMilestone) {
      toMilestone = '(none)';
    }
    if (fromMilestone === '' || !fromMilestone) {
      fromMilestone = null; // Keep null for "set to" format
    }

    // Extract author - need to get just the username, excluding our badge elements
    const header = change.querySelector('h3.change');
    const authorElement = change.querySelector('.trac-author');
    let author = 'Unknown';

    if (authorElement) {
      // Try to get username from the .username span first
      const usernameSpan = authorElement.querySelector('.username');
      if (usernameSpan) {
        author = usernameSpan.textContent.trim();
      } else {
        // Clone the element and remove our badges to get clean text
        const cleanAuthor = authorElement.cloneNode(true);
        // Remove our role badges and GitHub badges
        const badges = cleanAuthor.querySelectorAll('.wpt-role-badge, .wpt-github-badge');
        badges.forEach(badge => badge.remove());

        // Get the clean text and strip any remaining role labels
        const fullText = cleanAuthor.textContent.trim();
        // Remove common role labels that might be in Trac's markup
        author = fullText.replace(/\s*(Core Committer|Lead Developer|Emeritus Committer|Component Maintainer|Lead Tester|Themes Committer|Project Lead|Individual Contributor).*$/, '');
      }
    }

    const authorRole = wpTracContributorLabels[author] || 'Individual Contributor';

    // Extract relative time - check multiple locations
    let relativeTime = 'unknown';

    // Try 1: Look for .date .timeline link (most reliable)
    const dateDiv = change.querySelector('.date');
    if (dateDiv) {
      const timelineLink = dateDiv.querySelector('.timeline');
      if (timelineLink) {
        relativeTime = timelineLink.textContent.trim();
      }
    }

    // Try 2: Look for .trac-time or time-related spans
    if (relativeTime === 'unknown') {
      const timeSpan = change.querySelector('.trac-time, .time-ago, [title*="ago"]');
      if (timeSpan) {
        relativeTime = timeSpan.textContent.trim();
      }
    }

    // Try 3: Parse from header text as fallback
    if (relativeTime === 'unknown' && header) {
      const headerText = header.textContent;
      const timeMatch = headerText.match(/(\d+\s+(?:years?|months?|days?|hours?|minutes?)\s+ago)/);
      if (timeMatch) {
        relativeTime = timeMatch[1];
      }
    }

    // Extract comment link
    const commentLink = header ? header.querySelector('a[href*="#comment"]') : null;
    const commentId = commentLink ? commentLink.getAttribute('href') : '';

    history.push({
      from: fromMilestone,
      to: toMilestone,
      author: author,
      authorRole: authorRole,
      relativeTime: relativeTime,
      commentId: commentId
    });
  });

  return history.reverse(); // Oldest first for timeline
}

// Helper: Get role color
function getRoleColor(role) {
  if (typeof ROLE_COLORS !== 'undefined') {
    return ROLE_COLORS[role] || '#757575';
  }

  // Fallback colors if ROLE_COLORS not loaded
  const colors = {
    'Project Lead': '#e91e63',
    'Lead Developer': '#9c27b0',
    'Core Committer': '#3f51b5',
    'Emeritus Committer': '#ff9800',
    'Component Maintainer': '#009688',
    'Lead Tester': '#e91e63',
    'Themes Committer': '#00bcd4',
    'Individual Contributor': '#757575'
  };
  return colors[role] || '#757575';
}

// Helper: Format milestone as link if it's a WordPress version
function formatMilestoneWithLink(milestone, isFromMilestone = false) {
  if (!milestone || milestone === '(none)') {
    return isFromMilestone
      ? '<em style="color: #999;">none</em>'
      : '<em style="color: #999;">none</em>';
  }

  // Check if milestone matches WordPress version pattern (e.g., "6.9", "7.0", "6.8.1")
  const versionPattern = /^(\d+\.\d+(?:\.\d+)?)$/;
  const match = milestone.match(versionPattern);

  if (match) {
    const version = match[1];
    const url = `https://make.wordpress.org/core/${version}/`;
    const color = isFromMilestone ? '#666' : '#4CAF50';
    return `<a href="${url}" target="_blank" style="color: ${color}; text-decoration: none; font-weight: bold; border-bottom: 1px dotted ${color};" onmouseover="this.style.borderBottom='1px solid ${color}'" onmouseout="this.style.borderBottom='1px dotted ${color}'" title="View WordPress ${version} release details">${milestone}</a>`;
  }

  // Not a version number, return as plain text
  const color = isFromMilestone ? '#666' : '#4CAF50';
  return `<strong style="color: ${color};">${milestone}</strong>`;
}

// Helper: Add authority legend to sidebar
function addAuthorityLegend(roleStats) {
  const sidebar = document.getElementById('wpt-keyword-sidebar');
  if (!sidebar) return;

  // Check if authority-legend is enabled in user preferences
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || {};

    if (!isSectionEnabled('authority-legend', config)) {
      debug('Authority Legend section is disabled, skipping');
      return;
    }

    const sectionOrder = getSectionOrder(config);
    const targetOrder = sectionOrder['authority-legend'] || 4;

    const legendSection = createCollapsibleSection(
      'authority-legend',
      'Authority Hierarchy',
      '👥'
    );

    const legendContent = document.createElement('div');
    legendContent.style.cssText = 'margin-top: 10px; font-size: 12px;';

    // Sort roles by hierarchy
    const sortedRoles = Object.entries(roleStats).sort((a, b) => {
      const rankA = (typeof ROLE_HIERARCHY !== 'undefined' && ROLE_HIERARCHY[a[0]]) || 5;
      const rankB = (typeof ROLE_HIERARCHY !== 'undefined' && ROLE_HIERARCHY[b[0]]) || 5;
      return rankA - rankB;
    });

    sortedRoles.forEach(([role, count]) => {
      const roleDiv = document.createElement('div');
      roleDiv.style.cssText = `
        padding: 6px;
        margin-bottom: 4px;
        background: #fafafa;
        border-left: 3px solid ${getRoleColor(role)};
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      const roleLabel = document.createElement('strong');
      roleLabel.textContent = role;

      const roleCount = document.createElement('span');
      roleCount.style.cssText = 'color: #666; font-size: 11px;';
      roleCount.textContent = `${count} comment${count > 1 ? 's' : ''}`;

      roleDiv.appendChild(roleLabel);
      roleDiv.appendChild(roleCount);
      legendContent.appendChild(roleDiv);
    });

    // Add explanation
    const explanation = document.createElement('div');
    explanation.style.cssText = 'margin-top: 10px; padding: 8px; background: #e3f2fd; font-size: 11px; color: #1976d2; border-radius: 4px;';
    explanation.textContent = '💡 Higher authority = more weight in triage decisions';
    legendContent.appendChild(explanation);

    legendSection.contentWrapper.appendChild(legendContent);

    // Insert at the correct position based on user's order preference
    const content = document.getElementById('wpt-sidebar-content');
    const allSections = Array.from(content.children);

    // Find where to insert based on order
    let insertBefore = null;
    for (const section of allSections) {
      const sectionId = section.id ? section.id.replace('wpt-section-', '') : null;
      if (sectionId && sectionOrder[sectionId] !== undefined) {
        if (sectionOrder[sectionId] > targetOrder) {
          insertBefore = section;
          break;
        }
      }
    }

    if (insertBefore) {
      content.insertBefore(legendSection.container, insertBefore);
    } else {
      content.appendChild(legendSection.container);
    }

    debug('Authority Legend added at order:', targetOrder);
  });
}

// Helper: Check if section is enabled in user preferences
function isSectionEnabled(sectionId, config) {
  if (!config || !config.sidebarSections) {
    return true; // Default to enabled if no config
  }
  const section = config.sidebarSections.find(s => s.id === sectionId);
  return section ? section.enabled : true;
}

// Helper: Get section order from user preferences
function getSectionOrder(config) {
  if (!config || !config.sidebarSections) {
    return {
      'quick-info': 0,
      'release-schedule': 1,
      'recent-comments': 2,
      'milestone-timeline': 3,
      'keyword-history': 4,
      'maintainers': 5,
      'keywords': 6
    };
  }

  const orderMap = {};
  config.sidebarSections.forEach(section => {
    orderMap[section.id] = section.order;
  });
  return orderMap;
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

  // Load user preferences for sidebar sections
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || {};
    const sectionOrder = getSectionOrder(config);

    continueCreatingSidebar(contributorData, config, sectionOrder);
  });
}

// Continue creating sidebar after loading preferences
function continueCreatingSidebar(contributorData, config, sectionOrder) {
  // Get keywords from the ticket
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

  // Get sidebar position from config (default to right)
  const sidebarPosition = config.sidebarPosition || 'right';
  const isLeftSide = sidebarPosition === 'left';

  // Integrated sidebar styling - dynamic based on position
  sidebar.style.cssText = `
    position: fixed;
    top: 80px;
    ${isLeftSide ? 'left: 0;' : 'right: 0;'}
    width: 340px;
    height: calc(100vh - 80px);
    background: white;
    ${isLeftSide ? 'border-right: 1px solid #ddd;' : 'border-left: 1px solid #ddd;'}
    ${isLeftSide ? 'box-shadow: 2px 0 8px rgba(0,0,0,0.1);' : 'box-shadow: -2px 0 8px rgba(0,0,0,0.1);'}
    padding: 16px;
    overflow-y: auto;
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);
  `;

  // Create toggle button
  const sidebarToggleBtn = document.createElement('button');
  sidebarToggleBtn.id = 'wpt-sidebar-toggle';
  sidebarToggleBtn.innerHTML = isLeftSide ? '▶' : '◀';
  sidebarToggleBtn.style.cssText = `
    position: fixed;
    top: 50%;
    ${isLeftSide ? 'left: 0;' : 'right: 0;'}
    transform: translateY(-50%);
    width: 32px;
    height: 80px;
    background: white;
    border: 1px solid #ddd;
    ${isLeftSide ? 'border-left: none;' : 'border-right: none;'}
    ${isLeftSide ? 'border-radius: 0 8px 8px 0;' : 'border-radius: 8px 0 0 8px;'}
    ${isLeftSide ? 'box-shadow: 2px 0 8px rgba(0,0,0,0.1);' : 'box-shadow: -2px 0 8px rgba(0,0,0,0.1);'}
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #666;
    z-index: 1001;
    transition: background 0.2s;
  `;
  sidebarToggleBtn.onmouseover = () => sidebarToggleBtn.style.background = '#f0f0f0';
  sidebarToggleBtn.onmouseout = () => sidebarToggleBtn.style.background = 'white';

  // Adjust main content
  const mainContent = document.querySelector('#main') || document.querySelector('#content') || document.querySelector('body');

  // Toggle visibility function
  function toggleSidebarVisibility(show) {
    if (show) {
      sidebar.style.transform = 'translateX(0)';
      sidebarToggleBtn.style.display = 'none';
      if (mainContent) {
        if (isLeftSide) {
          mainContent.style.marginLeft = '340px';
          mainContent.style.transition = 'margin-left 0.3s ease-in-out';
        } else {
          mainContent.style.marginRight = '340px';
          mainContent.style.transition = 'margin-right 0.3s ease-in-out';
        }
      }
    } else {
      sidebar.style.transform = isLeftSide ? 'translateX(-100%)' : 'translateX(100%)';
      sidebarToggleBtn.style.display = 'flex';
      if (mainContent) {
        if (isLeftSide) {
          mainContent.style.marginLeft = '0';
          mainContent.style.transition = 'margin-left 0.3s ease-in-out';
        } else {
          mainContent.style.marginRight = '0';
          mainContent.style.transition = 'margin-right 0.3s ease-in-out';
        }
      }
    }
    localStorage.setItem('wpt-sidebar-visible', show ? 'true' : 'false');
  }

  // Check saved visibility state
  const savedVisible = localStorage.getItem('wpt-sidebar-visible');
  const isVisible = savedVisible !== 'false';

  if (mainContent) {
    if (isLeftSide) {
      mainContent.style.marginLeft = isVisible ? '340px' : '0';
    } else {
      mainContent.style.marginRight = isVisible ? '340px' : '0';
    }
  }

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
  headerTitle.textContent = '🔍 WP Trac Triager';
  headerTitle.style.cssText = `
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '▶';
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
  toggleBtn.onmouseover = () => toggleBtn.style.background = '#f0f0f0';
  toggleBtn.onmouseout = () => toggleBtn.style.background = 'none';

  header.appendChild(headerTitle);
  header.appendChild(toggleBtn);
  sidebar.appendChild(header);

  // Toggle events
  toggleBtn.addEventListener('click', () => toggleSidebarVisibility(false));
  sidebarToggleBtn.addEventListener('click', () => toggleSidebarVisibility(true));

  // Content wrapper
  const content = document.createElement('div');
  content.id = 'wpt-sidebar-content';
  content.style.cssText = 'display: block;';

  // Create sticky header container for closed banner and Quick Info
  const stickyHeader = document.createElement('div');
  stickyHeader.id = 'wpt-sticky-header';
  stickyHeader.style.cssText = `
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
    padding-bottom: 8px;
    margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  // Check if ticket is closed and add prominent warning banner
  const statusElement = document.querySelector('.trac-status a');
  const ticketStatus = statusElement ? statusElement.textContent.trim().toLowerCase() : '';

  if (ticketStatus === 'closed') {
    // Extract close reason from the ticket header (e.g., "closed defect (bug) (worksforme)")
    const ticketHeader = document.querySelector('#ticket h2.summary');
    let closeReason = '';
    if (ticketHeader) {
      const headerText = ticketHeader.textContent;
      // Extract text in parentheses after "closed"
      const reasonMatch = headerText.match(/closed\s+[^(]*\(([^)]+)\)/);
      if (reasonMatch) {
        closeReason = reasonMatch[1];
      }
    }

    const closedBanner = document.createElement('div');
    closedBanner.id = 'wpt-closed-banner';
    closedBanner.style.cssText = `
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      border: 2px solid #991b1b;
    `;

    const icon = document.createElement('div');
    icon.style.cssText = `
      font-size: 32px;
      text-align: center;
      margin-bottom: 8px;
    `;
    icon.textContent = '🔒';

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    title.textContent = 'TICKET CLOSED';

    const message = document.createElement('div');
    message.style.cssText = `
      font-size: 13px;
      text-align: center;
      opacity: 0.95;
      line-height: 1.5;
    `;

    if (closeReason) {
      message.innerHTML = `This ticket was closed as:<br><strong style="font-size: 14px;">${closeReason}</strong>`;
    } else {
      message.textContent = 'This ticket is no longer active';
    }

    const note = document.createElement('div');
    note.style.cssText = `
      font-size: 11px;
      text-align: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      opacity: 0.9;
    `;
    note.textContent = 'No further triage needed';

    closedBanner.appendChild(icon);
    closedBanner.appendChild(title);
    closedBanner.appendChild(message);
    closedBanner.appendChild(note);

    stickyHeader.appendChild(closedBanner);
    debug('Added closed ticket banner to sticky header');
  }

  // Collect all sections with their order
  const sectionsToRender = [];

  // Build each section and add to array
  debug('Building sidebar sections...');

  // Section 1: Quick Info (always enabled, locked) - goes in sticky header
  let quickInfoSection = null;
  if (isSectionEnabled('quick-info', config)) {
    const ticketSummary = getTicketSummary();
    quickInfoSection = createCollapsibleSection('quick-info', `${ticketSummary.id} Quick Info`, '', true);

    // Quick Info is NOT sticky itself - it's part of the sticky header
    quickInfoSection.container.style.cssText = `
      background: white;
      margin-bottom: 0;
    `;

    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = `
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;

    // Add "View Description" link
    const viewDescLink = document.createElement('a');
    viewDescLink.href = '#ticket';
    viewDescLink.textContent = '↑ View Full Description';
    viewDescLink.style.cssText = `
      display: block;
      font-size: 12px;
      color: #2271b1;
      text-decoration: none;
      font-weight: 600;
      margin-bottom: 12px;
      padding: 8px;
      background: #e7f3ff;
      border-radius: 4px;
      text-align: center;
      transition: background 0.2s;
    `;
    viewDescLink.onmouseover = () => {
      viewDescLink.style.background = '#d0e7ff';
      viewDescLink.style.textDecoration = 'underline';
    };
    viewDescLink.onmouseout = () => {
      viewDescLink.style.background = '#e7f3ff';
      viewDescLink.style.textDecoration = 'none';
    };
    summaryBox.appendChild(viewDescLink);

    // Summary items
    const summaryItems = [
      { label: 'Status', value: ticketSummary.status || 'Unknown', url: ticketSummary.statusUrl, required: true },
      { label: 'Type', value: ticketSummary.type || 'Unknown', url: ticketSummary.typeUrl, required: true },
      { label: 'Reporter', value: ticketSummary.reporter || 'Unknown', url: ticketSummary.reporterUrl, required: true },
      { label: 'Owner', value: ticketSummary.owner || 'Unowned', url: ticketSummary.ownerUrl },
      { label: 'Opened', value: ticketSummary.opened },
      { label: 'Modified', value: ticketSummary.lastModified },
      { label: 'Milestone', value: ticketSummary.milestone, url: ticketSummary.milestoneUrl },
      { label: 'Priority', value: ticketSummary.priority },
      { label: 'Severity', value: ticketSummary.severity },
      { label: 'Component', value: ticketSummary.component, url: ticketSummary.componentUrl },
      { label: 'Keywords', value: ticketSummary.keywords || 'None', isKeywords: true }
    ];

    summaryItems.forEach(item => {
      if (item.required || item.value) {
        // Special handling for closed status - make it prominent
        const isClosed = item.label === 'Status' && item.value && item.value.toLowerCase() === 'closed';

        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
          font-size: 11px;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
          ${item.isKeywords ? 'align-items: flex-start;' : ''}
          ${isClosed ? 'background: #fee2e2; padding: 6px; border-radius: 4px; border-left: 3px solid #dc2626;' : ''}
        `;

        const labelSpan = document.createElement('span');
        labelSpan.style.cssText = `
          color: ${isClosed ? '#991b1b' : '#6c757d'};
          font-weight: ${isClosed ? 'bold' : '500'};
          ${item.isKeywords ? 'padding-top: 1px;' : ''}
        `;
        labelSpan.textContent = item.label + ':';

        const valueContainer = document.createElement('span');
        const wrapStyle = item.isKeywords
          ? 'word-break: break-word;'
          : 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

        valueContainer.style.cssText = `
          color: ${isClosed ? '#dc2626' : '#212529'};
          font-weight: ${isClosed ? 'bold' : '600'};
          text-align: right;
          max-width: 60%;
          ${wrapStyle}
          ${isClosed ? 'text-transform: uppercase;' : ''}
        `;

        // Handle keywords as individual links
        if (item.isKeywords && item.value !== 'None') {
          const keywordsList = item.value.split(/\s+/).filter(k => k.length > 0);
          keywordsList.forEach((keyword, idx) => {
            const keywordLink = document.createElement('a');
            keywordLink.href = `https://core.trac.wordpress.org/query?keywords=~${keyword}`;
            keywordLink.textContent = keyword;
            keywordLink.target = '_blank';
            keywordLink.style.cssText = `
              color: #2271b1;
              text-decoration: none;
              font-weight: 600;
            `;
            keywordLink.onmouseover = () => keywordLink.style.textDecoration = 'underline';
            keywordLink.onmouseout = () => keywordLink.style.textDecoration = 'none';

            valueContainer.appendChild(keywordLink);
            if (idx < keywordsList.length - 1) {
              valueContainer.appendChild(document.createTextNode(' '));
            }
          });
        }
        // Handle linked values
        else if (item.url) {
          const link = document.createElement('a');
          link.href = item.url;
          link.textContent = item.value;
          link.target = '_blank';
          link.style.cssText = `
            color: #2271b1;
            text-decoration: none;
            font-weight: 600;
          `;
          link.onmouseover = () => link.style.textDecoration = 'underline';
          link.onmouseout = () => link.style.textDecoration = 'none';
          valueContainer.appendChild(link);
        }
        // Plain text values
        else {
          valueContainer.textContent = item.value;
          if (!item.isKeywords) {
            valueContainer.title = item.value;
          }
        }

        itemDiv.appendChild(labelSpan);
        itemDiv.appendChild(valueContainer);
        summaryBox.appendChild(itemDiv);
      }
    });

    quickInfoSection.contentWrapper.appendChild(summaryBox);

    // Add Quick Info to sticky header instead of sectionsToRender
    stickyHeader.appendChild(quickInfoSection.container);
    debug('Added Quick Info to sticky header');
  }

  // Append sticky header to content (it contains closed banner and Quick Info)
  content.appendChild(stickyHeader);

  // Section 2: Release Schedule
  if (isSectionEnabled('release-schedule', config)) {
    const targetVersion = config.targetWpVersion || '7.0';
    if (typeof WP_RELEASE_SCHEDULES !== 'undefined' && WP_RELEASE_SCHEDULES[targetVersion]) {
      const schedule = WP_RELEASE_SCHEDULES[targetVersion];
      const nextMilestone = getNextMilestone(targetVersion);

      const releaseSection = createCollapsibleSection('release-schedule', `WordPress ${targetVersion} Release`, '📅', true);

      const releaseBox = document.createElement('div');
      releaseBox.style.cssText = `
        padding: 12px;
        background: #f0f4ff;
        border-left: 3px solid #4f46e5;
        border-radius: 4px;
      `;

      // Final release date
      const finalReleaseDiv = document.createElement('div');
      finalReleaseDiv.style.cssText = `
        font-size: 12px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #d0d7ff;
      `;

      const finalLabel = document.createElement('div');
      finalLabel.style.cssText = `
        color: #6b7280;
        font-weight: 500;
        margin-bottom: 4px;
      `;
      finalLabel.textContent = 'Stable Release:';

      const finalValue = document.createElement('div');
      finalValue.style.cssText = `
        color: #4f46e5;
        font-weight: 700;
        font-size: 13px;
      `;
      finalValue.textContent = formatDate(schedule.finalRelease);

      finalReleaseDiv.appendChild(finalLabel);
      finalReleaseDiv.appendChild(finalValue);
      releaseBox.appendChild(finalReleaseDiv);

      // Next milestone
      if (nextMilestone) {
        const days = daysUntil(nextMilestone.date);

        const nextMilestoneDiv = document.createElement('div');
        nextMilestoneDiv.style.cssText = `
          font-size: 12px;
        `;

        const nextLabel = document.createElement('div');
        nextLabel.style.cssText = `
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 4px;
        `;
        nextLabel.textContent = 'Next Release:';

        const nextValue = document.createElement('div');
        nextValue.style.cssText = `
          color: #1f2937;
          font-weight: 600;
          font-size: 13px;
        `;

        let daysText;
        if (days === 0) {
          daysText = 'Today';
        } else if (days === 1) {
          daysText = 'Tomorrow';
        } else if (days < 0) {
          daysText = `${Math.abs(days)} days ago`;
        } else {
          daysText = `in ${days} days`;
        }

        nextValue.innerHTML = `<strong>${nextMilestone.name}</strong> — ${formatDate(nextMilestone.date)} <span style="color: #6b7280; font-weight: 500;">(${daysText})</span>`;

        nextMilestoneDiv.appendChild(nextLabel);
        nextMilestoneDiv.appendChild(nextValue);
        releaseBox.appendChild(nextMilestoneDiv);
      } else {
        // All milestones passed
        const completedDiv = document.createElement('div');
        completedDiv.style.cssText = `
          font-size: 12px;
          color: #059669;
          font-weight: 600;
        `;
        completedDiv.textContent = '✓ All milestones completed';
        releaseBox.appendChild(completedDiv);
      }

      // Add links
      const linksDiv = document.createElement('div');
      linksDiv.style.cssText = `
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid #d0d7ff;
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      `;

      const releasePageLink = document.createElement('a');
      releasePageLink.href = schedule.releasePageUrl;
      releasePageLink.target = '_blank';
      releasePageLink.textContent = '📋 Release Roadmap';
      releasePageLink.style.cssText = `
        color: #4f46e5;
        text-decoration: none;
        font-weight: 500;
      `;
      releasePageLink.onmouseover = () => releasePageLink.style.textDecoration = 'underline';
      releasePageLink.onmouseout = () => releasePageLink.style.textDecoration = 'none';

      const releaseSquadLink = document.createElement('a');
      releaseSquadLink.href = schedule.releaseSquadUrl;
      releaseSquadLink.target = '_blank';
      releaseSquadLink.textContent = '👥 Release Squad';
      releaseSquadLink.style.cssText = `
        color: #4f46e5;
        text-decoration: none;
        font-weight: 500;
      `;
      releaseSquadLink.onmouseover = () => releaseSquadLink.style.textDecoration = 'underline';
      releaseSquadLink.onmouseout = () => releaseSquadLink.style.textDecoration = 'none';

      linksDiv.appendChild(releasePageLink);
      linksDiv.appendChild(releaseSquadLink);
      releaseBox.appendChild(linksDiv);

      releaseSection.contentWrapper.appendChild(releaseBox);
      sectionsToRender.push({
        id: 'release-schedule',
        element: releaseSection.container,
        order: sectionOrder['release-schedule'] || 1
      });
    }
  }

  // Section 3: Recent Comments
  if (isSectionEnabled('recent-comments', config)) {
    const recentComments = getRecentComments(3, contributorData);
    debug('Recent comments found:', recentComments.length);
    if (recentComments.length > 0) {
      const commentsSection = createCollapsibleSection('recent-comments', 'Recent Comments', '💬', true);

      const recentCommentsBox = document.createElement('div');
      recentCommentsBox.style.cssText = `
        padding: 12px;
        background: #f0f6fc;
        border-left: 3px solid #0969da;
        border-radius: 4px;
      `;

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

      commentsSection.contentWrapper.appendChild(recentCommentsBox);
      sectionsToRender.push({
        id: 'recent-comments',
        element: commentsSection.container,
        order: sectionOrder['recent-comments'] || 2
      });
      debug('Recent comments section added to array');
    }
  }

  // Section 4: Milestone Timeline
  if (isSectionEnabled('milestone-timeline', config)) {
    const milestoneHistory = extractMilestoneHistory();
    debug('Milestone history extracted:', milestoneHistory.length, 'changes');
    if (milestoneHistory.length > 0) {
      const timelineSection = createCollapsibleSection('milestone-timeline', 'Milestone History', '📊', true);

      const timelineContent = document.createElement('div');
      timelineContent.style.cssText = 'margin-top: 10px; position: relative; padding: 10px 0;';

      const timelineLine = document.createElement('div');
      timelineLine.style.cssText = `
        position: absolute;
        left: 10px;
        top: 15px;
        bottom: 15px;
        width: 2px;
        background: #ddd;
      `;
      timelineContent.appendChild(timelineLine);

      milestoneHistory.forEach((change, index) => {
        const changeDiv = document.createElement('div');
        changeDiv.style.cssText = `
          padding-left: 30px;
          margin-bottom: 15px;
          position: relative;
        `;

        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          left: 5px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${index === milestoneHistory.length - 1 ? '#4CAF50' : '#2196F3'};
          border: 2px solid white;
          box-shadow: 0 0 0 1px #ddd;
        `;
        changeDiv.appendChild(dot);

        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
          background: #fafafa;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        `;

        let milestoneText = '';
        if (change.from) {
          // "from X to Y" format - use helper to create links for version numbers
          const fromDisplay = formatMilestoneWithLink(change.from, true);
          const toDisplay = formatMilestoneWithLink(change.to, false);
          milestoneText = `${fromDisplay} → ${toDisplay}`;
        } else {
          // "Set to X" format
          if (change.to === '(none)') {
            milestoneText = `<span style="color: #999;">Milestone removed</span>`;
          } else {
            const toDisplay = formatMilestoneWithLink(change.to, false);
            milestoneText = `Set to ${toDisplay}`;
          }
        }

        contentBox.innerHTML = `
          <div style="margin-bottom: 4px;">${milestoneText}</div>
          <div style="color: #666; font-size: 11px;">
            by <strong>${change.author}</strong> (${change.authorRole})
            <span style="color: #999;"> • ${change.relativeTime}</span>
          </div>
          ${change.commentId ? `<a href="${change.commentId}" style="font-size: 10px; color: #2196F3; text-decoration: none;">View comment →</a>` : ''}
        `;

        changeDiv.appendChild(contentBox);
        timelineContent.appendChild(changeDiv);
      });

      if (milestoneHistory.length >= 2) {
        const warningBox = document.createElement('div');
        warningBox.style.cssText = `
          margin-top: 10px;
          padding: 8px;
          background: #fff3e0;
          border-left: 3px solid #ff9800;
          font-size: 11px;
          color: #e65100;
          border-radius: 4px;
        `;
        const puntCount = milestoneHistory.length;
        warningBox.innerHTML = `
          <strong>⚠️ Punted ${puntCount} time${puntCount > 1 ? 's' : ''}</strong><br>
          Consider if this ticket needs more work before next milestone.
        `;
        timelineContent.appendChild(warningBox);
      }

      timelineSection.contentWrapper.appendChild(timelineContent);
      sectionsToRender.push({
        id: 'milestone-timeline',
        element: timelineSection.container,
        order: sectionOrder['milestone-timeline'] || 3
      });
      debug('Milestone history timeline added to array');
    }
  }

  // Section 4.5: Keyword Change History Timeline
  if (isSectionEnabled('keyword-history', config)) {
    const keywordTimeline = extractKeywordChangeTimeline();
    debug('Keyword change timeline extracted:', keywordTimeline.length, 'changes');
    if (keywordTimeline.length > 0) {
      const keywordTimelineSection = createCollapsibleSection('keyword-history', 'Keyword Change History', '🔄', true);

      const timelineContent = document.createElement('div');
      timelineContent.style.cssText = 'margin-top: 10px; position: relative; padding: 10px 0;';

      const timelineLine = document.createElement('div');
      timelineLine.style.cssText = `
        position: absolute;
        left: 10px;
        top: 15px;
        bottom: 15px;
        width: 2px;
        background: #ddd;
      `;
      timelineContent.appendChild(timelineLine);

      keywordTimeline.forEach((change, index) => {
        const changeDiv = document.createElement('div');
        changeDiv.style.cssText = `
          padding-left: 30px;
          margin-bottom: 15px;
          position: relative;
        `;

        // Determine dot color based on action type
        let dotColor = '#2196F3'; // Default blue
        if (change.added.length > 0 && change.removed.length === 0) {
          dotColor = '#4CAF50'; // Green for additions only
        } else if (change.added.length === 0 && change.removed.length > 0) {
          dotColor = '#f44336'; // Red for removals only
        } else if (change.added.length > 0 && change.removed.length > 0) {
          dotColor = '#FF9800'; // Orange for mixed
        }

        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          left: 5px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${dotColor};
          border: 2px solid white;
          box-shadow: 0 0 0 1px #ddd;
        `;
        changeDiv.appendChild(dot);

        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
          background: #fafafa;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        `;

        // Build keyword changes HTML with tooltips
        let changesHtml = '<div style="margin-bottom: 4px;">';

        if (change.added.length > 0) {
          const addedKeywords = change.added.map(kw => {
            const keywordData = KEYWORD_DATA[kw.toLowerCase()];
            const tooltip = keywordData
              ? `${keywordData.description}\n\nUsage: ${keywordData.usage}`
              : 'No description available';
            return `<span style="background: #e8f5e9; color: #2e7d32; padding: 2px 6px; border-radius: 3px; font-weight: 600; margin-right: 4px; cursor: help;" title="${tooltip.replace(/"/g, '&quot;')}">+ ${kw}</span>`;
          }).join('');
          changesHtml += addedKeywords;
        }

        if (change.removed.length > 0) {
          const removedKeywords = change.removed.map(kw => {
            const keywordData = KEYWORD_DATA[kw.toLowerCase()];
            const tooltip = keywordData
              ? `${keywordData.description}\n\nUsage: ${keywordData.usage}`
              : 'No description available';
            return `<span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 3px; font-weight: 600; margin-right: 4px; cursor: help;" title="${tooltip.replace(/"/g, '&quot;')}">- ${kw}</span>`;
          }).join('');
          changesHtml += removedKeywords;
        }

        changesHtml += '</div>';

        contentBox.innerHTML = `
          ${changesHtml}
          <div style="color: #666; font-size: 11px;">
            by <strong>${change.author}</strong> <span style="color: ${getRoleColor(change.authorRole)};">(${change.authorRole})</span>
            <span style="color: #999;"> • ${change.relativeTime}</span>
          </div>
          ${change.commentId ? `<a href="${change.commentId}" style="font-size: 10px; color: #2196F3; text-decoration: none;">View comment →</a>` : ''}
        `;

        changeDiv.appendChild(contentBox);
        timelineContent.appendChild(changeDiv);
      });

      keywordTimelineSection.contentWrapper.appendChild(timelineContent);
      sectionsToRender.push({
        id: 'keyword-history',
        element: keywordTimelineSection.container,
        order: sectionOrder['keyword-history'] || 3.5
      });
      debug('Keyword change history timeline added to array');
    }
  }

  // Section 5: Component Maintainers
  if (isSectionEnabled('maintainers', config)) {
    const maintainerInfo = getComponentMaintainerInfo();
    debug('Maintainer info:', maintainerInfo ? maintainerInfo.component : 'none');
    if (maintainerInfo) {
      const maintainerSection = createCollapsibleSection('maintainers', 'Component Maintainers', '🔧', true);

      const maintainerBox = document.createElement('div');
      maintainerBox.style.cssText = `
        padding: 12px;
        background: #fff8e6;
        border-left: 3px solid #f59e0b;
        border-radius: 4px;
      `;

      const contextDesc = document.createElement('div');
      contextDesc.style.cssText = `
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.5;
      `;
      contextDesc.innerHTML = `This issue is categorized as part of the <strong>${maintainerInfo.component}</strong> component, which is maintained by:`;
      maintainerBox.appendChild(contextDesc);

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

      maintainerSection.contentWrapper.appendChild(maintainerBox);
      sectionsToRender.push({
        id: 'maintainers',
        element: maintainerSection.container,
        order: sectionOrder['maintainers'] || 5
      });
      debug('Maintainer section added to array');
    }
  }

  // Section 6: Keyword Validation - DISABLED (provides suggestions, not pure visibility)
  // This feature has been disabled to maintain focus on information visibility only
  // Code preserved for future reference if validation UI is redesigned
  /*
  if (isSectionEnabled('keyword-validation', config)) {
    const validationIssues = analyzeKeywordValidation();
    debug('Keyword validation issues found:', validationIssues.length);
    if (validationIssues.length > 0) {
      const validationSection = createCollapsibleSection('keyword-validation', 'Keyword Validation', '⚠️', true);

      const validationContent = document.createElement('div');
      validationContent.style.cssText = 'margin-top: 10px;';

      validationIssues.forEach(issue => {
        const issueDiv = document.createElement('div');
        const severityColor = {
          'high': '#f44336',
          'medium': '#ff9800',
          'low': '#2196F3'
        }[issue.severity];

        issueDiv.style.cssText = `
          padding: 10px;
          margin-bottom: 8px;
          border-left: 4px solid ${severityColor};
          background: #fafafa;
          font-size: 12px;
          border-radius: 4px;
        `;

        const severityLabel = {
          'high': '🔴 HIGH PRIORITY',
          'medium': '🟠 MEDIUM',
          'low': '🔵 LOW'
        }[issue.severity];

        let sourceDisplay = '';
        if (issue.source && typeof VALIDATION_RULE_SOURCES !== 'undefined') {
          const sourceConfig = VALIDATION_RULE_SOURCES[issue.source.type] || VALIDATION_RULE_SOURCES['best-practice'];
          const sourceIcon = sourceConfig.icon;
          const sourceColor = sourceConfig.color;

          sourceDisplay = `
            <div style="font-size: 10px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 4px;">
                <span style="color: ${sourceColor};">${sourceIcon} <strong>${sourceConfig.label}</strong></span>
              </div>
              <div style="color: #888; font-style: italic;">${issue.source.note || issue.source.title}</div>
              ${issue.source.url ? `<a href="${issue.source.url}" target="_blank" style="color: #2271b1; text-decoration: none; font-weight: 500;">📖 View documentation →</a>` : ''}
            </div>
          `;
        }

        issueDiv.innerHTML = `
          <div style="font-weight: bold; color: ${severityColor}; margin-bottom: 6px;">${severityLabel}</div>
          <div style="color: #333; margin-bottom: 6px;">${issue.message}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
            Added by: <strong>${issue.author}</strong> (${issue.authorRole})
          </div>
          ${issue.recommendation ? `<div style="font-size: 11px; color: #555; font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e0e0e0;">💡 ${issue.recommendation}</div>` : ''}
          ${sourceDisplay}
        `;

        validationContent.appendChild(issueDiv);
      });

      validationSection.contentWrapper.appendChild(validationContent);
      sectionsToRender.push({
        id: 'keyword-validation',
        element: validationSection.container,
        order: sectionOrder['keyword-validation'] || 6
      });
      debug('Keyword validation panel added to array');
    }
  }
  */

  // Section 7: Keywords
  if (isSectionEnabled('keywords', config)) {
    const keywordsSection = createCollapsibleSection('keywords', 'TRAC Keywords', '🏷️', true);

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

    keywordsSection.contentWrapper.appendChild(keywordsContext);

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
      keywordsSection.contentWrapper.appendChild(noKeywordsMsg);
    }

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const keywordData = KEYWORD_DATA[keywordLower];
      const keywordHistory = extractKeywordHistory();

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

        keywordsSection.contentWrapper.appendChild(item);
      }
    });

    sectionsToRender.push({
      id: 'keywords',
      element: keywordsSection.container,
      order: sectionOrder['keywords'] || 7
    });
  }

  // Sort sections by order and append to content
  sectionsToRender
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      content.appendChild(section.element);
    });

  // Append content to sidebar
  sidebar.appendChild(content);

  // Append sidebar and toggle button to body
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
