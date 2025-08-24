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

// Optimize prompt using the backend API
async function optimizePrompt(raw) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "OPTIMIZE_PROMPT", text: raw }, (resp) => {
      if (!resp || !resp.ok) {
        console.error('Optimization failed:', resp);
        return resolve(raw); // fallback to original
      }
      return resolve(resp.improved || raw);
    });
  });
}

// Global flag to prevent multiple optimizations
let isOptimizing = false;

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
    
    const improved = await optimizePrompt(original);
    console.log("Optimization complete:", improved);
    
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
    alert('Prompt optimization failed. Your original text is still here.');
    
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

// Confirm extension is loaded
console.log("ChatGPT Prompt Booster extension loaded!");
console.log("Press Cmd+Shift+\\ (Mac) or Ctrl+Shift+\\ (Windows/Linux) to optimize prompts");

// Start monitoring after a short delay to ensure DOM is ready
setTimeout(startOptimizationMonitoring, 2000);
