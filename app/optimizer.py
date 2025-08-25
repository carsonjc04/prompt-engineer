from .clients import get_openai
from enum import Enum
from typing import Optional

class OptimizationMode(Enum):
    STANDARD = "standard"
    CONCISE = "concise"
    DEEP_DIVE = "deep-dive"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    ACADEMIC = "academic"
    BUSINESS = "business"
    EDUCATIONAL = "educational"

# Base system prompt for all optimization modes
BASE_SYSTEM_PROMPT = """You are a prompt optimizer for ChatGPT.
When I provide you with a raw user prompt, your job is to rewrite it into the clearest, most structured, and most detailed version possible — while preserving the original intent.

Optimization Rules:

Clarify the request – restate vague wording into precise language.

Add structure – if the prompt is open-ended, convert it into clear steps, bullet points, or ordered tasks.

Enforce constraints – specify tone, style, output length, and format when helpful (e.g., "concise summary in bullet points," "step-by-step guide," "final answer clearly labeled").

Encourage reasoning – add instructions like "explain briefly," "justify choices," or "show working."

Preserve user intent – do not change the meaning of the original request.

Make outputs practical – prefer actionable, reusable, and structured answers over vague text.

Output Format:

Respond only with the optimized prompt (no extra commentary).

Ensure it is ready to be directly sent to ChatGPT."""

# Mode-specific enhancements
MODE_ENHANCEMENTS = {
    OptimizationMode.STANDARD: "Apply standard optimization with balanced detail and structure.",
    
    OptimizationMode.CONCISE: """Apply concise optimization:
- Keep responses brief but complete
- Use bullet points and clear formatting
- Focus on essential information only
- Specify "provide a concise answer" in the prompt""",
    
    OptimizationMode.DEEP_DIVE: """Apply deep-dive optimization:
- Request comprehensive analysis
- Ask for multiple perspectives
- Include "explore in detail" and "provide thorough analysis"
- Request examples and case studies
- Ask for step-by-step breakdowns""",
    
    OptimizationMode.CREATIVE: """Apply creative optimization:
- Encourage innovative thinking
- Request multiple creative approaches
- Include "think outside the box" and "be creative"
- Ask for alternative solutions
- Request brainstorming and ideation""",
    
    OptimizationMode.TECHNICAL: """Apply technical optimization:
- Request technical details and specifications
- Ask for code examples when relevant
- Include "explain technically" and "provide technical details"
- Request step-by-step technical processes
- Ask for best practices and standards""",
    
    OptimizationMode.ACADEMIC: """Apply academic optimization:
- Request scholarly analysis
- Ask for citations and references when relevant
- Include "provide academic perspective" and "use formal language"
- Request critical analysis and evaluation
- Ask for theoretical frameworks""",
    
    OptimizationMode.BUSINESS: """Apply business optimization:
- Focus on practical business applications
- Request actionable insights and recommendations
- Include "provide business perspective" and "focus on ROI"
- Ask for implementation strategies
- Request risk assessment and mitigation""",
    
    OptimizationMode.EDUCATIONAL: """Apply educational optimization:
- Structure for learning and understanding
- Request explanations suitable for different knowledge levels
- Include "explain as if to a beginner" and "provide examples"
- Ask for step-by-step learning progression
- Request practical applications and exercises"""
}

def get_optimization_prompt(mode: OptimizationMode = OptimizationMode.STANDARD) -> str:
    """Get the system prompt for a specific optimization mode."""
    base = BASE_SYSTEM_PROMPT
    enhancement = MODE_ENHANCEMENTS.get(mode, "")
    
    if enhancement:
        return f"{base}\n\nMode-Specific Instructions:\n{enhancement}"
    return base

def rewrite_prompt(user_input: str, mode: OptimizationMode = OptimizationMode.STANDARD) -> str:
    """
    Rewrite a user prompt using advanced prompt engineering techniques.
    
    Args:
        user_input: The original user prompt
        mode: The optimization mode to apply
    
    Returns:
        An optimized version of the prompt
    """
    client = get_openai()
    system_prompt = get_optimization_prompt(mode)
    
    try:
        # Try Responses API first (for models that support reasoning)
        resp = client.responses.create(
            model="o1",  # Use o1 for reasoning capabilities
            reasoning={"effort": "medium"},  # Medium effort for better optimization
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Optimize this prompt: {user_input}"},
            ],
        )
        return (resp.output_text or "").strip()
    except Exception as e:
        # Fallback to regular chat completions if Responses API fails
        print(f"Responses API failed, falling back to chat completions: {e}")
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  # Use a reliable model for fallback
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Optimize this prompt: {user_input}"},
            ],
            max_tokens=800,  # Increased for better optimization
            temperature=0.1,  # Low temperature for consistent quality
        )
        return (resp.choices[0].message.content or "").strip()

def get_available_modes() -> list:
    """Get list of available optimization modes."""
    return [mode.value for mode in OptimizationMode]

def get_mode_description(mode: str) -> str:
    """Get description of an optimization mode."""
    try:
        mode_enum = OptimizationMode(mode)
        return MODE_ENHANCEMENTS.get(mode_enum, "Standard optimization mode")
    except ValueError:
        return "Unknown optimization mode"
