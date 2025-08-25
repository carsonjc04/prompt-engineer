from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    ChatRequest, ChatResponse, OptimizeRequest, OptimizeResponse, 
    AvailableModesResponse, ModeInfo
)
from .optimizer import rewrite_prompt, get_available_modes, get_mode_description, OptimizationMode
from .clients import get_openai

app = FastAPI(title="Advanced Prompt Optimizer Proxy", version="1.0.0")

# CORS: allow extension/background fetches
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # safe: we don't use cookies/credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "version": "1.0.0", "features": ["multi-mode-optimization", "advanced-prompt-engineering"]}

@app.get("/modes", response_model=AvailableModesResponse)
def get_modes():
    """Get all available optimization modes with descriptions."""
    modes = []
    mode_descriptions = {
        "standard": ("Standard", "Balanced optimization with good structure and detail", "General use cases"),
        "concise": ("Concise", "Brief but complete responses with clear formatting", "Quick answers and summaries"),
        "deep-dive": ("Deep Dive", "Comprehensive analysis with multiple perspectives", "Research and detailed analysis"),
        "creative": ("Creative", "Innovative thinking and alternative approaches", "Brainstorming and creative tasks"),
        "technical": ("Technical", "Technical details, code examples, and specifications", "Programming and technical work"),
        "academic": ("Academic", "Scholarly analysis with formal language", "Academic writing and research"),
        "business": ("Business", "Practical business insights and ROI focus", "Business planning and strategy"),
        "educational": ("Educational", "Learning-focused explanations with examples", "Teaching and learning")
    }
    
    for mode in get_available_modes():
        name, desc, best_for = mode_descriptions.get(mode, (mode.title(), "Optimization mode", "General use"))
        modes.append(ModeInfo(
            mode=mode,
            name=name,
            description=desc,
            best_for=best_for
        ))
    
    return AvailableModesResponse(modes=modes)

@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest):
    """Optimize a prompt using the specified mode."""
    try:
        # Convert string mode to enum
        mode = OptimizationMode(req.mode) if req.mode else OptimizationMode.STANDARD
        improved = rewrite_prompt(req.text, mode)
        
        return OptimizeResponse(
            improved_prompt=improved,
            mode_used=mode.value,
            original_length=len(req.text),
            optimized_length=len(improved)
        )
    except ValueError:
        # Invalid mode, fall back to standard
        improved = rewrite_prompt(req.text, OptimizationMode.STANDARD)
        return OptimizeResponse(
            improved_prompt=improved,
            mode_used="standard",
            original_length=len(req.text),
            optimized_length=len(improved)
        )

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Process a chat request with prompt optimization."""
    client = get_openai()

    # 1) Improve the prompt using the specified mode
    try:
        mode = OptimizationMode(req.optimization_mode) if req.optimization_mode else OptimizationMode.STANDARD
        improved = rewrite_prompt(req.user_input, mode)
    except ValueError:
        mode = OptimizationMode.STANDARD
        improved = rewrite_prompt(req.user_input, mode)

    # 2) Call the target model
    try:
        if req.stream:
            def gen():
                with client.responses.stream(
                    model=req.target_model,
                    reasoning={"effort": req.reasoning_effort},
                    input=[{"role": "user", "content": improved}],
                ) as stream:
                    for event in stream:
                        if event.type == "response.output_text.delta":
                            yield event.delta
            return StreamingResponse(gen(), media_type="text/plain")

        resp = client.responses.create(
            model=req.target_model,
            reasoning={"effort": req.reasoning_effort},
            input=[{"role": "user", "content": improved}],
        )
        final = resp.output_text or ""
        return JSONResponse(ChatResponse(
            improved_prompt=improved, 
            final_answer=final,
            optimization_mode=mode.value
        ).model_dump())
        
    except Exception as e:
        # Fallback to regular chat completions if Responses API fails
        print(f"Responses API failed for model {req.target_model}, falling back to chat completions: {e}")
        
        if req.stream:
            def gen():
                resp = client.chat.completions.create(
                    model=req.target_model,
                    messages=[{"role": "user", "content": improved}],
                    max_tokens=1000,
                    temperature=0.1,
                    stream=True
                )
                for chunk in resp:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            return StreamingResponse(gen(), media_type="text/plain")
        
        resp = client.chat.completions.create(
            model=req.target_model,
            messages=[{"role": "user", "content": improved}],
            max_tokens=1000,
            temperature=0.1,
        )
        final = resp.choices[0].message.content or ""
        return JSONResponse(ChatResponse(
            improved_prompt=improved, 
            final_answer=final,
            optimization_mode=mode.value
        ).model_dump())
