/**
 * Sidebar Manager Module
 * Handles creation and management of the keyword sidebar
 */

import { DOMHelpers } from './dom-helpers.js';
import { SELECTORS, STORAGE_KEYS } from './config.js';
import { KeywordHistory } from './keyword-history.js';
import { MaintainerInfo } from './maintainer-info.js';
import { RecentComments } from './recent-comments.js';

export class SidebarManager {
  constructor(contributorData = {}) {
    this.contributorData = contributorData;
    this.sidebar = null;
    this.isDragging = false;
  }

  /**
   * Create and display the sidebar
   */
  create() {
    try {
      if (typeof KEYWORD_DATA === 'undefined') {
        return false;
      }

      const keywordsElement = DOMHelpers.querySelector(SELECTORS.keywordsField);
      if (!keywordsElement) return false;

      const keywordText = keywordsElement.textContent.trim();
      if (!keywordText) return false;

      const keywords = keywordText.split(/\s+/).filter(k => k.length > 0);
      const keywordHistory = KeywordHistory.extract();

      this.buildSidebar(keywords, keywordHistory);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build the sidebar UI
   */
  buildSidebar(keywords, keywordHistory) {
    this.sidebar = this.createSidebarContainer();
    const header = this.createHeader();
    const content = this.createContent(keywords, keywordHistory);

    this.sidebar.appendChild(header);
    this.sidebar.appendChild(content);

    document.body.appendChild(this.sidebar);
  }

  /**
   * Create sidebar container
   */
  createSidebarContainer() {
    const savedPosition = localStorage.getItem(STORAGE_KEYS.sidebarPosition);
    let position = { right: '20px', top: '100px', left: 'auto', bottom: 'auto' };

    if (savedPosition) {
      try {
        position = JSON.parse(savedPosition);
      } catch (e) {
        // Use default position
      }
    }

    return DOMHelpers.createElement('div', { id: 'wpt-keyword-sidebar' }, {
      position: 'fixed',
      right: position.right,
      top: position.top,
      left: position.left,
      bottom: position.bottom,
      width: '300px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '16px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: '9999'
    });
  }

  /**
   * Create sidebar header
   */
  createHeader() {
    const header = DOMHelpers.createElement('div', {}, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      cursor: 'grab',
      userSelect: 'none'
    });

    const title = DOMHelpers.createElement('h3', {
      textContent: '🔍 WP Trac Triager'
    }, {
      margin: '0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333'
    });

    const toggleBtn = this.createToggleButton();

    header.appendChild(title);
    header.appendChild(toggleBtn);

    this.setupDragging(header);

    return header;
  }

  /**
   * Create toggle button
   */
  createToggleButton() {
    const toggleBtn = DOMHelpers.createElement('button', {
      textContent: '−'
    }, {
      background: 'none',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      fontSize: '18px',
      lineHeight: '1',
      color: '#666',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    toggleBtn.onmouseover = () => toggleBtn.style.background = '#f0f0f0';
    toggleBtn.onmouseout = () => toggleBtn.style.background = 'none';
    toggleBtn.addEventListener('mousedown', (e) => e.stopPropagation());

    const savedCollapsed = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true';
    if (savedCollapsed) {
      toggleBtn.textContent = '+';
    }

    return toggleBtn;
  }

  /**
   * Create sidebar content
   */
  createContent(keywords, keywordHistory) {
    const content = DOMHelpers.createElement('div', { id: 'wpt-sidebar-content' }, {
      display: 'block'
    });

    const savedCollapsed = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true';
    if (savedCollapsed) {
      content.style.display = 'none';
    }

    // Add recent comments
    const recentComments = new RecentComments(this.contributorData).get(3);
    if (recentComments.length > 0) {
      content.appendChild(this.createRecentCommentsSection(recentComments));
    }

    // Add maintainer info
    const maintainerInfo = new MaintainerInfo().getInfo();
    if (maintainerInfo) {
      content.appendChild(this.createMaintainerSection(maintainerInfo));
    }

    // Add keywords header
    content.appendChild(this.createKeywordsHeader());

    // Add keyword items
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const keywordData = KEYWORD_DATA[keywordLower];

      if (keywordData) {
        content.appendChild(this.createKeywordItem(keyword, keywordData, keywordHistory[keywordLower]));
      }
    });

    return content;
  }

  /**
   * Create recent comments section
   */
  createRecentCommentsSection(comments) {
    const box = DOMHelpers.createElement('div', {}, {
      marginBottom: '16px',
      padding: '12px',
      background: '#f0f6fc',
      borderLeft: '3px solid #0969da',
      borderRadius: '4px'
    });

    const label = DOMHelpers.createElement('div', {
      textContent: '💬 Recent Comments'
    }, {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    });

    box.appendChild(label);

    comments.forEach((comment, index) => {
      const item = this.createCommentItem(comment, index < comments.length - 1);
      box.appendChild(item);
    });

    return box;
  }

  /**
   * Create a single comment item
   */
  createCommentItem(comment, showBorder) {
    const item = DOMHelpers.createElement('div', {}, {
      padding: '6px 0',
      borderBottom: showBorder ? '1px solid #d0d7de' : 'none'
    });

    const link = DOMHelpers.createLink(comment.link, `#${comment.number}`, {
      style: `font-weight: bold; color: ${comment.roleColor || '#0969da'}; text-decoration: none; font-size: 13px;`
    });
    link.onmouseover = () => link.style.textDecoration = 'underline';
    link.onmouseout = () => link.style.textDecoration = 'none';

    const meta = DOMHelpers.createElement('div', {}, {
      fontSize: '11px',
      color: '#666',
      marginTop: '2px'
    });

    DOMHelpers.setTextContent(meta, `${comment.date} by `);

    const authorLink = DOMHelpers.createLink(
      `https://profiles.wordpress.org/${comment.author}/`,
      comment.author,
      { style: 'color: #0969da; text-decoration: none;' }
    );
    authorLink.onmouseover = () => authorLink.style.textDecoration = 'underline';
    authorLink.onmouseout = () => authorLink.style.textDecoration = 'none';

    meta.appendChild(authorLink);

    if (comment.role) {
      const roleSpan = DOMHelpers.createElement('span', {
        textContent: ` (${comment.role})`
      });
      meta.appendChild(roleSpan);
    }

    item.appendChild(link);
    item.appendChild(meta);

    return item;
  }

  /**
   * Create maintainer section
   */
  createMaintainerSection(maintainerInfo) {
    const box = DOMHelpers.createElement('div', {}, {
      marginBottom: '16px',
      padding: '12px',
      background: '#fff8e6',
      borderLeft: '3px solid #f59e0b',
      borderRadius: '4px'
    });

    const label = DOMHelpers.createElement('div', {
      textContent: '🔧 Component Maintainers'
    }, {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    });

    box.appendChild(label);

    const desc = DOMHelpers.createElement('div', {
      innerHTML: `This issue is categorized as part of the <strong>${maintainerInfo.component}</strong> component, which is maintained by:`
    }, {
      fontSize: '12px',
      color: '#666',
      marginBottom: '12px',
      lineHeight: '1.5'
    });

    box.appendChild(desc);

    maintainerInfo.maintainers.forEach((maintainer, index) => {
      const item = this.createMaintainerItem(maintainer, index < maintainerInfo.maintainers.length - 1);
      box.appendChild(item);
    });

    return box;
  }

  /**
   * Create a single maintainer item
   */
  createMaintainerItem(maintainer, showBorder) {
    const item = DOMHelpers.createElement('div', {}, {
      padding: '6px 0',
      borderBottom: showBorder ? '1px solid #fde68a' : 'none'
    });

    const link = DOMHelpers.createLink(
      maintainer.profileUrl,
      maintainer.displayName,
      { style: 'font-weight: bold; color: #d97706; text-decoration: none; font-size: 13px;' }
    );
    link.onmouseover = () => link.style.textDecoration = 'underline';
    link.onmouseout = () => link.style.textDecoration = 'none';

    item.appendChild(link);

    if (maintainer.role) {
      const role = DOMHelpers.createElement('span', {
        textContent: ` (${maintainer.role})`
      }, {
        fontSize: '11px',
        color: '#666',
        marginLeft: '6px'
      });
      item.appendChild(role);
    }

    if (maintainer.lastComment) {
      const lastComment = DOMHelpers.createElement('div', {
        innerHTML: `Last commented <a href="${maintainer.lastComment.link}" style="color: #d97706; text-decoration: none;">${maintainer.lastComment.date}</a>`
      }, {
        fontSize: '11px',
        color: '#666',
        marginTop: '2px'
      });
      item.appendChild(lastComment);
    }

    return item;
  }

  /**
   * Create keywords header
   */
  createKeywordsHeader() {
    const header = DOMHelpers.createElement('div', {}, {
      marginBottom: '12px'
    });

    const title = DOMHelpers.createElement('div', {
      textContent: '🏷️ TRAC Keywords'
    }, {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    });

    const context = DOMHelpers.createElement('div', {
      textContent: 'According to the keywords, the current state of this issue is:'
    }, {
      fontSize: '12px',
      color: '#666',
      marginBottom: '12px',
      lineHeight: '1.5'
    });

    header.appendChild(title);
    header.appendChild(context);

    return header;
  }

  /**
   * Create a single keyword item
   */
  createKeywordItem(keyword, keywordData, history) {
    const item = DOMHelpers.createElement('div', {}, {
      marginBottom: '16px',
      padding: '12px',
      background: '#f9f9f9',
      borderLeft: `3px solid ${keywordData.color}`,
      borderRadius: '4px'
    });

    const label = DOMHelpers.createElement('div', {
      textContent: keywordData.label
    }, {
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '4px'
    });

    const description = DOMHelpers.createElement('div', {
      textContent: keywordData.description
    }, {
      fontSize: '13px',
      color: '#666',
      marginBottom: '4px'
    });

    const usage = DOMHelpers.createElement('div', {
      textContent: 'Usage: ' + keywordData.usage
    }, {
      fontSize: '12px',
      color: '#888',
      fontStyle: 'italic'
    });

    item.appendChild(label);
    item.appendChild(description);
    item.appendChild(usage);

    // Add keyword history if available
    if (history) {
      const historyDiv = this.createKeywordHistory(history);
      item.appendChild(historyDiv);
    }

    return item;
  }

  /**
   * Create keyword history element
   */
  createKeywordHistory(history) {
    const historyDiv = DOMHelpers.createElement('div', {}, {
      fontSize: '11px',
      color: '#555',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: '1px solid #ddd'
    });

    DOMHelpers.setTextContent(historyDiv, `Added ${history.date} by `);

    const authorLink = DOMHelpers.createLink(
      `https://profiles.wordpress.org/${history.author}/`,
      history.author,
      { style: 'color: #2271b1; text-decoration: none;' }
    );
    authorLink.onmouseover = () => authorLink.style.textDecoration = 'underline';
    authorLink.onmouseout = () => authorLink.style.textDecoration = 'none';

    historyDiv.appendChild(authorLink);

    if (history.commentLink) {
      const commentLink = DOMHelpers.createLink(
        history.commentLink,
        ' → View comment',
        { style: 'color: #2271b1; text-decoration: none; margin-left: 4px;' }
      );
      commentLink.onmouseover = () => commentLink.style.textDecoration = 'underline';
      commentLink.onmouseout = () => commentLink.style.textDecoration = 'none';
      historyDiv.appendChild(commentLink);
    }

    return historyDiv;
  }

  /**
   * Setup dragging functionality
   */
  setupDragging(header) {
    let initialX, initialY, currentX, currentY;

    header.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      header.style.cursor = 'grabbing';

      initialX = e.clientX;
      initialY = e.clientY;

      const rect = this.sidebar.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      e.preventDefault();

      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      this.sidebar.style.left = newX + 'px';
      this.sidebar.style.top = newY + 'px';
      this.sidebar.style.right = 'auto';
      this.sidebar.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        header.style.cursor = 'grab';

        const position = {
          left: this.sidebar.style.left,
          top: this.sidebar.style.top,
          right: 'auto',
          bottom: 'auto'
        };
        localStorage.setItem(STORAGE_KEYS.sidebarPosition, JSON.stringify(position));
      }
    });

    // Setup toggle button
    const toggleBtn = header.querySelector('button');
    const content = DOMHelpers.querySelector('#wpt-sidebar-content');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCollapsed = content.style.display === 'none';

      if (isCollapsed) {
        content.style.display = 'block';
        toggleBtn.textContent = '−';
      } else {
        content.style.display = 'none';
        toggleBtn.textContent = '+';
      }

      localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, !isCollapsed);
    });
  }
}
