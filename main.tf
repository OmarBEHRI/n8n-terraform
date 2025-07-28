# AWS Provider Configuration
provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

# EC2 Instance
resource "aws_instance" "n8n_instance" {
  ami                    = var.ami_id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.n8n_sg.id]
  key_name               = aws_key_pair.n8n_key_pair.key_name
  subnet_id              = aws_subnet.n8n_subnet.id
  user_data              = <<-EOF
    #!/bin/bash
    # Install Docker
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
    
    # Run n8n
    sudo docker volume create n8n_data
    sudo docker run -d --restart unless-stopped --name n8n -p 80:5678 -e N8N_SECURE_COOKIE=false -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
  EOF

  tags = {
    Name = "n8n-instance"
  }
}

# Security Group
resource "aws_security_group" "n8n_sg" {
  name        = "n8n-security-group"
  description = "Allow HTTP and SSH traffic"
  vpc_id      = aws_vpc.n8n_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "n8n-sg"
  }
}

# SSH Key Pair
resource "aws_key_pair" "n8n_key_pair" {
  key_name   = "n8n-key-pair"
  public_key = file(var.public_key_path)
}

# Elastic IP
resource "aws_eip" "n8n_eip" {
  instance = aws_instance.n8n_instance.id
  domain   = "vpc"
}

# Cloudflare Provider Configuration
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Cloudflare DNS Record
resource "cloudflare_dns_record" "n8n_dns" {
  count   = var.use_cloudflare ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = var.dns_name
  content = aws_eip.n8n_eip.public_ip
  type    = "A"
  ttl     = 1 # Auto
  proxied = false
}

# VPC
resource "aws_vpc" "n8n_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "n8n-vpc"
  }
}

# Subnet
resource "aws_subnet" "n8n_subnet" {
  vpc_id                  = aws_vpc.n8n_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "n8n-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "n8n_igw" {
  vpc_id = aws_vpc.n8n_vpc.id
  tags = {
    Name = "n8n-igw"
  }
}

# Route Table
resource "aws_route_table" "n8n_route_table" {
  vpc_id = aws_vpc.n8n_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.n8n_igw.id
  }
  tags = {
    Name = "n8n-route-table"
  }
}

# Route Table Association
resource "aws_route_table_association" "n8n_route_table_association" {
  subnet_id      = aws_subnet.n8n_subnet.id
  route_table_id = aws_route_table.n8n_route_table.id
}