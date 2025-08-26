# 🚀 Auto-Start Setup for ChatGPT Prompt Optimizer

This guide helps you set up automatic startup of the backend server so you don't have to manually start it every time you restart your computer.

## 🎯 Quick Setup (Recommended)

Run the setup script to automatically configure auto-start for your operating system:

```bash
./setup_auto_start.sh
```

This script will:
- Detect your operating system
- Set up the appropriate auto-start mechanism
- Configure the backend to start automatically when you log in

## 📋 Manual Setup Options

### 🍎 macOS (LaunchAgent)

1. **Run the setup script:**
   ```bash
   ./setup_auto_start.sh
   ```

2. **Or manually:**
   ```bash
   # Copy the LaunchAgent plist file
   cp com.promptoptimizer.backend.plist ~/Library/LaunchAgents/
   
   # Load the LaunchAgent
   launchctl load ~/Library/LaunchAgents/com.promptoptimizer.backend.plist
   ```

3. **Manage the service:**
   ```bash
   # Start the service
   launchctl start com.promptoptimizer.backend
   
   # Stop the service
   launchctl stop com.promptoptimizer.backend
   
   # Unload the service (disable auto-start)
   launchctl unload ~/Library/LaunchAgents/com.promptoptimizer.backend.plist
   
   # View logs
   tail -f /tmp/promptoptimizer.log
   ```

### 🐧 Linux (systemd)

1. **Run the setup script:**
   ```bash
   ./setup_auto_start.sh
   ```

2. **Or manually:**
   ```bash
   # Install the systemd service
   sudo cp /tmp/promptoptimizer.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable promptoptimizer.service
   sudo systemctl start promptoptimizer.service
   ```

3. **Manage the service:**
   ```bash
   # Start the service
   sudo systemctl start promptoptimizer.service
   
   # Stop the service
   sudo systemctl stop promptoptimizer.service
   
   # Check status
   sudo systemctl status promptoptimizer.service
   
   # View logs
   sudo journalctl -u promptoptimizer.service -f
   ```

### 🪟 Windows (Task Scheduler)

1. **Open Task Scheduler** (search for "Task Scheduler" in Start menu)

2. **Create Basic Task:**
   - Name: "ChatGPT Prompt Optimizer Backend"
   - Trigger: "When I log on"
   - Action: "Start a program"
   - Program: `python.exe`
   - Arguments: `-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
   - Start in: `C:\path\to\your\prompt-engineer\directory`

3. **Configure the task:**
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"

## 🔧 Manual Startup (Alternative)

If you prefer to start the server manually when needed:

```bash
# Simple startup script
./start_backend.sh

# Or manually
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 🎯 Extension Behavior

The extension has been updated to provide better guidance when the server is down:

- **Console messages** will show helpful startup instructions
- **Error messages** will include the startup command
- **Health checks** will guide you to start the server

## 🔍 Troubleshooting

### Server won't start automatically
1. Check if the service is enabled:
   - **macOS:** `launchctl list | grep promptoptimizer`
   - **Linux:** `sudo systemctl is-enabled promptoptimizer.service`

2. Check logs for errors:
   - **macOS:** `tail -f /tmp/promptoptimizer.log`
   - **Linux:** `sudo journalctl -u promptoptimizer.service -f`

### API Key Issues
Make sure your `.env` file has a valid OpenAI API key:
```bash
# Check if API key is set
grep "OPENAI_API_KEY" .env
```

### Port Already in Use
If port 8000 is already in use:
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process if needed
kill -9 <PID>
```

## ✅ Verification

After setup, verify everything works:

1. **Restart your computer**
2. **Open ChatGPT** in your browser
3. **Use the hotkey** `Cmd+Shift+\` (or `Ctrl+Shift+\` on Windows/Linux)
4. **Check that optimization works** without manually starting the server

The extension will now automatically detect when the server is running and provide clear instructions when it's not!
