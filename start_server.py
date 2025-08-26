#!/usr/bin/env python3
"""
Native messaging host for starting the prompt optimizer backend server.
This script can be called by the browser extension to automatically start the server.
"""

import json
import sys
import subprocess
import os
import signal
import time
import threading
from pathlib import Path

def read_message():
    """Read a message from stdin."""
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        return None
    message_length = int.from_bytes(raw_length, byteorder='little')
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message):
    """Send a message to stdout."""
    encoded_content = json.dumps(message).encode('utf-8')
    encoded_length = len(encoded_content).to_bytes(4, byteorder='little')
    sys.stdout.buffer.write(encoded_length)
    sys.stdout.buffer.write(encoded_content)
    sys.stdout.buffer.flush()

def check_server_running():
    """Check if the server is already running."""
    try:
        import requests
        response = requests.get('http://127.0.0.1:8000/healthz', timeout=2)
        return response.status_code == 200
    except:
        return False

def start_server():
    """Start the backend server."""
    try:
        # Get the directory where this script is located
        script_dir = Path(__file__).parent.absolute()
        
        # Change to the project directory
        os.chdir(script_dir)
        
        # Check if server is already running
        if check_server_running():
            return {"success": True, "message": "Server already running"}
        
        # Start the server in the background
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ]
        
        # Start the process
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=script_dir
        )
        
        # Wait a moment for the server to start
        time.sleep(3)
        
        # Check if it's running
        if check_server_running():
            return {"success": True, "message": "Server started successfully", "pid": process.pid}
        else:
            return {"success": False, "message": "Failed to start server"}
            
    except Exception as e:
        return {"success": False, "message": f"Error starting server: {str(e)}"}

def main():
    """Main message handling loop."""
    while True:
        try:
            message = read_message()
            if message is None:
                break
                
            if message.get("action") == "start_server":
                result = start_server()
                send_message(result)
            elif message.get("action") == "check_server":
                is_running = check_server_running()
                send_message({"success": True, "running": is_running})
            else:
                send_message({"success": False, "message": "Unknown action"})
                
        except Exception as e:
            send_message({"success": False, "message": f"Error: {str(e)}"})

if __name__ == "__main__":
    main()
