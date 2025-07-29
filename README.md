# n8n Deployment on AWS with Terraform

This Terraform configuration provides a straightforward way to deploy n8n on an AWS EC2 instance. It's designed for simplicity, allowing you to get n8n up and running quickly by filling in a few variables and executing `terraform apply`.

## Setup Wizard (New!)

We now provide an interactive setup wizard to help you configure and deploy your n8n instance. The wizard includes:

- Step-by-step interface with detailed instructions
- Built-in guides for AWS IAM user setup and Cloudflare configuration
- Automatic `terraform.tfvars` file generation (the button is disabled after generation)
- Real-time Terraform command execution (the "Run Terraform" button changes to "Deploy n8n Instance" and is disabled after deployment)
- Interactive terminal output

### Using the Setup Wizard

#### Quick Start Scripts

We provide convenient scripts to start the setup wizard with a single command:

- **Windows**: Double-click `start_wizard.bat` or run it from the command prompt
- **Linux/macOS**: Run `./start_wizard.sh` (you may need to make it executable first with `chmod +x start_wizard.sh`)

These scripts will automatically install Python requirements, start the Flask backend server, and open the setup wizard in your browser.

#### Manual Start

Alternatively, you can start the wizard manually:

1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the Flask backend server:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to http://localhost:5000

4. Follow the on-screen instructions to complete the setup

## Prerequisites

Before you begin, ensure you have the following:

