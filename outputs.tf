output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.n8n_instance.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.n8n_eip.public_ip
}

output "instance_dns" {
  description = "DNS name for accessing the n8n instance"
  value       = "http://${var.dns_name}"
}

output "ssh_connection" {
  description = "SSH connection string"
  value       = "ssh -i ${var.public_key_path} ec2-user@${aws_eip.n8n_eip.public_ip}"
}