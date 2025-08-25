import pytest
import os
from unittest.mock import Mock, patch
from app.optimizer import rewrite_prompt

@pytest.mark.skipif(True, reason="API tests disabled by default")
def test_rewrite_prompt_preserves_intent():
    """Test that prompt rewriting preserves the original intent"""
    original = "What is the square root of 16?"
    improved = rewrite_prompt(original)
    
    # Should preserve core intent
    assert "16" in improved.lower()
    assert "square root" in improved.lower()
    
    # Should add structure
    assert len(improved) > len(original)

@patch('app.optimizer.get_openai')
def test_rewrite_prompt_mocked(mock_get_openai):
    """Test prompt rewriting with mocked OpenAI client"""
    # Mock the OpenAI response
    mock_client = Mock()
    mock_response = Mock()
    mock_response.output_text = "What is the square root of 16? Please provide a step-by-step explanation with the final answer clearly labeled."
    mock_client.responses.create.return_value = mock_response
    mock_get_openai.return_value = mock_client
    
    original = "What is the square root of 16?"
    improved = rewrite_prompt(original)
    
    assert improved is not None
    assert isinstance(improved, str)
    assert len(improved) > 0
    assert "16" in improved.lower()
    assert "square root" in improved.lower()
