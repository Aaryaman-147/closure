const ALLOWED_DOMAINS = ['github.com', 'leetcode.com', 'youtube.com'];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only trigger when the page has fully loaded and has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');

      // FR-12: Domain permissions check
      if (ALLOWED_DOMAINS.includes(domain)) {
        
        fetch('http://localhost:3000/api/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: tab.title,
            url: tab.url,
            domain: domain
          })
        }).catch(err => console.error('Closure API not reachable:', err));
        
      }
    } catch (e) {
      console.error("Invalid URL processing:", e);
    }
  }
});