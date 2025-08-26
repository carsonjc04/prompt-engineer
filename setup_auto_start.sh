#!/bin/bash

# ChatGPT Prompt Optimizer - Auto-Start Setup Script
# This script helps you set up automatic startup of the backend server

echo "🚀 ChatGPT Prompt Optimizer - Auto-Start Setup"
echo "=============================================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Project directory: $SCRIPT_DIR"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS - Setting up LaunchAgent for auto-start"
    echo ""
    
    # Create LaunchAgents directory if it doesn't exist
    LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
    mkdir -p "$LAUNCH_AGENTS_DIR"
    
    # Update the plist file with the correct path
    sed "s|/Users/carsonchristensen/Desktop/prompt-engineer|$SCRIPT_DIR|g" com.promptoptimizer.backend.plist > "$LAUNCH_AGENTS_DIR/com.promptoptimizer.backend.plist"
    
    echo "✅ Created LaunchAgent: $LAUNCH_AGENTS_DIR/com.promptoptimizer.backend.plist"
    echo ""
    
    # Load the LaunchAgent
    echo "🔄 Loading LaunchAgent..."
    launchctl load "$LAUNCH_AGENTS_DIR/com.promptoptimizer.backend.plist"
    
    if [ $? -eq 0 ]; then
        echo "✅ LaunchAgent loaded successfully!"
        echo "🎉 The backend server will now start automatically when you log in"
        echo ""
        echo "📋 To manage the service:"
        echo "   • Start:   launchctl start com.promptoptimizer.backend"
        echo "   • Stop:    launchctl stop com.promptoptimizer.backend"
        echo "   • Unload:  launchctl unload $LAUNCH_AGENTS_DIR/com.promptoptimizer.backend.plist"
        echo "   • Logs:    tail -f /tmp/promptoptimizer.log"
        echo ""
    else
        echo "❌ Failed to load LaunchAgent"
        echo "You can still start the server manually with: ./start_backend.sh"
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux - Setting up systemd service for auto-start"
    echo ""
    
    # Create systemd service file
    SERVICE_FILE="/tmp/promptoptimizer.service"
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=ChatGPT Prompt Optimizer Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/start_backend.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    echo "📄 Created systemd service file: $SERVICE_FILE"
    echo ""
    echo "📋 To install the service:"
    echo "   sudo cp $SERVICE_FILE /etc/systemd/system/promptoptimizer.service"
    echo "   sudo systemctl daemon-reload"
    echo "   sudo systemctl enable promptoptimizer.service"
    echo "   sudo systemctl start promptoptimizer.service"
    echo ""
    echo "📋 To manage the service:"
    echo "   • Start:   sudo systemctl start promptoptimizer.service"
    echo "   • Stop:    sudo systemctl stop promptoptimizer.service"
    echo "   • Status:  sudo systemctl status promptoptimizer.service"
    echo "   • Logs:    sudo journalctl -u promptoptimizer.service -f"
    echo ""
    
else
    echo "❓ Unsupported operating system: $OSTYPE"
    echo "You can still start the server manually with: ./start_backend.sh"
fi

echo "🎯 Alternative: Manual startup"
echo "   Run: ./start_backend.sh"
echo ""
echo "✅ Setup complete! The extension will now provide better guidance when the server is down."
