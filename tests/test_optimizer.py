import os
import pytest

from app.optimizer import rewrite_prompt

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="No API key set")
def test_rewrite_prompt_preserves_intent():
    original = "What is the square root of 16?"
    improved = rewrite_prompt(original)
    # Check that the core concept is preserved (more flexible assertion)
    assert "16" in improved.lower()
    assert "square root" in improved.lower() or "sqrt" in improved.lower()
    # Check that structure/explanation is added
    assert any(word in improved.lower() for word in ["step", "explain", "requirements", "format"])
