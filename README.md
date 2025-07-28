# Simple n8n Deployment on AWS with Terraform

This Terraform configuration deploys n8n on an AWS EC2 instance with minimal setup. Just fill in your variables and run `terraform apply`.

## Features

- Automatic deployment of n8n on AWS EC2 (t2.micro)
- Docker-based installation with persistent storage
- Optional Cloudflare DNS integration
- Secure cookie setting disabled for easier access

## Quick Start

1. Copy one of the example configurations from `example-configs/` to `terraform.tfvars`
2. Update the values in `terraform.tfvars` with your credentials
3. Make sure you have an SSH key at the specified path
4. Run the following commands:

```
terraform init
terraform apply
```

5. Access your n8n instance at the URL shown in the output

## Configuration Options

- **Basic setup**: Uses only EC2 with a public IP (set `use_cloudflare = false`)
- **Cloudflare setup**: Uses a custom domain with Cloudflare (set `use_cloudflare = true`)

## Security Notes

- The configuration allows HTTP (port 80) and SSH (port 22) access
- AWS credentials are stored in `terraform.tfvars` (never commit this file)
- Data is persisted in a Docker volume named `n8n_data`
- The Docker container is configured to restart automatically unless explicitly stopped.
- Data is persisted using a Docker volume named `n8n_data`.