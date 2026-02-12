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
  subnet_ids     = module.vpc.private_subnet_ids
  instance_class = var.db_instance_class
  db_name        = var.db_name
  db_username    = var.db_username
  db_password    = var.db_password
}

module "ecs" {
  source = "./modules/ecs"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  private_subnet_ids    = module.vpc.private_subnet_ids

  # Backend
  backend_cpu           = var.backend_cpu
  backend_memory        = var.backend_memory
  backend_desired_count = var.backend_desired_count

  # LINE Bot
  linebot_cpu           = var.linebot_cpu
  linebot_memory        = var.linebot_memory
  linebot_desired_count = var.linebot_desired_count

  # Database
  db_endpoint           = module.rds.endpoint
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password

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