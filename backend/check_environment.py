#!/usr/bin/env python3

import sys
import os
import platform
import subprocess
import shutil

# ANSI colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_status(message, status, details=None):
    status_color = {
        'OK': Colors.GREEN,
        'WARNING': Colors.YELLOW,
        'ERROR': Colors.RED
    }.get(status, '')
    
    print(f"{message:<40} [{status_color}{status}{Colors.END}]")
    if details:
        print(f"  {details}")
    print()

def check_python_version():
    required_major = 3
    required_minor = 6
    
    current_major = sys.version_info.major
    current_minor = sys.version_info.minor
    
    if current_major > required_major or (current_major == required_major and current_minor >= required_minor):
        print_status("Python version", "OK", f"Found Python {current_major}.{current_minor}")
        return True
    else:
        print_status("Python version", "ERROR", 
                    f"Found Python {current_major}.{current_minor}, but Python {required_major}.{required_minor}+ is required")
        return False

def check_terraform():
    terraform_path = shutil.which('terraform')
    if terraform_path:
        try:
            result = subprocess.run(['terraform', '--version'], 
                                   stdout=subprocess.PIPE, 
                                   stderr=subprocess.PIPE, 
                                   text=True, 
                                   check=True)
            version = result.stdout.split('\n')[0]
            print_status("Terraform installation", "OK", version)
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            print_status("Terraform installation", "ERROR", "Terraform command failed")
            return False
    else:
        print_status("Terraform installation", "ERROR", "Terraform not found in PATH")
        return False

def check_flask_dependencies():
    try:
        import flask
        import flask_cors
        print_status("Flask dependencies", "OK", f"Flask {flask.__version__} and Flask-CORS {flask_cors.__version__} installed")
        return True
    except ImportError as e:
        module_name = str(e).split("'")[1] if "'" in str(e) else "required modules"
        print_status("Flask dependencies", "ERROR", f"Missing {module_name}. Run 'pip install -r requirements.txt'")
        return False

def check_file_permissions():
    current_dir = os.getcwd()
    test_file_path = os.path.join(current_dir, '.permission_test')
    
    try:
        # Try to write to current directory
        with open(test_file_path, 'w') as f:
            f.write('test')
        os.remove(test_file_path)
        print_status("File permissions", "OK", f"Write access to {current_dir}")
        return True
    except (IOError, PermissionError) as e:
        print_status("File permissions", "ERROR", f"Cannot write to {current_dir}: {str(e)}")
        return False

def check_aws_cli():
    aws_path = shutil.which('aws')
    if aws_path:
        try:
            result = subprocess.run(['aws', '--version'], 
                                   stdout=subprocess.PIPE, 
                                   stderr=subprocess.PIPE, 
                                   text=True, 
                                   check=True)
            version = result.stdout if result.stdout else result.stderr
            print_status("AWS CLI installation", "OK", version)
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            print_status("AWS CLI installation", "WARNING", "AWS CLI command failed (optional but recommended)")
            return True  # Not critical
    else:
        print_status("AWS CLI installation", "WARNING", "AWS CLI not found in PATH (optional but recommended)")
        return True  # Not critical

def main():
    print(f"{Colors.BOLD}n8n Terraform Setup Wizard - Environment Check{Colors.END}\n")
    print(f"System: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    print(f"Working directory: {os.getcwd()}\n")
    
    python_ok = check_python_version()
    terraform_ok = check_terraform()
    flask_ok = check_flask_dependencies()
    permissions_ok = check_file_permissions()
    check_aws_cli()  # Optional, not counted in final result
    
    print("\n" + "-" * 60)
    if all([python_ok, terraform_ok, flask_ok, permissions_ok]):
        print(f"\n{Colors.GREEN}{Colors.BOLD}Environment check passed!{Colors.END}")
        print("You can now run the setup wizard using:")
        if platform.system() == 'Windows':
            print("  - Double-click start_wizard.bat")
            print("  - Or run it from command prompt")
        else:
            print("  - Run ./start_wizard.sh (make it executable first with chmod +x start_wizard.sh)")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}Environment check failed!{Colors.END}")
        print("Please fix the issues above before running the setup wizard.")
    print("\n" + "-" * 60)

if __name__ == "__main__":
    main()