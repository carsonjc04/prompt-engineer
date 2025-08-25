# ChatGPT Prompt Optimizer

A professional browser extension that automatically optimizes your ChatGPT prompts for better, more detailed responses. Transform basic prompts into structured, effective requests with a single hotkey.

## Features

- **One-Hotkey Optimization**: Press `Cmd+Shift+\` (Mac) or `Ctrl+Shift+\` (Windows/Linux)
- **Automatic Enhancement**: Adds structure, examples, and clarity to your prompts
- **Privacy-First**: All processing happens on your local machine
- **Professional Quality**: Clean, reliable extension with comprehensive testing
- **Open Source**: Free to use, modify, and contribute

## How It Works

1. **Type your prompt** in ChatGPT
2. **Press the hotkey** (`Cmd+Shift+\`)
3. **Watch optimization** happen automatically
4. **Get better results** with enhanced prompts

## Installation

### For Users

1. **Download the Extension**: Available on Chrome Web Store (coming soon)
2. **Install in Browser**: One-click installation
3. **Start Optimizing**: Use the hotkey in ChatGPT

### For Developers

1. **Clone the Repository**
   ```bash
   git clone https://github.com/carsonjc04/prompt-engineer.git
   cd prompt-engineer
   ```

2. **Set Up Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -e .
   ```

3. **Configure API Key**
   ```bash
   cp env.template .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start Backend Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Load Extension**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` folder

## Architecture

- **Frontend**: Chrome Extension (Manifest V3)
- **Backend**: FastAPI + OpenAI API
- **Communication**: Local HTTP requests
- **Security**: No data leaves your machine

## Development

### Project Structure

```
prompt-engineer/
├── app/                    # Backend API
│   ├── main.py           # FastAPI application
│   ├── optimizer.py      # Prompt optimization logic
│   ├── models.py         # Data models
│   └── clients.py        # OpenAI client
├── extension/             # Browser extension
│   ├── manifest.json     # Extension configuration
│   ├── content.js        # Content script
│   ├── background.js     # Service worker
│   └── popup.html        # Extension popup
├── tests/                 # Test suite
├── pyproject.toml        # Python dependencies
└── README.md             # This file
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run API tests (requires OpenAI key)
pytest --run-api-tests
```

### Code Quality

- **Type Hints**: Full Python type annotations
- **Testing**: Comprehensive test suite with mocking
- **Documentation**: Clear docstrings and comments
- **Error Handling**: Robust error handling and validation

## Security

- **Local Processing**: All optimization happens on your machine
- **No Data Collection**: We don't store or transmit your prompts
- **Open Source**: Full transparency of all code
- **API Key Security**: Your OpenAI key stays on your machine

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Submit a pull request**

## Testing

### Manual Testing

1. **Load the extension** in Chrome/Edge
2. **Go to ChatGPT** and type a prompt
3. **Use the hotkey** to test optimization
4. **Verify the result** is improved

### Automated Testing

```bash
# Run backend tests
pytest tests/test_extension.py

# Run specific test categories
pytest tests/ -k "TestExtensionBackend"
pytest tests/ -k "TestOptimizerLogic"
```

## Troubleshooting

### Extension Not Working

1. **Check Backend Status**
   ```bash
   curl http://127.0.0.1:8000/healthz
   ```

2. **Verify Extension Loading**
   - Check `chrome://extensions/` for errors
   - Reload the extension if needed

3. **Check Console Logs**
   - Open browser developer tools
   - Look for error messages

### Common Issues

- **"Extension not responding"**: Backend server not running
- **"Optimization failed"**: Check OpenAI API key and credits
- **Hotkey not working**: Ensure textarea is focused in ChatGPT

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join community discussions
- **Documentation**: Comprehensive guides and examples

## Roadmap

- [ ] Chrome Web Store submission
- [ ] Edge Add-ons support
- [ ] Additional optimization models
- [ ] User customization options
- [ ] Performance improvements

---

**Built with professionalism and care for the open-source community.**