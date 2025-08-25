# Advanced ChatGPT Prompt Optimizer

A professional browser extension that automatically optimizes your ChatGPT prompts using advanced prompt engineering techniques. Transform basic prompts into structured, effective requests with multiple optimization modes and a single hotkey.

## **New in Version 1.0: Advanced Prompt Engineering**

- **8 Optimization Modes**: Choose the perfect optimization style for your needs
- **Cursor Prompt Optimizer Instruction**: Professional-grade prompt engineering
- **Multi-Mode Support**: Standard, Concise, Deep-Dive, Creative, Technical, Academic, Business, Educational
- **Enhanced Backend**: FastAPI with fallback mechanisms and comprehensive error handling
- **User Preferences**: Save and remember your preferred optimization mode

## **Features**

- **One-Hotkey Optimization**: Press `Cmd+Shift+\` (Mac) or `Ctrl+Shift+\` (Windows/Linux)
- **8 Optimization Modes**: Tailored optimization strategies for different use cases
- **Advanced Prompt Engineering**: Based on Cursor Prompt Optimizer Instruction
- **Automatic Enhancement**: Adds structure, examples, clarity, and reasoning instructions
- **Privacy-First**: All processing happens on your local machine
- **Professional Quality**: Clean, reliable extension with comprehensive testing
- **Open Source**: Free to use, modify, and contribute

## **Optimization Modes**

### **Standard** (Default)
Balanced optimization with good structure and detail - perfect for general use cases.

### **Concise**
Brief but complete responses with clear formatting - ideal for quick answers and summaries.

### **Deep-Dive**
Comprehensive analysis with multiple perspectives - great for research and detailed analysis.

### **Creative**
Innovative thinking and alternative approaches - perfect for brainstorming and creative tasks.

### **Technical**
Technical details, code examples, and specifications - ideal for programming and technical work.

### **Academic**
Scholarly analysis with formal language - great for academic writing and research.

### **Business**
Practical business insights and ROI focus - perfect for business planning and strategy.

### **Educational**
Learning-focused explanations with examples - ideal for teaching and learning.

## **How It Works**

1. **Type your prompt** in ChatGPT
2. **Select your optimization mode** in the extension popup
3. **Press the hotkey** (`Cmd+Shift+\`)
4. **Watch advanced optimization** happen automatically
5. **Get professional-quality prompts** with enhanced structure and clarity

## **Example Transformations**

### **Original Prompt**
```
"what is square root of 10"
```

### **Technical Mode Output**
```
Compute the square root of 10, and do the following:

1. Explain technically how to approximate the square root (e.g., using a numerical method or mental estimation).  
2. Provide a step-by-step solution.  
3. Give the approximate value to at least five decimal places.  
4. Conclude with the final answer clearly labeled.
```

### **Concise Mode Output**
```
What is the square root of 10?  
• Provide a concise answer (numeric approximation).  
• Briefly explain how this value can be calculated or estimated.  
• Keep your response short and clear.
```

## **Architecture**

- **Frontend**: Chrome Extension (Manifest V3) with mode selection
- **Backend**: FastAPI + OpenAI API with fallback mechanisms
- **AI Models**: 
  - Optimizer: o1 (with fallback to gpt-4o-mini)
  - Target: gpt-4o (configurable)
- **Communication**: Local HTTP requests with CORS support
- **Storage**: Chrome storage for user preferences

## **Installation**

### **For Users**

1. **Download the Extension**: Available on Chrome Web Store (coming soon)
2. **Install in Browser**: One-click installation
3. **Configure Mode**: Select your preferred optimization mode
4. **Start Optimizing**: Use the hotkey in ChatGPT

### **For Developers**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/carsonjc04/prompt-engineer.git
   cd prompt-engineer
   ```

2. **Set Up Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install fastapi uvicorn[standard] pydantic python-dotenv openai httpx tenacity pytest
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

## **API Endpoints**

### **Health Check**
```bash
GET /healthz
# Returns: {"status": "ok", "version": "1.0.0", "features": [...]}
```

### **Get Available Modes**
```bash
GET /modes
# Returns: List of all optimization modes with descriptions
```

### **Optimize Prompt**
```bash
POST /optimize
{
  "text": "your prompt here",
  "mode": "technical"  # optional, defaults to "standard"
}
```

### **Chat with Optimization**
```bash
POST /chat
{
  "user_input": "your prompt",
  "target_model": "gpt-4o",
  "optimization_mode": "deep-dive",
  "stream": false
}
```

## **Testing**

### **Manual Testing**
1. **Load the extension** in Chrome/Edge
2. **Go to ChatGPT** and type a prompt
3. **Select optimization mode** in extension popup
4. **Use the hotkey** to test optimization
5. **Verify the result** is significantly improved

### **Automated Testing**
```bash
# Run backend tests
pytest tests/

# Test specific endpoints
curl http://localhost:8000/healthz
curl http://localhost:8000/modes
curl -X POST http://localhost:8000/optimize -H "Content-Type: application/json" -d '{"text": "test", "mode": "technical"}'
```

## **Troubleshooting**

### **Extension Not Working**
1. **Check Backend Status**: `curl http://localhost:8000/healthz`
2. **Verify Extension Loading**: Check `chrome://extensions/` for errors
3. **Check Console Logs**: Open browser developer tools for error messages

### **Common Issues**
- **"Backend service not available"**: Ensure server is running on localhost:8000
- **"Optimization failed"**: Check OpenAI API key and credits
- **Hotkey not working**: Ensure textarea is focused in ChatGPT

## **Performance**

- **Server Startup**: ~2-3 seconds
- **Health Endpoint**: <100ms
- **Prompt Optimization**: ~1-3 seconds (o1 model)
- **Fallback Optimization**: ~2-4 seconds (gpt-4o-mini)
- **Memory Usage**: Minimal (FastAPI + dependencies)

## **Roadmap**

- [x] Multi-mode optimization system
- [x] Advanced prompt engineering
- [x] User preference storage
- [x] Fallback mechanisms
- [ ] Chrome Web Store submission
- [ ] Edge Add-ons support
- [ ] Custom optimization rules
- [ ] Performance analytics
- [ ] A/B testing framework

## **Contributing**

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Submit a pull request**

## **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **Support**

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join community discussions
- **Documentation**: Comprehensive guides and examples

---

**Built with advanced prompt engineering and care for the open-source community.**