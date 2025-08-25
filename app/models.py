from pydantic import BaseModel, Field
from typing import Optional, List

class OptimizeRequest(BaseModel):
    text: str = Field(..., description="The text to optimize")
    mode: Optional[str] = Field("standard", description="Optimization mode to apply")

class OptimizeResponse(BaseModel):
    improved_prompt: str = Field(..., description="The optimized prompt")
    mode_used: str = Field(..., description="The optimization mode that was applied")
    original_length: int = Field(..., description="Length of original text")
    optimized_length: int = Field(..., description="Length of optimized text")

class ChatRequest(BaseModel):
    user_input: str = Field(..., description="The user's input text")
    target_model: str = Field("gpt-4o", description="The target model to use for final response")
    reasoning_effort: str = Field("medium", description="Reasoning effort level (low, medium, high)")
    stream: bool = Field(False, description="Whether to stream the response")
    optimization_mode: Optional[str] = Field("standard", description="Optimization mode to apply")

class ChatResponse(BaseModel):
    improved_prompt: str = Field(..., description="The optimized prompt")
    final_answer: str = Field(..., description="The final response from the target model")
    optimization_mode: str = Field(..., description="The optimization mode that was applied")

class ModeInfo(BaseModel):
    mode: str = Field(..., description="The optimization mode identifier")
    name: str = Field(..., description="Human-readable name for the mode")
    description: str = Field(..., description="Description of what the mode does")
    best_for: str = Field(..., description="Best use cases for this mode")

class AvailableModesResponse(BaseModel):
    modes: List[ModeInfo] = Field(..., description="List of available optimization modes")
