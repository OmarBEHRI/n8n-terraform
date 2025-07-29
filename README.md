# n8n Deployment on AWS with Terraform

This Terraform configuration provides a straightforward way to deploy n8n on an AWS EC2 instance. It's designed for simplicity, allowing you to get n8n up and running quickly by filling in a few variables and executing `terraform apply`.

## Prerequisites

Before you begin, ensure you have the following:

1.  **AWS Account**: You must have an active AWS account. If you don't have one, you can create one at the [AWS website](https://aws.amazon.com/).
2.  **Domain Name**: You need a domain name registered with Cloudflare for DNS management. You can purchase a domain from any domain registrar and then transfer DNS management to Cloudflare.
3.  **Cloudflare Account**: You need a Cloudflare account to manage your domain's DNS. Sign up at [Cloudflare website](https://www.cloudflare.com/).
4.  **Terraform**: Ensure Terraform is installed on your local machine. You can download it from the [Terraform website](https://www.terraform.io/downloads.html).
5.  **AWS CLI (Optional but Recommended)**: The AWS Command Line Interface can be helpful for managing AWS resources and configuring credentials.
6.  **SSH Key Pair**: An SSH key pair is required to securely connect to your EC2 instance. If you don't have one, you'll need to generate it.

## Features

- Automatic deployment of n8n on AWS EC2 (t2.micro)
- Docker-based installation with persistent storage
- Cloudflare DNS integration for custom domain access
- Secure cookie setting disabled for easier access

## Quick Start

1. Copy the example configuration from `examples/terraform.tfvars.example` to `terraform.tfvars`
2. Follow the detailed instructions in `SETUP_GUIDE.md` to fill in the required information in your `terraform.tfvars` file
3. Make sure you have an SSH key at the specified path
4. Run the following commands:

```
terraform init
terraform apply
```

5. Access your n8n instance at the custom domain you specified

## Security Notes

- The configuration allows HTTP (port 80) and SSH (port 22) access
- AWS credentials are stored in `terraform.tfvars` (never commit this file)
- Data is persisted in a Docker volume named `n8n_data`
- The Docker container is configured to restart automatically unless explicitly stopped

## Example Configuration

An example configuration file is provided in the `examples` directory. Copy it to the root of your project and update it with your credentials:

```
cp examples/terraform.tfvars.example terraform.tfvars
```

Then follow the detailed instructions in `SETUP_GUIDE.md` to fill in the required information in your `terraform.tfvars` file.