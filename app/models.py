from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    user_input: str
    target_model: Optional[str] = "gpt-5"
    stream: bool = False
    reasoning_effort: Optional[str] = "medium"  # none|low|medium|high

class ChatResponse(BaseModel):
    improved_prompt: str
    final_answer: str

class OptimizeRequest(BaseModel):
    text: str

class OptimizeResponse(BaseModel):
    improved_prompt: str
