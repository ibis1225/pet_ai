variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "petai"
}

# VPC
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# RDS
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "petai"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "petai_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ECS
variable "backend_cpu" {
  description = "Backend task CPU units"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend task memory (MiB)"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Number of backend tasks"
  type        = number
  default     = 1
}