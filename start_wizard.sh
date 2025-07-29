#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")"

# Install Python requirements
pip install -r backend/requirements.txt

# Start the Flask backend server
python app.py

# Open the browser to the app page (optional, depends on OS and browser)
# For macOS
# open http://localhost:5000
# For Linux (requires xdg-open)
# xdg-open http://localhost:5000