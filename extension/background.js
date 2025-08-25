// Backend endpoint for optimization:
const OPTIMIZER_URL = "http://localhost:8000/optimize";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "OPTIMIZE_PROMPT") {
    console.log("Received optimization request:", msg.text, "Mode:", msg.mode);
    
    // Get the selected optimization mode
    const mode = msg.mode || "standard";
    
    // Add timeout protection
    const timeout = setTimeout(() => {
      sendResponse({ ok: false, error: "Request timeout" });
    }, 35000); // 35 second timeout to match content script
    
    fetch(OPTIMIZER_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ 
        text: msg.text || "",
        mode: mode
      })
    })
      .then(r => {
        clearTimeout(timeout);
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
      })
      .then(data => {
        console.log("Optimization successful:", data);
        sendResponse({ 
          ok: true, 
          improved: data.improved_prompt || msg.text,
          mode_used: data.mode_used,
          original_length: data.original_length,
          optimized_length: data.optimized_length
        });
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error("Optimization error:", err);
        sendResponse({ 
          ok: false, 
          error: err.message || "Network error",
          details: String(err)
        });
      });
    
    return true; // keep channel open for async response
  }
  
  // Handle PING messages for context checking
  if (msg?.type === "PING") {
    sendResponse({ ok: true, message: "pong" });
    return false; // no async response needed
  }
});

// Log when background script loads
console.log("Advanced ChatGPT Prompt Optimizer background script loaded");
