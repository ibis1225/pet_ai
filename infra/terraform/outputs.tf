output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ec2_public_ip" {
  description = "EC2 server public IP (use for LINE webhook, SSH)"
  value       = module.ec2.ec2_public_ip
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "backend_ecr_url" {
  description = "Backend ECR repository URL"
  value       = module.ec2.backend_ecr_url
}

output "line_bot_ecr_url" {
  description = "LINE Bot ECR repository URL"
  value       = module.ec2.line_bot_ecr_url
}

output "assets_bucket" {
  description = "S3 assets bucket name"
  value       = module.s3.assets_bucket_name
}