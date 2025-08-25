/**
 * ChatGPT Prompt Booster Extension
 * 
 * This extension optimizes prompts before sending them to ChatGPT.
 * Hotkey: Cmd/Ctrl + Shift + \ (backslash)
 */

// Utility: find the ChatGPT textarea & send button reliably
function getPromptElements() {
  // Try multiple selectors for ChatGPT's textarea, prioritizing visible ones
  const textareaSelectors = [
    'textarea[data-testid="chat-input"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Chat"]',
    'textarea[placeholder*="chat"]',
    'textarea:not([style*="display: none"]):not([style*="display:none"])',
    'textarea[style*="display: block"]',
    'textarea[style*="display:flex"]',
    'textarea[style*="display: grid"]',
    'textarea'
  ];
  
  let ta = null;
  for (const selector of textareaSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const style = window.getComputedStyle(element);
        if (style.display !== 'none' && style.visibility !== 'hidden' && element.offsetWidth > 0) {
          console.log(`Found visible textarea with selector: ${selector}`, element);
          ta = element;
          break;
        }
      }
      if (ta) break;
    } catch (e) {
      console.log(`Selector failed: ${selector}`, e);
    }
  }
  
  if (!ta) {
    console.log("No visible textarea found, trying contenteditable...");
    // Fallback to contenteditable elements
    const contenteditable = document.querySelector('[contenteditable="true"]:not([style*="display: none"])');
    if (contenteditable) {
      console.log("Found contenteditable element:", contenteditable);
      ta = contenteditable;
    }
  }
  
  // Send button: has aria-label or a button next to textarea
  const sendBtn = document.querySelector('button[data-testid="send-button"]') ||
                  document.querySelector('button[aria-label="Send message"]') ||
                  document.querySelector('button[aria-label*="Send"]') ||
                  document.querySelector('form button[type="submit"]');
  
  console.log("Found elements:", { textarea: ta, sendButton: sendBtn });
  return { ta, sendBtn };
}

// React-safe value setter + input event
function setTextareaValue(ta, text) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (setter) {
    setter.call(ta, text);
  } else {
    ta.value = text;
  }
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

// Reload extension context if needed
function reloadExtensionContext() {
  console.log("Attempting to reload extension context...");
  try {
    // Try to send a test message to check if context is valid
    chrome.runtime.sendMessage({ type: "PING" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Extension context is invalid, suggesting page reload...");
        if (confirm("Extension context error detected. Would you like to reload the page to fix this?")) {
          window.location.reload();
        }
      }
    });
  } catch (error) {
    console.error("Failed to check extension context:", error);
  }
}

