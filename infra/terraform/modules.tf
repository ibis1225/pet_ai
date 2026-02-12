module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "rds" {
  source = "./modules/rds"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.public_subnet_ids
  instance_class = var.db_instance_class
  db_name        = var.db_name
  db_username    = var.db_username
  db_password    = var.db_password
}

module "ec2" {
  source = "./modules/ecs"

  project_name      = var.project_name
  environment       = var.environment
  aws_region        = var.aws_region
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids

  # EC2
  ec2_instance_type = var.ec2_instance_type
  ec2_volume_size   = var.ec2_volume_size

  # Database
  db_endpoint = module.rds.endpoint
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password

  # Secrets
  line_channel_access_token = var.line_channel_access_token
  line_channel_secret       = var.line_channel_secret
  openai_api_key            = var.openai_api_key
}

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}