1.  **AWS Account**: You must have an active AWS account. If you don't have one, you can create one at the [AWS website](https://aws.amazon.com/).
2.  **Domain Name**: You need a domain name registered with Cloudflare for DNS management. You can purchase a domain from any domain registrar and then transfer DNS management to Cloudflare, or purchase directly from Cloudflare for easier setup.
3.  **Cloudflare Account**: You need a Cloudflare account to manage your domain's DNS. Sign up at [Cloudflare website](https://www.cloudflare.com/).
4.  **Terraform**: Ensure Terraform is installed on your local machine. You can download it from the [Terraform website](https://www.terraform.io/downloads.html).
5.  **Python 3.6+**: Required for the setup wizard (if using it).
6.  **AWS CLI (Optional but Recommended)**: The AWS Command Line Interface can be helpful for managing AWS resources and configuring credentials.
7.  **SSH Key Pair**: An SSH key pair is required to securely connect to your EC2 instance. If you don't have one, you'll need to generate it.

### Environment Check

You can verify that your environment meets all the requirements by running the included check script:

```bash
python check_environment.py
```

This script will check for Python version, Terraform installation, required Python packages, file permissions, and AWS CLI installation, and provide guidance if any issues are found.

## Important Warnings

### AWS Costs

Running `terraform apply` will create real AWS resources that **will incur costs** on your AWS account. The default configuration uses a t2.micro EC2 instance. For new AWS accounts, this instance is typically eligible for the AWS Free Tier. If you are not eligible for the Free Tier, the estimated cost for running the n8n instance is approximately $8.50 per month. Costs may still be incurred if:

- You've exhausted your Free Tier eligibility
- You keep the instance running for an extended period
- You deploy additional resources

Always remember to destroy resources you no longer need with `terraform destroy` to avoid unexpected charges.

### Data Security

The setup wizard stores sensitive information like AWS credentials and Cloudflare API tokens in the `terraform.tfvars` file. This file should **never** be committed to version control or shared publicly. The wizard includes warnings and confirmation dialogs before performing operations that might affect your data or incur costs.

## Features

- Interactive setup wizard with step-by-step guidance
- Detailed AWS IAM and Cloudflare setup guides with screenshots
- Automatic deployment of n8n on AWS EC2 (t2.micro)
- Docker-based installation with persistent storage
- Cloudflare DNS integration for custom domain access
- Secure cookie setting disabled for easier access
- Real-time Terraform command execution with live output (the "Run Terraform" button changes to "Deploy n8n Instance" and is disabled after deployment)
- Automatic terraform.tfvars file generation

## Quick Start

### Option 1: Using the Setup Wizard (Recommended)

**Using the start scripts:**

- **Windows**: Double-click `start_wizard.bat` or run it from the command prompt
- **Linux/macOS**: Run `./start_wizard.sh` (you may need to make it executable first with `chmod +x start_wizard.sh`)

**Or manually:**

1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the Flask backend server:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to http://localhost:5000

4. Follow the on-screen instructions to complete the setup and deployment

### Option 2: Manual Configuration

1. Copy the example configuration from `examples/terraform.tfvars.example` to `terraform.tfvars`
2. Follow the detailed instructions in `SETUP_GUIDE.md` to fill in the required information in your `terraform.tfvars` file
3. Make sure you have an SSH key at the specified path
4. Run the following commands:

   ```bash
   terraform init
   terraform validate
   terraform plan
   terraform apply
   ```

5. Access your n8n instance at the custom domain you specified

## Security Notes

- The configuration allows HTTP (port 80) and SSH (port 22) access
- AWS credentials are stored in `terraform.tfvars` (never commit this file)
- Data is persisted in a Docker volume named `n8n_data`
- The Docker container is configured to restart automatically unless explicitly stopped

## Troubleshooting

### Setup Wizard Issues

- **Backend server not available**: Make sure the Flask server is running on port 5000. If you see a warning about the backend server not being available, check that you've installed the required Python packages and started the server correctly.

- **Terraform not found**: Ensure that Terraform is installed and available in your system PATH. The backend server needs to be able to execute Terraform commands.

- **Permission denied errors**: Make sure the user running the Flask server has permission to write to the directory and execute Terraform commands.

### Deployment Issues

- **AWS credential errors**: Verify that your AWS access key and secret key are correct and have the necessary permissions to create EC2 instances, security groups, etc.

- **SSH key errors**: Ensure that the SSH public key path is correct and the file exists. The key should be in the correct format (typically starting with `ssh-rsa`).

- **Cloudflare API errors**: Check that your Cloudflare API token and Zone ID are correct. The API token should have the necessary permissions to create DNS records.

- **Terraform execution errors**: If Terraform commands fail, check the terminal output for specific error messages. Common issues include missing required variables, invalid variable values, or AWS resource limits.

## Cleanup

To clean up your environment or destroy resources when you're done, you can use the included cleanup script:

```bash
python cleanup.py
```

This interactive script allows you to:

1. Clean up Terraform files (.terraform directory, .tfstate files, etc.)
2. Clean up Python cache files (__pycache__ directories)
3. Destroy AWS resources created by Terraform

**Warning**: The "Destroy AWS resources" option will run `terraform destroy`, which will permanently delete all AWS resources created by this project. Make sure you understand the implications before using this option.

## Example Configuration

An example configuration file is provided in the `examples` directory. Copy it to the root of your project and update it with your credentials:

```
cp examples/terraform.tfvars.example terraform.tfvars
```

Then follow the detailed instructions in `SETUP_GUIDE.md` to fill in the required information in your `terraform.tfvars` file.

## Flask Backend API

The setup wizard includes a Flask backend server that provides the following API endpoints:

- **GET /**: Serves the main setup wizard HTML page
- **GET /<path:path>**: Serves static files (CSS, JavaScript, etc.)
- **GET /api/check-tfvars**: Checks if terraform.tfvars exists
  - Returns: `{"exists": true/false}`
- **POST /api/save-tfvars**: Saves terraform.tfvars file
  - Request body: `{"content": "...", "overwrite": true/false}`
  - Returns: `{"success": true/false, "message": "...", "path": "..."}`
- **POST /api/terraform/init**: Runs terraform init
  - Returns: `{"command_id": "...", "status": "started"}`
- **POST /api/terraform/validate**: Runs terraform validate
  - Returns: `{"command_id": "...", "status": "started"}`
- **POST /api/terraform/plan**: Runs terraform plan
  - Returns: `{"command_id": "...", "status": "started"}`
- **POST /api/terraform/apply**: Runs terraform apply with auto-approve
  - Returns: `{"command_id": "...", "status": "started"}`
- **GET /api/command/<command_id>**: Checks command status
  - Returns: `{"status": "running/done/error", "output": "..."}`

### Extending the Backend

If you want to extend the functionality of the backend, you can modify the `app.py` file. The backend is built with Flask and uses standard Python libraries for file operations and subprocess management.