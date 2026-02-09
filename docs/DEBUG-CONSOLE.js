// Debug commands to paste in browser console
// Run these ONE AT A TIME on the Trac ticket page

// 1. Check if keywords exist
console.log('=== KEYWORDS ===');
const keywordsEl = document.querySelector('#ticket td.keywords');
console.log('Keywords element:', keywordsEl);
console.log('Keywords text:', keywordsEl?.textContent);

// 2. Check if sidebar was created
console.log('\n=== SIDEBAR ===');
const sidebar = document.getElementById('wpt-keyword-sidebar');
console.log('Sidebar exists:', sidebar !== null);
console.log('Sidebar element:', sidebar);

// 3. Check comments
console.log('\n=== COMMENTS ===');
const comments = document.querySelectorAll('.change, #ticket');
console.log('Total comments found:', comments.length);

comments.forEach((comment, i) => {
  const author = comment.querySelector('.author, .trac-author-user');
  if (author) {
    console.log(`Comment ${i}:`, author.textContent);
  }
});

// 4. Check for highlighted comments
console.log('\n=== HIGHLIGHTED COMMENTS ===');
const highlighted = document.querySelectorAll('.wpt-highlighted');
console.log('Highlighted comments:', highlighted.length);
highlighted.forEach((el, i) => {
  console.log(`  ${i}:`, el.className);
});

// 5. Check if data files loaded
console.log('\n=== DATA FILES ===');
console.log('KEYWORD_DATA exists:', typeof KEYWORD_DATA !== 'undefined');
console.log('COMPONENT_MAINTAINERS exists:', typeof COMPONENT_MAINTAINERS !== 'undefined');
console.log('CORE_COMMITTERS exists:', typeof CORE_COMMITTERS !== 'undefined');

// 6. Check configuration
console.log('\n=== STORAGE CONFIG ===');
chrome.storage.sync.get(['config'], function(result) {
  console.log('Saved config:', result.config);
});
