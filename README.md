# Prompt Optimizer - ChatGPT Enhancement Tool

A sophisticated tool that automatically optimizes your prompts before sending them to ChatGPT, resulting in better, more structured responses.

## Overview

This project consists of two main components:

1. **FastAPI Backend**: A local server that uses OpenAI's Responses API to rewrite and improve prompts
2. **Browser Extension**: A Chrome/Edge extension that integrates seamlessly with ChatGPT

## Features

- **Intelligent Prompt Optimization**: Automatically restructures prompts for clarity and completeness
- **Seamless Integration**: Works directly within the ChatGPT interface
- **Hotkey Activation**: Simple keyboard shortcut for instant optimization
- **Local Processing**: All optimization happens on your local machine
- **Cost Effective**: Uses efficient models for optimization while maintaining quality

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ChatGPT UI    │    │  Browser         │    │  FastAPI        │
│                 │◄──►│  Extension       │◄──►│  Backend        │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prompt-engineer
   ```

2. **Set up Python environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -e .
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

4. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Verify installation**
   ```bash
   curl http://127.0.0.1:8000/healthz
   # Should return: {"status": "ok"}
   ```

### Extension Setup

1. **Load the extension**
   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `extension/` folder

2. **Navigate to ChatGPT**
   - Go to `https://chatgpt.com`
   - Type a prompt
   - Press `Cmd+Shift+\` (Mac) or `Ctrl+Shift+\` (Windows/Linux)

## API Endpoints

### Health Check
```bash
GET /healthz
# Returns: {"status": "ok"}
```

### Optimize Prompt
```bash
POST /optimize
Content-Type: application/json

{
  "text": "your prompt here"
}

# Returns: {"improved_prompt": "optimized version"}
```

### Full Chat (Optional)
```bash
POST /chat
Content-Type: application/json

{
  "user_input": "your prompt",
  "target_model": "gpt-5",
  "stream": false,
  "reasoning_effort": "medium"
}

# Returns: {"improved_prompt": "...", "final_answer": "..."}
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_PROJECT`: OpenAI project ID (optional)

### Extension Configuration

To change the backend URL, edit `extension/background.js` and modify the `OPTIMIZER_URL` constant.

## Development

### Project Structure
```
prompt-engineer/
├── app/                    # FastAPI application
│   ├── main.py            # Main application entry point
│   ├── models.py          # Pydantic data models
│   ├── optimizer.py       # Prompt optimization logic
│   └── clients.py         # OpenAI client management
├── extension/              # Browser extension
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Service worker
│   ├── content.js         # Content script
│   └── README.md          # Extension documentation
├── tests/                  # Test suite
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── pyproject.toml         # Python project configuration
└── README.md              # This file
```

### Running Tests
```bash
pytest -v
```

### Code Quality
- **Python**: 3.11+ with type hints
- **Frontend**: Vanilla JavaScript (no frameworks)
- **API**: FastAPI with Pydantic validation
- **Testing**: pytest with comprehensive coverage

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure `OPENAI_API_KEY` is set in your `.env` file
   - Verify the API key has sufficient credits

2. **Extension Not Working**
   - Check that the backend server is running
   - Verify the extension is loaded in developer mode
   - Check browser console for error messages

3. **CORS Issues**
   - The backend is configured to allow all origins
   - Ensure you're accessing from the correct localhost URL

### Debug Mode

Enable detailed logging by checking the browser console when using the extension.

## Performance

- **Optimization Speed**: Typically 1-3 seconds per prompt
- **Memory Usage**: Minimal overhead
- **Network**: Only local communication between extension and backend

## Security

- **Local Processing**: All data stays on your machine
- **No External Calls**: Extension only communicates with localhost
- **API Key Protection**: Stored securely in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Check the troubleshooting section
- Review the console logs
- Open an issue on the repository

---

**Note**: This tool is designed for personal use and development. Ensure compliance with OpenAI's terms of service and usage policies.