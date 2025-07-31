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

# API endpoint to run terraform destroy
@app.route('/api/terraform/destroy', methods=['POST'])
def terraform_destroy():
    command_id = f"destroy_{int(time.time())}"
    
    # Run the command in a separate thread
    threading.Thread(
        target=run_command,
        args=(command_id, "terraform destroy -auto-approve"),
        daemon=True
    ).start()
    
    return jsonify({
        'command_id': command_id,
        'status': 'started'
    })

# API endpoint to check terraform state and get outputs
@app.route('/api/terraform/status', methods=['GET'])
def terraform_status():
    tfstate_path = os.path.join(TERRAFORM_DIR, 'terraform.tfstate')
    
    # Check if terraform.tfstate exists
    if not file_exists(tfstate_path):
        return jsonify({
            'provisioned': False,
            'message': 'No terraform state file found'
        })
    
    try:
        # Read the terraform state file
        with open(tfstate_path, 'r') as f:
            state_data = json.load(f)
        
        # Check if there are any resources in the state
        resources = state_data.get('resources', [])
        if not resources:
            return jsonify({
                'provisioned': False,
                'message': 'No resources found in state file'
            })
        
        # Try to get outputs using terraform output command
        try:
            result = subprocess.run(
                ['terraform', 'output', '-json'],
                cwd=TERRAFORM_DIR,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                outputs = json.loads(result.stdout)
                return jsonify({
                    'provisioned': True,
                    'outputs': {
                        'instance_id': outputs.get('instance_id', {}).get('value', ''),
                        'instance_public_ip': outputs.get('instance_public_ip', {}).get('value', ''),
                        'instance_dns': outputs.get('instance_dns', {}).get('value', ''),
                        'ssh_connection': outputs.get('ssh_connection', {}).get('value', '')
                    }
                })
            else:
                # If terraform output fails, still return provisioned=True but without outputs
                return jsonify({
                    'provisioned': True,
                    'message': 'Resources exist but could not retrieve outputs',
                    'outputs': {}
                })
        
        except (subprocess.TimeoutExpired, subprocess.SubprocessError, json.JSONDecodeError) as e:
            # If terraform output fails, still return provisioned=True but without outputs
            return jsonify({
                'provisioned': True,
                'message': f'Resources exist but could not retrieve outputs: {str(e)}',
                'outputs': {}
            })
    
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return jsonify({
            'provisioned': False,
            'message': f'Error reading state file: {str(e)}'
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