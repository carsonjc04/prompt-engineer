from .clients import get_openai

# Use a fast, cost-effective model for rewriting
OPTIMIZER_MODEL = "gpt-5"

SYSTEM_OPTIMIZER = """You are a prompt optimizer.
Rewrite the user's query so a general-purpose LLM returns a better answer.

Rules:
- Preserve the user's intent and facts.
- Add helpful structure: explicit task, constraints, tone, format, steps.
- Ask for step-by-step explanations when relevant.
- Add domain disambiguation ONLY if common (math units, locales, versions).
- NEVER invent data or change requirements.

Output ONLY the improved user prompt, with no commentary.
"""

def rewrite_prompt(user_input: str) -> str:
    client = get_openai()
    resp = client.responses.create(
        model=OPTIMIZER_MODEL,
        reasoning={"effort": "low"},
        input=[
            {"role": "system", "content": SYSTEM_OPTIMIZER},
            {"role": "user", "content": user_input},
        ],
    )
    return (resp.output_text or "").strip()
