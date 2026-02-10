terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "petai-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "petai-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PetAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}