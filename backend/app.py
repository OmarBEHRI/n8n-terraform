# Flask backend for n8n Terraform Setup Wizard

from flask import Flask, request, jsonify, send_from_directory
import os
import subprocess
import threading
import time
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store command outputs and statuses
command_outputs = {}
command_statuses = {}

# Path to the Terraform project directory
TERRAFORM_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'terraform')

# Function to check if a file exists
def file_exists(file_path):
    return os.path.isfile(file_path)

# Function to run a command and capture its output
def run_command(command_id, command, cwd=TERRAFORM_DIR):
    command_outputs[command_id] = ""
    command_statuses[command_id] = "running"
    
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            shell=True,
            cwd=cwd
        )
        
        # Read output line by line
        for line in iter(process.stdout.readline, ""):
            command_outputs[command_id] += line
        
        # Wait for the process to complete
        exit_code = process.wait()
        command_statuses[command_id] = "done"
        
        return exit_code
    except Exception as e:
        command_outputs[command_id] += f"Error: {str(e)}\n"
        command_statuses[command_id] = "error"
        return 1

# Serve static files
@app.route('/')
def index():
    return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend'), 'setup-wizard.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend'), path)

# API endpoint to save terraform.tfvars file
@app.route('/api/save-tfvars', methods=['POST'])
def save_tfvars():
    data = request.json
    content = data.get('content', '')
    overwrite = data.get('overwrite', False)
    
    tfvars_path = os.path.join(TERRAFORM_DIR, 'terraform.tfvars')
    
    # Check if file exists and overwrite flag is not set
    if file_exists(tfvars_path) and not overwrite:
        return jsonify({
            'success': False,
            'message': 'terraform.tfvars already exists. Set overwrite flag to true to replace it.',
            'fileExists': True
        }), 400
    
    try:
        with open(tfvars_path, 'w') as f:
            f.write(content)
        return jsonify({
            'success': True,
            'message': 'terraform.tfvars saved successfully',
            'path': tfvars_path
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving terraform.tfvars: {str(e)}'
        }), 500

# API endpoint to check if terraform.tfvars exists
@app.route('/api/check-tfvars', methods=['GET'])
def check_tfvars():
    tfvars_path = os.path.join(TERRAFORM_DIR, 'terraform.tfvars')
    exists = file_exists(tfvars_path)
    
    return jsonify({
        'exists': exists
    })

# API endpoint to run terraform init
@app.route('/api/terraform/init', methods=['POST'])
def terraform_init():
    command_id = f"init_{int(time.time())}"
    
    # Run the command in a separate thread
    threading.Thread(
        target=run_command,
        args=(command_id, "terraform init"),
        daemon=True
    ).start()
    
    return jsonify({
        'command_id': command_id,
        'status': 'started'
    })

# API endpoint to run terraform validate
@app.route('/api/terraform/validate', methods=['POST'])
def terraform_validate():
    command_id = f"validate_{int(time.time())}"
    
    # Run the command in a separate thread
    threading.Thread(
        target=run_command,
        args=(command_id, "terraform validate"),
        daemon=True
    ).start()
    
    return jsonify({
        'command_id': command_id,
        'status': 'started'
    })

# API endpoint to run terraform plan
@app.route('/api/terraform/plan', methods=['POST'])
def terraform_plan():
    command_id = f"plan_{int(time.time())}"
    
    # Run the command in a separate thread
    threading.Thread(
        target=run_command,
        args=(command_id, "terraform plan"),
        daemon=True
    ).start()
    
    return jsonify({
        'command_id': command_id,
        'status': 'started'
    })

# API endpoint to run terraform apply
@app.route('/api/terraform/apply', methods=['POST'])
def terraform_apply():
    command_id = f"apply_{int(time.time())}"
    
    # Run the command in a separate thread
    threading.Thread(
        target=run_command,
        args=(command_id, "terraform apply -auto-approve"),
        daemon=True
    ).start()
    
    return jsonify({
        'command_id': command_id,
        'status': 'started'
    })

# API endpoint to check command status
@app.route('/api/command/<command_id>', methods=['GET'])
def check_command(command_id):
    if command_id not in command_outputs:
        return jsonify({
            'status': 'not_found',
            'output': ''
        }), 404
    
    return jsonify({
        'status': command_statuses.get(command_id, 'unknown'),
        'output': command_outputs.get(command_id, '')
    })