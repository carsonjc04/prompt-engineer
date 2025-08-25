// OpenAI API configuration for direct optimization
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// System prompt for prompt optimization
const OPTIMIZATION_SYSTEM_PROMPT = `You are a prompt optimizer for ChatGPT.
When I provide you with a raw user prompt, your job is to rewrite it into the clearest, most structured, and most detailed version possible — while preserving the original intent.

Optimization Rules:
- Clarify the request – restate vague wording into precise language
- Add structure – if the prompt is open-ended, convert it into clear steps, bullet points, or ordered tasks
- Enforce constraints – specify tone, style, output length, and format when helpful
- Encourage reasoning – add instructions like "explain briefly," "justify choices," or "show working"
- Preserve user intent – do not change the meaning of the original request
- Make outputs practical – prefer actionable, reusable, and structured answers over vague text

Output Format:
Respond only with the optimized prompt (no extra commentary).
Ensure it is ready to be directly sent to ChatGPT.`;

// Mode-specific enhancements
const MODE_ENHANCEMENTS = {
  'standard': 'Apply standard optimization with balanced detail and structure.',
  'concise': 'Apply concise optimization: Keep responses brief but complete, use bullet points and clear formatting, focus on essential information only, specify "provide a concise answer" in the prompt',
  'deep-dive': 'Apply deep-dive optimization: Request comprehensive analysis, ask for multiple perspectives, include "explore in detail" and "provide thorough analysis", request examples and case studies, ask for step-by-step breakdowns',
  'creative': 'Apply creative optimization: Encourage innovative thinking, request multiple creative approaches, include "think outside the box" and "be creative", ask for alternative solutions, request brainstorming and ideation',
  'technical': 'Apply technical optimization: Request technical details and specifications, ask for code examples when relevant, include "explain technically" and "provide technical details", request step-by-step technical processes, ask for best practices and standards',
  'academic': 'Apply academic optimization: Request scholarly analysis, ask for citations and references when relevant, include "provide academic perspective" and "use formal language", request critical analysis and evaluation, ask for theoretical frameworks',
  'business': 'Apply business optimization: Focus on practical business applications, request actionable insights and recommendations, include "provide business perspective" and "focus on ROI", ask for implementation strategies, request risk assessment and mitigation',
  'educational': 'Apply educational optimization: Structure for learning and understanding, request explanations suitable for different knowledge levels, include "explain as if to a beginner" and "provide examples", ask for step-by-step learning progression, request practical applications and exercises'
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "OPTIMIZE_PROMPT") {
    console.log("Received optimization request:", msg.text, "Mode:", msg.mode);
    
    // Get the selected optimization mode
    const mode = msg.mode || "standard";
    
    // Add timeout protection
    const timeout = setTimeout(() => {
      sendResponse({ ok: false, error: "Request timeout" });
    }, 35000); // 35 second timeout to match content script
    
    // Get the system prompt for the selected mode
    const modeEnhancement = MODE_ENHANCEMENTS[mode] || MODE_ENHANCEMENTS['standard'];
    const systemPrompt = `${OPTIMIZATION_SYSTEM_PROMPT}\n\nMode-Specific Instructions:\n${modeEnhancement}`;
    
    // Call OpenAI API directly
    fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${msg.apiKey}` // API key passed from content script
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use reliable model for optimization
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Optimize this prompt: ${msg.text}` }
        ],
        max_tokens: 800,
        temperature: 0.1
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
        const improvedPrompt = data.choices?.[0]?.message?.content || msg.text;
        
        sendResponse({ 
          ok: true, 
          improved: improvedPrompt,
          mode_used: mode,
          original_length: msg.text.length,
          optimized_length: improvedPrompt.length
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
