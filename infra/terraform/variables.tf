variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
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
  description = "RDS instance class (Graviton for cost savings)"
  type        = string
  default     = "db.t4g.micro"
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

# EC2
variable "ec2_instance_type" {
  description = "EC2 instance type (Graviton ARM)"
  type        = string
  default     = "t4g.small"
}

variable "ec2_volume_size" {
  description = "EC2 root volume size in GB (gp3)"
  type        = number
  default     = 30
}

# Secrets (API Keys)
variable "line_channel_access_token" {
  description = "LINE Channel Access Token"
  type        = string
  sensitive   = true
}

variable "line_channel_secret" {
  description = "LINE Channel Secret"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}