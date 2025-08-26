#!/bin/bash

# ChatGPT Prompt Optimizer - Backend Startup Script
# This script starts the backend server for the prompt optimizer extension

echo "🚀 Starting ChatGPT Prompt Optimizer Backend..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3 and try again"
    exit 1
fi

# Check if the .env file exists and has a valid API key
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "Please copy env.template to .env and add your OpenAI API key"
    exit 1
fi

# Check if the API key is set (not the placeholder)
if grep -q "your-openai-api-key-here" .env; then
    echo "❌ OpenAI API key not configured"
    echo "Please edit the .env file and add your actual OpenAI API key"
    exit 1
fi

# Check if dependencies are installed
echo "📦 Checking dependencies..."
python3 -c "import fastapi, uvicorn, openai" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing dependencies..."
    python3 -m pip install fastapi uvicorn pydantic python-dotenv openai httpx tenacity pytest
fi

# Check if server is already running
echo "🔍 Checking if server is already running..."
if curl -s http://127.0.0.1:8000/healthz > /dev/null 2>&1; then
    echo "✅ Server is already running on http://127.0.0.1:8000"
    echo "🎉 You can now use the extension with Cmd+Shift+\\"
    exit 0
fi

# Start the server
echo "🚀 Starting backend server..."
echo "📍 Server will be available at: http://127.0.0.1:8000"
echo "🎯 Use Cmd+Shift+\\ in ChatGPT to optimize prompts"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
