@echo off

REM Navigate to the project root directory
cd /d "%~dp0"

REM Install Python requirements
pip install -r backend/requirements.txt

REM Start the Flask backend server
start /b python app.py

REM Open the browser to the app page
start http://localhost:5000