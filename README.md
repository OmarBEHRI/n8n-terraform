# n8n AWS Deployment Project

This project provides a comprehensive solution for deploying an n8n instance on AWS with a focus on cost-efficiency, potentially as low as $2 a year for AWS Free Tier eligible accounts.

## Project Overview

This repository contains a web application (frontend and Flask backend) that guides users through the n8n deployment process on AWS. It leverages Terraform for provisioning the necessary AWS infrastructure, including an EC2 instance running an n8n Docker container.

## Approaches to Deployment

There are two primary ways to deploy n8n using this project:

### 1. Quick Approach (Recommended for ease of use)

This method utilizes a setup wizard to streamline the deployment process.

**For Windows Users:**

1.  Run the `start_wizard.bat` script located in the project root:

    ```bash
    start_wizard.bat
    ```

    This script will:
    *   Install Python dependencies for the backend.
    *   Start the Flask backend server.
    *   Automatically open your web browser to the setup wizard interface (`http://localhost:5000`).

2.  Follow the on-screen instructions provided by the setup wizard to configure and deploy your n8n instance.

**For Linux/macOS Users:**

1.  Run the `start_wizard.sh` script located in the project root:

    ```bash
    ./start_wizard.sh
    ```

    This script will:
    *   Install Python dependencies for the backend.
    *   Start the Flask backend server.
    *   Automatically open your web browser to the setup wizard interface (`http://localhost:5000`).

2.  Follow the on-screen instructions provided by the setup wizard to configure and deploy your n8n instance.

### 2. Manual Setup Guide (For advanced users or specific configurations)

This approach involves manually configuring the Terraform variables and running Terraform commands.

1.  **Configure `terraform.tfvars`:**

    Copy the example Terraform variables file and then edit it with your specific AWS and Cloudflare (optional) credentials:

    ```bash
    cp terraform/examples/terraform.tfvars.example terraform/terraform.tfvars
    ```

    Refer to the detailed instructions in the [SETUP_GUIDE.md](SETUP_GUIDE.md) to know how to get the values for each variable (`access_key`, `secret_key`, `region`, `ami_id`, `public_key_path`, `use_cloudflare`, `cloudflare_api_token`, `cloudflare_zone_id`, `dns_name`).


2.  **Deploy with Terraform:**

    Navigate to the `terraform` directory and initialize Terraform, then apply the configuration:

    ```bash
    cd terraform
    terraform init
    terraform apply
    ```

    Follow the prompts to confirm the deployment.

## Accessing your n8n Instance

After a successful Terraform deployment (either via the wizard or manual steps), Terraform will output the URL for your n8n instance. Use this URL to access n8n in your web browser.

## SSH Access to EC2 Instance

To connect to your EC2 instance via SSH:

```bash
ssh -i ~/.ssh/id_rsa ec2-user@<public_ip_or_dns_name>
```

On Windows (using PowerShell or Git Bash):

```powershell
ssh -i $env:USERPROFILE\.ssh\id_rsa ec2-user@<public_ip_or_dns_name>
```

Replace `<public_ip_or_dns_name>` with the actual public IP or DNS name of your EC2 instance.

## Troubleshooting

Refer to the <mcfile name="SETUP_GUIDE.md" path="c:\Users\Asus\Desktop\N8N\Terraform Setup\SETUP_GUIDE.md"></mcfile> for common troubleshooting steps related to DNS, SSH, and n8n access issues.