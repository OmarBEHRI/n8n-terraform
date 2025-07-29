#!/usr/bin/env python3

import os
import sys
import shutil
import subprocess
from pathlib import Path

# ANSI colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(message):
    print(f"\n{Colors.BOLD}{message}{Colors.END}")
    print("-" * 60)

def print_status(message, status):
    status_color = {
        'OK': Colors.GREEN,
        'WARNING': Colors.YELLOW,
        'ERROR': Colors.RED
    }.get(status, '')
    
    print(f"{message:<40} [{status_color}{status}{Colors.END}]")

def get_confirmation(message):
    while True:
        response = input(f"{message} (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        print("Please enter 'y' or 'n'.")

def cleanup_terraform_files():
    print_header("Cleaning up Terraform files")
    
    # Files to remove
    files_to_remove = [
        'terraform.tfvars',
        '.terraform.lock.hcl',
        'terraform.tfstate',
        'terraform.tfstate.backup'
    ]
    
    # Check for .terraform directory
    terraform_dir = Path('.terraform')
    if terraform_dir.exists() and terraform_dir.is_dir():
        if get_confirmation(f"Remove {terraform_dir} directory?"):
            try:
                shutil.rmtree(terraform_dir)
                print_status(f"Removed {terraform_dir} directory", "OK")
            except Exception as e:
                print_status(f"Failed to remove {terraform_dir}: {str(e)}", "ERROR")
    
    # Check for individual files
    for file_name in files_to_remove:
        file_path = Path(file_name)
        if file_path.exists() and file_path.is_file():
            if get_confirmation(f"Remove {file_path}?"):
                try:
                    os.remove(file_path)
                    print_status(f"Removed {file_path}", "OK")
                except Exception as e:
                    print_status(f"Failed to remove {file_path}: {str(e)}", "ERROR")

def cleanup_python_cache():
    print_header("Cleaning up Python cache files")
    
    # Find all __pycache__ directories
    pycache_dirs = list(Path('.').glob('**/__pycache__'))
    
    if not pycache_dirs:
        print("No Python cache directories found.")
        return
    
    for pycache_dir in pycache_dirs:
        if get_confirmation(f"Remove {pycache_dir} directory?"):
            try:
                shutil.rmtree(pycache_dir)
                print_status(f"Removed {pycache_dir} directory", "OK")
            except Exception as e:
                print_status(f"Failed to remove {pycache_dir}: {str(e)}", "ERROR")

def destroy_terraform_resources():
    print_header("Destroying Terraform resources")
    
    # Check if terraform is installed
    if shutil.which('terraform') is None:
        print_status("Terraform not found in PATH", "ERROR")
        return
    
    # Check if terraform.tfstate exists
    if not Path('terraform.tfstate').exists():
        print("No terraform.tfstate file found. There might be no resources to destroy.")
        if not get_confirmation("Continue anyway?"):
            return
    
    # Confirm destruction
    print(f"{Colors.RED}{Colors.BOLD}WARNING: This will destroy all AWS resources created by Terraform!{Colors.END}")
    print("This includes EC2 instances, security groups, and any other resources.")
    print("This action is IRREVERSIBLE and will result in DATA LOSS.")
    
    if not get_confirmation("Are you ABSOLUTELY SURE you want to destroy all resources?"):
        print("Destruction cancelled.")
        return
    
    # Double-check
    if not get_confirmation("Type 'yes' again to confirm destruction"):
        print("Destruction cancelled.")
        return
    
    # Run terraform destroy
    try:
        print("\nRunning 'terraform destroy -auto-approve'...\n")
        subprocess.run(['terraform', 'destroy', '-auto-approve'], check=True)
        print_status("Terraform resources destroyed", "OK")
    except subprocess.SubprocessError as e:
        print_status(f"Failed to destroy resources: {str(e)}", "ERROR")

def main():
    print(f"{Colors.BOLD}n8n Terraform Setup Wizard - Cleanup Utility{Colors.END}\n")
    print("This utility will help you clean up files and resources created by the setup wizard.")
    print("You can choose which items to clean up.")
    
    options = [
        ("Clean up Terraform files (.terraform, .tfstate, etc.)", cleanup_terraform_files),
        ("Clean up Python cache files (__pycache__)", cleanup_python_cache),
        ("Destroy AWS resources (terraform destroy)", destroy_terraform_resources)
    ]
    
    for i, (description, _) in enumerate(options, 1):
        print(f"{i}. {description}")
    
    print(f"q. Quit")
    
    while True:
        choice = input("\nEnter your choice (1-3, q): ").lower().strip()
        
        if choice == 'q':
            break
        
        try:
            index = int(choice) - 1
            if 0 <= index < len(options):
                _, function = options[index]
                function()
            else:
                print("Invalid choice. Please enter a number between 1 and 3.")
        except ValueError:
            print("Invalid input. Please enter a number or 'q'.")
    
    print(f"\n{Colors.GREEN}Cleanup completed.{Colors.END}")

if __name__ == "__main__":
    main()