# Phase 1A Implementation Plan
## WP Trac Triager Enhancement Features

**Created:** 2026-02-06
**Status:** Ready for Implementation
**Target Version:** 1.3.0

---

## Overview

Phase 1A adds three critical triage features based on WordPress Test Team training insights:

1. **Keyword Validation Panel** - Detect suspicious keyword patterns and authority mismatches
2. **Enhanced Authority/Role Badges** - Visual hierarchy for all commenters with GitHub PR detection
3. **Milestone History Timeline** - Track ticket punt progression and milestone changes

All features are confirmed implementable with data available in Trac ticket HTML.

---

## Feature 1: Keyword Validation Panel

### Purpose
Flag suspicious keyword application patterns that indicate inadequate triage. Training shows that 80% of patches are inadequate when "needs-testing" is self-applied by the patch author.

### HTML Data Sources
```html
<!-- Keyword changes in ticket history -->
<div class="change">
  <ul class="changes">
    <li class="trac-field-keywords">
      <strong>Keywords</strong> <em>needs-testing</em> added
    </li>
  </ul>
</div>

<!-- User roles available globally -->
<script>
  var wpTracContributorLabels = {
    "username": "Core Committer",
    "another-user": "Component Maintainer"
  }
</script>
```

### Implementation Details

**New Data File: `data/keyword-equivalencies.js`**
```javascript
// Keyword Equivalencies
// Based on WordPress Test Team Training (2026-02-03)
var KEYWORD_EQUIVALENCIES = {
  '2nd-opinion': 'needs-review',
  'needs-test-info': 'reporter-feedback'
};
```

**New Data File: `data/role-hierarchy.js`**
```javascript
// Authority Hierarchy
// Project Lead > Lead Developer > Core Committer > Component Maintainer > Regular User
var ROLE_HIERARCHY = {
  'Project Lead': 1,
  'Lead Developer': 2,
  'Core Committer': 3,
  'Component Maintainer': 4,
  'Regular User': 5  // Default for users not in wpTracContributorLabels
};
```

**New Function: `analyzeKeywordValidation()`**
Location: `content/trac-sidebar.js` (after existing `extractKeywordHistory()` function)

```javascript
function analyzeKeywordValidation() {
  const keywordHistory = extractKeywordHistory(); // Reuse existing function
  const validationIssues = [];

  for (const [keyword, changes] of Object.entries(keywordHistory)) {
    changes.forEach(change => {
      const author = change.author;
      const authorRole = wpTracContributorLabels[author] || 'Regular User';
      const authorRank = ROLE_HIERARCHY[authorRole] || 5;

      // Check 1: Self-applied "needs-testing"
      if (keyword === 'needs-testing' && change.action === 'added') {
        // Check if author has a recent patch attachment
        const recentPatches = findPatchesByAuthor(author);
        if (recentPatches.length > 0) {
          validationIssues.push({
            type: 'self-applied-needs-testing',
            severity: 'high',
            keyword: keyword,
            author: author,
            authorRole: authorRole,
            message: `${author} added "needs-testing" after uploading patch (80% inadequate per training)`
          });
        }
      }

      // Check 2: Redundant keywords
      if (KEYWORD_EQUIVALENCIES[keyword]) {
        const equivalent = KEYWORD_EQUIVALENCIES[keyword];
        if (keywordHistory[equivalent]) {
          validationIssues.push({
            type: 'redundant-keyword',
            severity: 'medium',
            keyword: keyword,
            equivalent: equivalent,
            author: author,
            message: `"${keyword}" is redundant with existing "${equivalent}"`
          });
        }
      }

      // Check 3: Authority mismatch (low-rank user adding dev-feedback)
      if (keyword === 'dev-feedback' && authorRank >= 4) {
        validationIssues.push({
          type: 'authority-mismatch',
          severity: 'low',
          keyword: keyword,
          author: author,
          authorRole: authorRole,
          message: `Regular user added "dev-feedback" - should be added by core team`
        });
      }
    });
  }

  return validationIssues;
}

function findPatchesByAuthor(author) {
  // Parse attachment list for patches by this author
  const attachments = document.querySelectorAll('#attachments .attachment');
  const patches = [];

  attachments.forEach(attachment => {
    const title = attachment.querySelector('.trac-author');
    if (title && title.textContent.includes(author) &&
        attachment.textContent.match(/\.(patch|diff)$/)) {
      patches.push(attachment);
    }
  });

  return patches;
}
```

