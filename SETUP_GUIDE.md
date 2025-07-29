# n8n Setup Guide

This guide provides detailed instructions on how to deploy n8n on AWS using Terraform.

## Step-by-Step Configuration

### 1. Configure your `terraform.tfvars` file

This file will hold all the sensitive variables for your Terraform deployment. **Do not commit this file to version control.**

First, copy the example configuration file from the `examples` directory to the root of your Terraform project:  

```bash
cp examples/terraform.tfvars.example terraform.tfvars
```

Then edit the `terraform.tfvars` file with your specific credentials. The example file looks like this:

```terraform.tfvars.example
# AWS Credentials
access_key = "YOUR_AWS_ACCESS_KEY"
secret_key = "YOUR_AWS_SECRET_KEY"
region = "us-east-1"
ami_id = "ami-08a6efd148b1f7504" # Example: Amazon Linux 2 AMI for us-east-1

# SSH Key
public_key_path = "~/.ssh/id_rsa.pub" # Path to your SSH public key

# Cloudflare DNS Configuration
use_cloudflare = true # Enable Cloudflare DNS integration
cloudflare_api_token = "YOUR_CLOUDFLARE_API_TOKEN"
cloudflare_zone_id = "YOUR_CLOUDFLARE_ZONE_ID"
dns_name = "n8n.yourdomain.com"
```

Now, let's go through each variable and explain how to obtain its value:

#### `access_key` and `secret_key` (AWS IAM User Credentials)

These are your AWS Access Key ID and Secret Access Key. It is highly recommended to create a dedicated IAM user with programmatic access for Terraform, rather than using your root account credentials.

**How to obtain:**

1.  Go to the AWS Management Console.
2.  Navigate to **IAM** (Identity and Access Management).
3.  In the left navigation pane, choose **Users**.
4.  Click **Add user**.
5.  Enter a **User name** (e.g., `terraform-n8n-user`).
6.  For **Select AWS access type**, choose **Programmatic access**.
7.  Click **Next: Permissions**.
8.  Attach the necessary policies. For simplicity, you can attach `AdministratorAccess` for initial setup, but for production, it's best practice to create a custom policy with only the required permissions (EC2, VPC, S3, Route 53 if using DNS).
9.  Click **Next: Tags** (optional).
10. Click **Next: Review**.
11. Click **Create user**.
12. On the **Success** page, you will see the **Access key ID** and **Secret access key**. **Copy these values immediately** as the secret access key will not be shown again. Store them securely.

#### `region` (AWS Region)

This specifies the AWS region where your resources will be deployed (e.g., `us-east-1`, `eu-west-1`).

**How to obtain:**

-   You can find a list of AWS regions in the AWS documentation or simply choose the one geographically closest to you for lower latency.

#### `ami_id` (Amazon Machine Image ID)

This is the ID of the Amazon Machine Image (AMI) that will be used to launch your EC2 instance. The example uses an Amazon Linux 2 AMI.

**How to obtain:**

1.  Go to the AWS Management Console.
2.  Navigate to **EC2**.
3.  In the left navigation pane, under **Instances**, click **AMIs**.
4.  Search for a suitable AMI (e.g., "Amazon Linux 2"). Ensure you select an AMI for the `region` you specified.

#### `public_key_path` (SSH Public Key Path)

This is the local path to your SSH public key (`.pub` file). This key will be used to connect to your EC2 instance via SSH.

**How to obtain:**

1.  **Generate an SSH key pair** (if you don't have one):
    -   On Linux/macOS, open a terminal and run: `ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_n8n` (replace `id_rsa_n8n` with a name you prefer).
    -   On Windows, you can use Git Bash or PuTTYgen. Save the public key in a `.pub` format.
2.  **Locate the public key**: The command above will generate `id_rsa_n8n` (private key) and `id_rsa_n8n.pub` (public key) in your `~/.ssh/` directory. Provide the full path to the `.pub` file.

#### `use_cloudflare` (Boolean)

This should be set to `true` to enable Cloudflare DNS integration, which provides a custom domain for your n8n instance.

#### `cloudflare_api_token` (Cloudflare API Token)

This is your Cloudflare API Token with permissions to edit DNS records for your zone.

**How to obtain:**

1.  Log in to your Cloudflare account.
2.  Go to **My Profile** (top right corner) -> **API Tokens**.
3.  Click **Create Token**.
4.  Use the template **Edit Cloudflare DNS** or create a custom token with Zone -> DNS -> Edit permissions for your specific domain.
5.  Copy the generated token.

#### `cloudflare_zone_id` (Cloudflare Zone ID)

This is the Zone ID for your domain in Cloudflare.

**How to obtain:**

1.  Log in to your Cloudflare account.
2.  Select your domain from the dashboard.
3.  On the right sidebar, under **API**, you will find the **Zone ID**.

#### `dns_name` (Custom Domain Name)

This is the full domain name you want to use for your n8n instance (e.g., `n8n.yourdomain.com`).

## Deploy with Terraform

Once your `terraform.tfvars` file is configured, navigate to the `Terraform Setup` directory in your terminal and run the following commands:

```bash
terraform init
terraform apply
```

Follow the prompts to confirm the deployment.

## Access your n8n instance

After a successful `terraform apply`, Terraform will output the URL for your n8n instance. Use this URL to access n8n in your web browser.

## SSH Access

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

-   **DNS issues**: DNS changes may take time to propagate. Use `nslookup` or `dig` to check DNS resolution.
-   **SSH issues**: Ensure your SSH key exists at the specified `public_key_path` and has correct permissions (e.g., `chmod 400 ~/.ssh/id_rsa`). Also, verify that the security group allows SSH access (port 22).
-   **n8n access**: Verify that the security group allows HTTP access (port 80) and that the n8n Docker container is running on the EC2 instance.