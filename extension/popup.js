document.addEventListener('DOMContentLoaded', async () => {
  const urlDisplay = document.getElementById('url');
  const personaSelect = document.getElementById('persona');
  const auditBtn = document.getElementById('auditBtn');
  const statusDiv = document.getElementById('status');
  const errorDiv = document.getElementById('error');

  let activeTab = null;

  // 1. Get active tab information
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
    
    if (tab && tab.url) {
      urlDisplay.textContent = tab.url;
      
      // Check if the URL is valid for capturing (e.g. not chrome:// or browser internal pages)
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:') || tab.url.startsWith('edge://')) {
        auditBtn.disabled = true;
        urlDisplay.textContent = "Cannot audit browser internal pages.";
      }
    } else {
      auditBtn.disabled = true;
      urlDisplay.textContent = "No active tab detected.";
    }
  } catch (err) {
    urlDisplay.textContent = "Error loading tab URL.";
    console.error(err);
  }

  // 2. Handle audit click
  auditBtn.addEventListener('click', async () => {
    if (!activeTab || !activeTab.url) return;
    
    statusDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    auditBtn.disabled = true;
    statusDiv.textContent = 'Step 1/3: Capturing page screenshot...';

    try {
      // Capture the visible tab screenshot as base64 URL
      const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      
      statusDiv.textContent = 'Step 2/3: Fetching page text & analyzing...';
      
      const response = await fetch('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: activeTab.url,
          persona: personaSelect.value,
          screenshot: screenshot
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze page.');
      }

      statusDiv.textContent = 'Step 3/3: Opening scorecard report...';
      const data = await response.json();

      // Open the audit report in a new tab
      await chrome.tabs.create({ url: `http://localhost:3000/r/${data.id}` });
      window.close(); // Close the popup
    } catch (err) {
      statusDiv.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message || 'An unexpected error occurred.';
      auditBtn.disabled = false;
    }
  });
});