// Check if backend is available
async function checkBackendConnection() {
  try {
    const response = await fetch('http://localhost:8000/healthz', {
      method: 'GET',
      mode: 'no-cors' // This will work even with CORS issues
    });
    return true;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
}

// Show backend status
async function showBackendStatus() {
  const status = await checkBackendConnection();
  if (status) {
    console.log('✅ Backend service is available');
  } else {
    console.log('❌ Backend service is not available. Please start the server with: uvicorn app.main:app --reload --port 8000');
  }
  return status;
}

// Optimize prompt using the backend API
async function optimizePrompt(raw) {
  try {
    // First check if backend is available
    const backendAvailable = await checkBackendConnection();
    if (!backendAvailable) {
      throw new Error('Backend service not available. Please ensure the server is running on localhost:8000');
    }

    // Use the real-time mode variable instead of fetching from storage
    const mode = currentOptimizationMode;
    console.log(`Using optimization mode: ${mode}`);

    // Try extension method first
    try {
      return new Promise((resolve, reject) => {
        // Check if chrome.runtime is available
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
          throw new Error('Extension runtime not available');
        }

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('Optimization request timed out'));
        }, 30000); // 30 second timeout for o1 model processing

        chrome.runtime.sendMessage({ 
          type: "OPTIMIZE_PROMPT", 
          text: raw,
          mode: mode
        }, (resp) => {
          clearTimeout(timeout);
          
          // Check for chrome.runtime.lastError
          if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message || 'Extension communication failed'));
            return;
          }
          
          if (!resp || !resp.ok) {
            console.error('Optimization failed:', resp);
            reject(new Error(resp?.error || 'Optimization failed'));
            return;
          }
          
          console.log(`Optimization successful using ${resp.mode_used} mode`);
          console.log(`Original length: ${resp.original_length}, Optimized length: ${resp.optimized_length}`);
          
          resolve(resp.improved || raw);
        });
      });
    } catch (extensionError) {
      console.warn('Extension method failed, trying direct fetch:', extensionError);
      
      // Fallback to direct fetch
      const response = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: raw, mode: mode })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Direct fetch optimization successful using ${data.mode_used} mode`);
      return data.improved_prompt || raw;
    }
  } catch (error) {
    console.error('Error in optimizePrompt:', error);
    // Fallback to original text if optimization fails
    return raw;
  }
}

// Global flag to prevent multiple optimizations
let isOptimizing = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// Current optimization mode (will be updated in real-time)
let currentOptimizationMode = 'standard';

// Monitor storage changes for real-time mode updates
function initializeModeMonitoring() {
  // Get initial mode
  chrome.storage.local.get(['optimization_mode'], (result) => {
    currentOptimizationMode = result.optimization_mode || 'standard';
    console.log('Initial optimization mode:', currentOptimizationMode);
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.optimization_mode) {
      const newMode = changes.optimization_mode.newValue;
      currentOptimizationMode = newMode || 'standard';
      console.log('Optimization mode updated to:', currentOptimizationMode);
      
      // Show user feedback about mode change
      showModeChangeNotification(newMode);
    }
  });
}

// Show notification when mode changes
function showModeChangeNotification(mode) {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  const modeNames = {
    'standard': 'Standard',
    'concise': 'Concise', 
    'deep-dive': 'Deep Dive',
    'creative': 'Creative',
    'technical': 'Technical',
    'academic': 'Academic',
    'business': 'Business',
    'educational': 'Educational'
  };
  
  notification.textContent = `Mode switched to: ${modeNames[mode] || mode}`;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Global event listener to block Enter keys during optimization
document.addEventListener("keydown", (e) => {
  if (isOptimizing && e.key === 'Enter') {
    console.log("Blocking Enter key during optimization");
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }
}, true); // Use capture phase to intercept before other handlers

// Block form submissions during optimization
document.addEventListener("submit", (e) => {
  if (isOptimizing) {
    console.log("Blocking form submission during optimization");
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true);

// Block any click events on send buttons during optimization
document.addEventListener("click", (e) => {
  if (isOptimizing && (
    e.target.matches('button[data-testid="send-button"]') ||
    e.target.matches('button[aria-label*="Send"]') ||
    e.target.matches('form button[type="submit"]')
  )) {
    console.log("Blocking send button click during optimization");
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true);

// Hotkey detection: Cmd/Ctrl + Shift + \ (backslash)
document.addEventListener("keydown", async (e) => {
  console.log("Key pressed:", e.key, "Meta:", e.metaKey, "Ctrl:", e.ctrlKey, "Shift:", e.shiftKey);
  
  // Prevent optimization if already in progress
  if (isOptimizing) {
    console.log("Optimization already in progress, ignoring key press");
    return;
  }
  
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const hotkey = (isMac && e.metaKey && e.shiftKey && e.key === "\\") ||
                 (!isMac && e.ctrlKey && e.shiftKey && e.key === "\\");
  
  if (!hotkey) return;
  
  console.log("Hotkey detected: Cmd+Shift+\\");
  
  // Prevent the default behavior and stop propagation
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  const { ta } = getPromptElements();
  if (!ta) {
    console.log("No textarea found");
    return;
  }
  
  // Handle both textarea and contenteditable elements
  const original = ta.value ? ta.value.trim() : (ta.textContent || ta.innerText || "").trim();
  if (!original) {
    console.log("No text to optimize");
    return;
  }
  
  console.log("Starting optimization...");
  isOptimizing = true;
  
  try {
    // Temporarily disable the send button to prevent accidental sends
    const { sendBtn } = getPromptElements();
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
    }
    
    // Show "optimizing..." message to user
    const optimizingMessage = "Optimizing...";
    if (ta.tagName === 'TEXTAREA') {
      setTextareaValue(ta, optimizingMessage);
    } else if (ta.contentEditable === 'true') {
      ta.textContent = optimizingMessage;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait a moment to let the UI update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Show progress indicator
    console.log("Starting optimization with o1 model (may take up to 30 seconds)...");
    
    const improved = await optimizePrompt(original);
    console.log("Optimization complete:", improved);
    
    // Reset retry count on success
    retryCount = 0;
    
    // Replace content with optimized prompt
    if (ta.tagName === 'TEXTAREA') {
      setTextareaValue(ta, improved);
    } else if (ta.contentEditable === 'true') {
      ta.textContent = improved;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait a moment to let the UI update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Re-enable the send button
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '';
    }
    
    // Auto-send the optimized prompt
    if (sendBtn) {
      console.log("Auto-sending optimized prompt");
      sendBtn.click();
    }
    
  } catch (err) {
    console.error("Optimization failed:", err);
    
    // Try to retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES && !err.message.includes('Backend service not available')) {
      retryCount++;
      console.log(`Retrying optimization (${retryCount}/${MAX_RETRIES})...`);
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const improved = await optimizePrompt(original);
        console.log("Retry successful:", improved);
        retryCount = 0; // Reset on success
        
        // Replace content with optimized prompt
        if (ta.tagName === 'TEXTAREA') {
          setTextareaValue(ta, improved);
        } else if (ta.contentEditable === 'true') {
          ta.textContent = improved;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Get fresh reference to send button for retry
        const { sendBtn: retrySendBtn } = getPromptElements();
        
        // Auto-send the optimized prompt
        if (retrySendBtn) {
          console.log("Auto-sending optimized prompt");
          retrySendBtn.click();
        }
        
        return; // Success, exit early
      } catch (retryErr) {
        console.error("Retry failed:", retryErr);
      }
    }
    
    // Provide more specific error messages
    let errorMessage = 'Prompt optimization failed. ';
    if (err.message.includes('Backend service not available')) {
      errorMessage += 'Please ensure the backend server is running on localhost:8000.';
    } else if (err.message.includes('timeout')) {
      errorMessage += 'Request timed out. The o1 model can take up to 30 seconds for complex optimizations. Please try again.';
    } else if (err.message.includes('Extension runtime not available')) {
      errorMessage += 'Extension error. Please reload the page and try again.';
    } else {
      errorMessage += 'Your original text is still here.';
    }
    
    alert(errorMessage);
    
    // Restore original text on error
    if (ta.tagName === 'TEXTAREA') {
      setTextareaValue(ta, original);
    } else if (ta.contentEditable === 'true') {
      ta.textContent = original;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Re-enable the send button on error
    const { sendBtn } = getPromptElements();
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '';
    }
  } finally {
    isOptimizing = false;
  }
});

// MutationObserver to prevent automatic changes during optimization
let optimizationObserver = null;

function startOptimizationMonitoring() {
  if (optimizationObserver) {
    optimizationObserver.disconnect();
  }
  
  optimizationObserver = new MutationObserver((mutations) => {
    if (!isOptimizing) return;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if any new messages were added (indicating auto-send)
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const messageElement = node.querySelector('[data-message-author-role="user"]');
            if (messageElement && messageElement.textContent.includes('Optimizing...')) {
              console.log("Detected auto-send of optimizing message, removing it");
              node.remove();
            }
          }
        });
      }
    });
  });
  
  // Observe the chat container for new messages
  const chatContainer = document.querySelector('[data-testid="conversation-turn-2"]')?.parentElement ||
                       document.querySelector('[data-testid="conversation-turn-3"]')?.parentElement ||
                       document.querySelector('main') ||
                       document.body;
  
  if (chatContainer) {
    optimizationObserver.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  }
}

// Periodic health check
function startHealthCheck() {
  setInterval(async () => {
    try {
      const backendStatus = await checkBackendConnection();
      if (!backendStatus) {
        console.warn('Backend service is not responding');
      }
      
      // Check extension context
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "PING" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Extension context may be invalid:', chrome.runtime.lastError);
          }
        });
      }
    } catch (error) {
      console.warn('Health check failed:', error);
    }
  }, 30000); // Check every 30 seconds
}

// Confirm extension is loaded
console.log("ChatGPT Prompt Booster extension loaded!");
console.log("Press Cmd+Shift+\\ (Mac) or Ctrl+Shift+\\ (Windows/Linux) to optimize prompts");

// Initialize mode monitoring for real-time updates
initializeModeMonitoring();

// Check backend status on load
setTimeout(async () => {
  await showBackendStatus();
  startHealthCheck(); // Start periodic health checks
}, 1000);

// Start monitoring after a short delay to ensure DOM is ready
setTimeout(startOptimizationMonitoring, 2000);
