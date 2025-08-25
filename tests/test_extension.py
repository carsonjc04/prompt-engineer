"""
Professional test suite for ChatGPT Prompt Optimizer Extension

Tests core functionality without breaking the working extension.
"""

import pytest
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.optimizer import rewrite_prompt, SYSTEM_OPTIMIZER, OPTIMIZER_MODEL
from app.models import OptimizeRequest, OptimizeResponse
from app.clients import get_openai

# Create test client
client = TestClient(app)


class TestExtensionBackend:
    """Test the backend API endpoints used by the extension"""
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = client.get("/healthz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
    
    @patch('app.optimizer.get_openai')
    def test_optimize_endpoint_structure(self, mock_get_openai):
        """Test the optimize endpoint returns correct structure"""
        # Mock the OpenAI response
        mock_client = Mock()
        mock_response = Mock()
        mock_response.output_text = "Improved test prompt with structure and details."
        mock_client.responses.create.return_value = mock_response
        mock_get_openai.return_value = mock_client
        
        response = client.post(
            "/optimize",
            json={"text": "test prompt"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved_prompt" in data
        assert isinstance(data["improved_prompt"], str)
        assert len(data["improved_prompt"]) > 0
    
    def test_optimize_endpoint_validation(self):
        """Test input validation on optimize endpoint"""
        # Test missing text
        response = client.post(
            "/optimize",
            json={}
        )
        assert response.status_code == 422
        
        # Test invalid JSON
        response = client.post(
            "/optimize",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestOptimizerLogic:
    """Test the core prompt optimization logic"""
    
    @pytest.mark.skipif(True, reason="API tests disabled by default")
    def test_rewrite_prompt_functional(self):
        """Test that prompt rewriting actually improves prompts"""
        original = "explain machine learning"
        improved = rewrite_prompt(original)
        
        # Should preserve core intent
        assert "machine learning" in improved.lower()
        
        # Should add structure
        structure_indicators = ["step", "explain", "detail", "example", "format"]
        has_structure = any(indicator in improved.lower() for indicator in structure_indicators)
        assert has_structure, f"Improved prompt should contain structural elements: {improved}"
        
        # Should be longer and more detailed
        assert len(improved) > len(original)
    
    @patch('app.optimizer.get_openai')
    def test_rewrite_prompt_mocked(self, mock_get_openai):
        """Test prompt rewriting with mocked OpenAI client"""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.output_text = "Provide a detailed, step-by-step explanation of machine learning with examples and practical applications."
        mock_client.responses.create.return_value = mock_response
        mock_get_openai.return_value = mock_client
        
        original = "explain machine learning"
        improved = rewrite_prompt(original)
        
        assert improved is not None
        assert isinstance(improved, str)
        assert len(improved) > 0
        assert "machine learning" in improved.lower()
        
        # Verify OpenAI API was called correctly
        mock_client.responses.create.assert_called_once()
        call_args = mock_client.responses.create.call_args
        assert call_args[1]["model"] == OPTIMIZER_MODEL
        assert call_args[1]["reasoning"]["effort"] == "low"


class TestDataModels:
    """Test the data models used by the extension"""
    
    def test_optimize_request_validation(self):
        """Test OptimizeRequest model validation"""
        # Valid request
        request = OptimizeRequest(text="test prompt")
        assert request.text == "test prompt"
        
        # Test with empty string
        request = OptimizeRequest(text="")
        assert request.text == ""
        
        # Test with whitespace
        request = OptimizeRequest(text="   ")
        assert request.text == "   "
    
    def test_optimize_response_validation(self):
        """Test OptimizeResponse model validation"""
        # Valid response
        response = OptimizeResponse(improved_prompt="improved prompt")
        assert response.improved_prompt == "improved prompt"
        
        # Test with empty string
        response = OptimizeResponse(improved_prompt="")
        assert response.improved_prompt == ""


class TestOpenAIClient:
    """Test the OpenAI client configuration"""
    
    def test_client_singleton(self):
        """Test that get_openai returns the same client instance"""
        client1 = get_openai()
        client2 = get_openai()
        assert client1 is client2
    
    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'})
    def test_client_initialization(self):
        """Test client initialization with environment variables"""
        # Clear the cached client
        import app.clients
        app.clients._client = None
        
        client = get_openai()
        assert client is not None
        assert hasattr(client, 'responses')


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    @patch('app.optimizer.get_openai')
    def test_empty_prompt_handling(self, mock_get_openai):
        """Test handling of empty prompts"""
        # Mock the OpenAI response
        mock_client = Mock()
        mock_response = Mock()
        mock_response.output_text = "Empty prompt optimized."
        mock_client.responses.create.return_value = mock_response
        mock_get_openai.return_value = mock_client
        
        response = client.post(
            "/optimize",
            json={"text": ""}
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved_prompt" in data
    
    @patch('app.optimizer.get_openai')
    def test_very_long_prompt_handling(self, mock_get_openai):
        """Test handling of very long prompts"""
        # Mock the OpenAI response
        mock_client = Mock()
        mock_response = Mock()
        mock_response.output_text = "Very long prompt optimized with structure and clarity."
        mock_client.responses.create.return_value = mock_response
        mock_get_openai.return_value = mock_client
        
        long_prompt = "a" * 10000  # 10k character prompt
        
        response = client.post(
            "/optimize",
            json={"text": long_prompt}
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved_prompt" in data


class TestIntegration:
    """Integration tests for the complete system"""
    
    @pytest.mark.skipif(True, reason="API tests disabled by default")
    def test_end_to_end_optimization(self):
        """Test complete optimization flow"""
        # Test with a realistic prompt
        test_prompt = "How do I implement a binary search algorithm?"
        
        response = client.post(
            "/optimize",
            json={"text": test_prompt}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        improved = data["improved_prompt"]
        assert improved is not None
        assert isinstance(improved, str)
        assert len(improved) > 0
        
        # Should contain original intent
        assert "binary search" in improved.lower()
        assert "algorithm" in improved.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
