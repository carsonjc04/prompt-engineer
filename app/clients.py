import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

_client = None

def get_openai() -> OpenAI:
    global _client
    if _client is None:
        # OpenAI() automatically reads OPENAI_API_KEY environment variable
        _client = OpenAI(
            project=os.getenv("OPENAI_PROJECT") or None
        )
    return _client
