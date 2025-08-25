import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

_client = None

def get_openai() -> OpenAI:
    global _client
    if _client is None:
        # Only set project if it's a valid value (not the placeholder)
        project_id = os.getenv("OPENAI_PROJECT")
        if project_id and project_id != "your-openai-project-id-here":
            _client = OpenAI(project=project_id)
        else:
            _client = OpenAI()
    return _client