**UI Component: Keyword Validation Section**
Add to `createKeywordSidebar()` function before the Keywords section:

```javascript
// Add Keyword Validation Panel (if issues found)
const validationIssues = analyzeKeywordValidation();
if (validationIssues.length > 0) {
  const validationSection = createCollapsibleSection(
    'keyword-validation',
    'Keyword Validation',
    '', // Will be populated below
    true // Expanded by default
  );

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
      padding: 8px;
      margin-bottom: 8px;
      border-left: 3px solid ${severityColor};
      background: #fafafa;
      font-size: 12px;
    `;

    issueDiv.innerHTML = `
      <strong style="color: ${severityColor};">${issue.type.toUpperCase()}</strong><br>
      <span style="color: #666;">${issue.message}</span><br>
      <small>Added by: <strong>${issue.author}</strong> (${issue.authorRole})</small>
    `;

    validationContent.appendChild(issueDiv);
  });

  validationSection.querySelector('.wpt-section-content').appendChild(validationContent);
  sidebar.appendChild(validationSection);
}
```

### Expected Behavior
- Panel only appears when validation issues are detected
- High severity (red): Self-applied "needs-testing" by patch authors
- Medium severity (orange): Redundant keyword pairs
- Low severity (blue): Authority mismatches

---

## Feature 2: Enhanced Authority/Role Badges

### Purpose
Provide instant visual feedback about commenter authority levels and detect GitHub-synced comments. Training emphasizes that authority hierarchy matters for triage decisions.

### HTML Data Sources
```html
<!-- Regular Trac comment -->
<div class="change">
  <h3 class="change">
    <a href="/ticket/12345#comment:3">comment:3</a> by username
  </h3>
</div>

<!-- GitHub-synced comment -->
<div class="change">
  <h3 class="change chat-bot prbot with-context">
    <a href="/ticket/12345#comment:5">comment:5</a> Changed by bot
  </h3>
</div>

<!-- User roles -->
<script>
  var wpTracContributorLabels = {
    "username": "Core Committer"
  }
</script>
```

### Implementation Details

**Modify Existing: `highlightContributors()` function**
Location: `content/trac-sidebar.js` (lines 48-128)

Current function already badges contributors. Enhancements needed:

1. Badge ALL commenters (not just those with roles)
2. Detect GitHub-synced comments
3. Add authority hierarchy legend

```javascript
function highlightContributors() {
  const changes = document.querySelectorAll('.change');
  const roleStats = {};

  changes.forEach(change => {
    const header = change.querySelector('h3.change');
    if (!header) return;

    // Check if GitHub-synced comment
    const isGitHubSynced = header.classList.contains('chat-bot') ||
                           header.classList.contains('prbot');

    // Extract username
    const byMatch = header.textContent.match(/by\s+(\S+)/);
    if (!byMatch) return;

    const username = byMatch[1];
    const role = wpTracContributorLabels[username] || 'Regular User';

    // Count role appearances
    roleStats[role] = (roleStats[role] || 0) + 1;

    // Create badge
    const badge = document.createElement('span');
    const roleColor = {
      'Project Lead': '#e91e63',
      'Lead Developer': '#9c27b0',
      'Core Committer': '#3f51b5',
      'Component Maintainer': '#009688',
      'Regular User': '#757575'
    }[role] || '#757575';

    badge.style.cssText = `
      background: ${roleColor};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      margin-left: 8px;
      text-transform: uppercase;
    `;
    badge.textContent = role;

    // Add GitHub sync indicator
    if (isGitHubSynced) {
      const syncBadge = document.createElement('span');
      syncBadge.style.cssText = `
        background: #24292e;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-left: 4px;
      `;
      syncBadge.innerHTML = '🔗 GitHub PR';
      header.appendChild(syncBadge);
    }

    header.appendChild(badge);
  });

  // Add authority legend to sidebar (if sidebar exists)
  if (roleStats && Object.keys(roleStats).length > 0) {
    addAuthorityLegend(roleStats);
  }
}

