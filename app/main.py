from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .models import ChatRequest, ChatResponse, OptimizeRequest, OptimizeResponse
from .optimizer import rewrite_prompt
from .clients import get_openai

app = FastAPI(title="Prompt Optimizer Proxy", version="0.2.0")

# CORS: allow extension/background fetches
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # safe: we don't use cookies/credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest):
    improved = rewrite_prompt(req.text)
    return OptimizeResponse(improved_prompt=improved)

# Optional: keep /chat for A/B or direct model calls (unchanged if present)
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    client = get_openai()

    # 1) Improve the prompt
    improved = rewrite_prompt(req.user_input)

    # 2) Call the target model
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
    return JSONResponse(ChatResponse(improved_prompt=improved, final_answer=final).model_dump())
