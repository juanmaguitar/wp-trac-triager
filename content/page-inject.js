// This script runs in the PAGE context (not content script context)
// It can access wpTracContributorLabels and passes data to the content script

(function() {
  console.log('📄 Page inject script running...');

  // Wait for wpTracContributorLabels to be available
  function waitAndExtract() {
    if (typeof wpTracContributorLabels !== 'undefined') {
      console.log('✅ Found wpTracContributorLabels in page context!');

      // Send data to content script via custom DOM attribute
      const dataElement = document.createElement('div');
      dataElement.id = 'wpt-contributor-data';
      dataElement.setAttribute('data-contributors', JSON.stringify(wpTracContributorLabels));
      dataElement.style.display = 'none';
      document.documentElement.appendChild(dataElement);

      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('wpt-data-ready'));
      console.log('📤 Contributor data sent to content script');
    } else {
      console.log('⏳ wpTracContributorLabels not ready, retrying...');
      setTimeout(waitAndExtract, 100);
    }
  }

  waitAndExtract();
})();
