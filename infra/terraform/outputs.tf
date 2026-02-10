output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.ecs.alb_dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "backend_ecr_url" {
  description = "Backend ECR repository URL"
  value       = module.ecs.backend_ecr_url
}

output "line_bot_ecr_url" {
  description = "LINE Bot ECR repository URL"
  value       = module.ecs.line_bot_ecr_url
}

output "assets_bucket" {
  description = "S3 assets bucket name"
  value       = module.s3.assets_bucket_name
}