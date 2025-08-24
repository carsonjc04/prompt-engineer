# ChatGPT Prompt Booster Extension

A Chrome/Edge extension that automatically optimizes your prompts before sending them to ChatGPT.

## Features

- **Hotkey Activation**: Press `Cmd+Shift+\` (Mac) or `Ctrl+Shift+\` (Windows/Linux)
- **Automatic Optimization**: Rewrites your prompt for better clarity and structure
- **Seamless Integration**: Works directly within the ChatGPT interface
- **Auto-Send**: Automatically sends the optimized prompt after processing

## How It Works

1. Type your prompt in ChatGPT
2. Press the hotkey combination
3. The extension calls your local optimizer backend
4. Your prompt is automatically replaced with the improved version
5. The optimized prompt is sent automatically

## Installation

### Prerequisites

- Backend server running at `http://localhost:8000/optimize`
- Chrome or Edge browser

### Steps

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

## Configuration

To change the backend URL, edit `background.js` and modify the `OPTIMIZER_URL` constant.

## Troubleshooting

- Ensure the backend server is running
- Check the browser console for any error messages
- Verify the extension has the correct permissions
- Make sure you're on `https://chatgpt.com` or `https://*.openai.com`

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `activeTab`, `scripting`
- **Host Permissions**: `http://localhost:8000/*`
- **Content Scripts**: Injected into ChatGPT pages
- **Background Service Worker**: Handles API communication

## Support

For issues or questions, check the browser console logs or refer to the main repository documentation.
