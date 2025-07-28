# n8n Setup Guide

This guide provides a simple way to deploy n8n on AWS using Terraform.

## Quick Setup

1. **Configure your variables**
   - Copy an example configuration from `example-configs/` to `terraform.tfvars`
   - Update the values with your AWS credentials and preferences

2. **Deploy with Terraform**
   ```
   terraform init
   terraform apply
   ```

3. **Access your n8n instance**
   - Use the URL provided in the Terraform output

## Configuration Options

### Basic Setup (No Custom Domain)

```
# AWS Credentials
access_key = "your_aws_access_key"
secret_key = "your_aws_secret_key"
region = "us-east-1"
ami_id = "ami-08a6efd148b1f7504"  # Amazon Linux 2 AMI for us-east-1

# SSH Key
public_key_path = "~/.ssh/id_rsa.pub"  # Path to your SSH public key

# Disable DNS configuration
use_cloudflare = false
```

### Cloudflare DNS Setup

```
# AWS Credentials
access_key = "your_aws_access_key"
secret_key = "your_aws_secret_key"
region = "us-east-1"
ami_id = "ami-08a6efd148b1f7504"  # Amazon Linux 2 AMI for us-east-1

# SSH Key
public_key_path = "~/.ssh/id_rsa.pub"  # Path to your SSH public key

# Enable Cloudflare for DNS
use_cloudflare = true
cloudflare_api_token = "your_cloudflare_api_token"
cloudflare_zone_id = "your_cloudflare_zone_id"
dns_name = "n8n.yourdomain.com"
```

## SSH Access

Connect to your instance using:
```
ssh -i ~/.ssh/id_rsa ec2-user@<public_ip>
```

On Windows:
```
ssh -i $env:USERPROFILE\.ssh\id_rsa ec2-user@<public_ip>
```

## Troubleshooting

- **DNS issues**: DNS changes may take time to propagate
- **SSH issues**: Ensure your SSH key exists and has correct permissions
- **n8n access**: Verify security group allows HTTP access (port 80)