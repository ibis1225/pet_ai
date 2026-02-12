terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Initial setup: use local backend
  # After S3 bucket is created, migrate to S3 backend:
  # backend "s3" {
  #   bucket         = "petai-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   dynamodb_table = "petai-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key

  default_tags {
    tags = {
      Project     = "PetAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}