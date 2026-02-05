// WP Trac Triager - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Check if on Trac page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const statusElement = document.getElementById('status');

    if (currentTab.url.includes('trac.wordpress.org/ticket/')) {
      statusElement.textContent = '✓ Extension is active on this page';
      statusElement.classList.remove('inactive');
    } else {
      statusElement.textContent = '⚠ Visit a Trac ticket to use this extension';
      statusElement.classList.add('inactive');
    }
  });

  // Open settings
  document.getElementById('openSettings').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // Open example ticket
  document.getElementById('openExample').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://core.trac.wordpress.org/ticket/8905'
    });
  });

  // Open documentation
  document.getElementById('openDocs').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://make.wordpress.org/core/handbook/contribute/trac/keywords/'
    });
  });
});