function addAuthorityLegend(roleStats) {
  const sidebar = document.getElementById('wpt-sidebar');
  if (!sidebar) return;

  const legendSection = createCollapsibleSection(
    'authority-legend',
    'Authority Hierarchy',
    '', // Will be populated below
    false // Collapsed by default
  );

  const legendContent = document.createElement('div');
  legendContent.style.cssText = 'margin-top: 10px; font-size: 12px;';

  const sortedRoles = Object.entries(roleStats).sort((a, b) => {
    return (ROLE_HIERARCHY[a[0]] || 5) - (ROLE_HIERARCHY[b[0]] || 5);
  });

  sortedRoles.forEach(([role, count]) => {
    const roleDiv = document.createElement('div');
    roleDiv.style.cssText = `
      padding: 6px;
      margin-bottom: 4px;
      background: #fafafa;
      border-left: 3px solid ${getRoleColor(role)};
    `;
    roleDiv.innerHTML = `
      <strong>${role}</strong> <span style="color: #666;">(${count} comment${count > 1 ? 's' : ''})</span>
    `;
    legendContent.appendChild(roleDiv);
  });

  // Add explanation
  const explanation = document.createElement('div');
  explanation.style.cssText = 'margin-top: 10px; padding: 8px; background: #e3f2fd; font-size: 11px; color: #1976d2;';
  explanation.textContent = 'Higher authority = more weight in triage decisions';
  legendContent.appendChild(explanation);

  legendSection.querySelector('.wpt-section-content').appendChild(legendContent);
  sidebar.appendChild(legendSection);
}

function getRoleColor(role) {
  const colors = {
    'Project Lead': '#e91e63',
    'Lead Developer': '#9c27b0',
    'Core Committer': '#3f51b5',
    'Component Maintainer': '#009688',
    'Regular User': '#757575'
  };
  return colors[role] || '#757575';
}
```

### Expected Behavior
- All comments show role badges (including "Regular User" for non-core contributors)
- GitHub-synced comments show "🔗 GitHub PR" badge
- Collapsible authority legend shows role distribution with color coding
- Legend sorted by authority rank (Project Lead first, Regular User last)

---

## Feature 3: Milestone History Timeline

### Purpose
Show ticket punt progression to help triagers understand if a ticket is stuck or making progress. Training emphasizes that milestone context is critical for triage decisions.

### HTML Data Sources
```html
<!-- Milestone change in history -->
<div class="change">
  <ul class="changes">
    <li class="trac-field-milestone">
      <strong>Milestone</strong> changed from <em>6.9</em> to <em>7.0</em>
    </li>
  </ul>
  <div class="comment">
    <p class="date">
      <span class="time-ago">3 months ago</span> (2025-11-05 12:34:56)
    </p>
  </div>
