// Backend endpoint for optimization:
const OPTIMIZER_URL = "http://localhost:8000/optimize";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "OPTIMIZE_PROMPT") {
    fetch(OPTIMIZER_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: msg.text || "" })
    })
      .then(r => r.json())
      .then(data => sendResponse({ ok: true, improved: data.improved_prompt || msg.text }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // keep channel open for async response
  }
});