</div>
```

### Implementation Details

**New Function: `extractMilestoneHistory()`**
Location: `content/trac-sidebar.js` (after `extractKeywordHistory()` function)

```javascript
function extractMilestoneHistory() {
  const history = [];
  const changes = document.querySelectorAll('.change');

  changes.forEach(change => {
    const milestoneItem = change.querySelector('li.trac-field-milestone');
    if (!milestoneItem) return;

    const text = milestoneItem.textContent;
    const fromMatch = text.match(/changed from\s+(.+?)\s+to\s+(.+?)$/);
    const setMatch = text.match(/set to\s+(.+?)$/);

    let fromMilestone = null;
    let toMilestone = null;

    if (fromMatch) {
      fromMilestone = fromMatch[1].trim();
      toMilestone = fromMatch[2].trim();
    } else if (setMatch) {
      toMilestone = setMatch[1].trim();
    }

    // Extract author
    const header = change.querySelector('h3.change');
    const authorMatch = header ? header.textContent.match(/by\s+(\S+)/) : null;
    const author = authorMatch ? authorMatch[1] : 'Unknown';
    const authorRole = wpTracContributorLabels[author] || 'Regular User';

    // Extract relative time
    const timeAgo = change.querySelector('.time-ago');
    const relativeTime = timeAgo ? timeAgo.textContent.trim() : '';

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
```

**UI Component: Milestone Timeline Section**
Add to `createKeywordSidebar()` function:

```javascript
// Add Milestone History Timeline
const milestoneHistory = extractMilestoneHistory();
if (milestoneHistory.length > 0) {
  const timelineSection = createCollapsibleSection(
    'milestone-timeline',
    'Milestone History',
    '', // Will be populated below
    true // Expanded by default
  );

  const timelineContent = document.createElement('div');
  timelineContent.style.cssText = 'margin-top: 10px; position: relative;';

  // Vertical timeline line
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

    // Timeline dot
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

    // Change content
    const content = document.createElement('div');
    content.style.cssText = `
      background: #fafafa;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
    `;

    let milestoneText = '';
    if (change.from) {
      milestoneText = `<strong>${change.from}</strong> → <strong style="color: #4CAF50;">${change.to}</strong>`;
    } else {
      milestoneText = `Set to <strong style="color: #4CAF50;">${change.to}</strong>`;
    }

    content.innerHTML = `
      <div style="margin-bottom: 4px;">${milestoneText}</div>
      <div style="color: #666; font-size: 11px;">
        by <strong>${change.author}</strong> (${change.authorRole})
        <span style="color: #999;"> • ${change.relativeTime}</span>
      </div>
      ${change.commentId ? `<a href="${change.commentId}" style="font-size: 10px; color: #2196F3;">View comment →</a>` : ''}
    `;

    changeDiv.appendChild(content);
    timelineContent.appendChild(changeDiv);
  });

  // Summary at bottom
  if (milestoneHistory.length >= 2) {
    const summary = document.createElement('div');
    summary.style.cssText = `
      margin-top: 10px;
      padding: 8px;
      background: #fff3e0;
      border-left: 3px solid #ff9800;
      font-size: 11px;
      color: #e65100;
    `;
    const puntCount = milestoneHistory.length;
    summary.innerHTML = `
      <strong>⚠️ Punted ${puntCount} time${puntCount > 1 ? 's' : ''}</strong><br>
      Consider if this ticket needs more work before next milestone.
    `;
    timelineContent.appendChild(summary);
  }

  timelineSection.querySelector('.wpt-section-content').appendChild(timelineContent);
  sidebar.appendChild(timelineSection);
}
```

### Expected Behavior
- Vertical timeline showing milestone progression (oldest to newest)
- Each change shows: from/to milestone, author with role, relative time
- Current milestone highlighted in green
- Warning message if ticket has been punted 2+ times
- Links to view comments where milestone was changed

### Limitation
**⚠️ Time Display**: Only relative time available (e.g., "3 months ago"). Exact day counts not possible without additional data sources. This matches Trac's native time display format.

---

## Manifest Updates

Update `manifest.json` to include new data files:

```json
{
  "version": "1.3.0",
  "content_scripts": [
    {
      "js": [
        "data/keyword-data.js",
        "data/maintainers-data.js",
        "data/release-schedule.js",
        "data/keyword-equivalencies.js",  // NEW
        "data/role-hierarchy.js",         // NEW
        "content/trac-sidebar.js"
      ]
    }
  ]
}
```

---

## Implementation Order

### Step 1: Create Data Files
1. `data/keyword-equivalencies.js`
2. `data/role-hierarchy.js`

### Step 2: Add Utility Functions
1. `analyzeKeywordValidation()` - validates keywords against patterns
2. `findPatchesByAuthor()` - helper to detect self-applied keywords
3. `extractMilestoneHistory()` - parses milestone changes from DOM
4. `getRoleColor()` - helper for consistent role color coding
5. `addAuthorityLegend()` - creates collapsible authority reference

### Step 3: Modify Existing Functions
1. Update `highlightContributors()` to badge all users and detect GitHub sync
2. Update `createKeywordSidebar()` to add three new sections:
   - Keyword Validation Panel (before keywords)
   - Milestone History Timeline (after recent comments)
   - Authority Legend (via modified `highlightContributors()`)

### Step 4: Update Manifest
1. Bump version to 1.3.0
2. Add new data files to content_scripts.js array

### Step 5: Testing Checklist
- [ ] Test keyword validation with self-applied "needs-testing"
- [ ] Test redundant keyword detection (2nd-opinion + needs-review)
- [ ] Test authority badges on all comment types
- [ ] Test GitHub sync detection on PR-synced comments
- [ ] Test milestone timeline with multiple punts
- [ ] Test milestone timeline with initial milestone set
- [ ] Test collapsible sections persist state
- [ ] Test on tickets without keywords (v1.0.1 bug regression test)
- [ ] Test on tickets without milestone changes
- [ ] Test on tickets with regular users (no wpTracContributorLabels entry)

---

## Dependencies

### Reused Functions
- `extractKeywordHistory()` - Already exists at lines 447-501
- `createCollapsibleSection()` - Already exists (added in v1.2.0)
- `highlightContributors()` - Exists at lines 48-128, needs modification

### Global Variables Required
- `wpTracContributorLabels` - Available on all Trac ticket pages
- `KEYWORD_DATA` - Already loaded from `data/keyword-data.js`
- `KEYWORD_EQUIVALENCIES` - New, from `data/keyword-equivalencies.js`
- `ROLE_HIERARCHY` - New, from `data/role-hierarchy.js`

---

## Trade-offs and Limitations

### Limitation 1: Relative Time Only
- **Issue**: Trac only exposes relative time ("3 months ago"), not exact timestamps
- **Impact**: Cannot show "Days in current milestone" or exact day counts
- **Mitigation**: Use relative time display, consistent with Trac's native UI

### Limitation 2: Patch Author Detection
- **Issue**: Attachments don't have structured metadata linking to comments
- **Impact**: May miss some self-applied "needs-testing" patterns if attachment author format varies
- **Mitigation**: Use best-effort parsing of attachment list; false negatives acceptable

### Limitation 3: GitHub Sync Detection
- **Issue**: Relies on CSS classes (`chat-bot`, `prbot`) which could change
- **Impact**: May fail to detect GitHub-synced comments if Trac updates their markup
- **Mitigation**: Graceful degradation - feature simply won't show badge if classes missing

---

## Future Enhancements (Not in Phase 1A)

### Phase 1B Candidates
- **Workflow State Indicator**: Visual progress bar (needs-patch → has-patch → needs-testing → commit)
- **Component Maintainer Notification**: Flag if component maintainer hasn't responded in X days
- **Smart Keyword Suggestions**: Recommend missing keywords based on ticket state

### Phase 2 Candidates
- **Ticket Age Heatmap**: Color-code tickets by age in current milestone
- **Historical Success Rate**: Show % of tickets that get fixed vs punted by component
- **Bulk Triage Mode**: Keyboard shortcuts for rapid ticket triage

---

## Success Metrics

After implementing Phase 1A, the extension should:
1. ✅ Reduce keyword misuse by flagging self-applied patterns
2. ✅ Improve authority recognition through visual badges and legend
3. ✅ Provide milestone context for better triage decisions
4. ✅ Maintain backward compatibility with v1.2.0 features
5. ✅ Not break on tickets without keywords (v1.0.1 regression test)

---

## Training References

These features were derived from WordPress Test Team training materials:
- **2026-02-03**: Ticket Triaging and Keywords
  - "80% of patches are inadequate when 'needs-testing' is self-applied"
  - Keyword equivalencies documented (2nd-opinion = needs-review)

- **2026-01-29**: Testing and Handbook Coordination
  - Authority hierarchy matters for triage decisions
  - Component maintainer input carries more weight

- **2026-01-27**: Core Testing Challenges
  - Milestone punt patterns indicate stuck tickets
  - Context about why tickets are punted is critical

---

## Next Steps

1. **Review this plan** with the team/user
2. **Create new data files** (`keyword-equivalencies.js`, `role-hierarchy.js`)
3. **Implement functions** in the order specified above
4. **Update manifest.json** to v1.3.0
5. **Test thoroughly** using the checklist
6. **Update MEMORY.md** with implementation lessons learned
7. **Prepare Chrome Web Store update** with changelog

---

**End of Phase 1A Implementation Plan**
