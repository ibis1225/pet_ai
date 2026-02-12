# ========================================
# EC2-based deployment (replaces ECS Fargate)
# Single t4g.small runs all services via Docker Compose + Nginx
# Cost: ~$12-20/mo vs ECS+ALB+NAT ~$77/mo
# ========================================

variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "ec2_instance_type" {
  type    = string
  default = "t4g.small"
}
variable "ec2_volume_size" {
  type    = number
  default = 30
}

# Database
variable "db_endpoint" { type = string }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string }

# Secrets
variable "line_channel_access_token" { type = string }
variable "line_channel_secret" { type = string }
variable "openai_api_key" { type = string }

# ========================================
# Secrets Manager (keep secrets secure)
# ========================================
resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}-${var.environment}-secrets"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL              = "mysql+aiomysql://${var.db_username}:${var.db_password}@${var.db_endpoint}/${var.db_name}"
    LINE_CHANNEL_ACCESS_TOKEN = var.line_channel_access_token
    LINE_CHANNEL_SECRET       = var.line_channel_secret
    OPENAI_API_KEY            = var.openai_api_key
  })
}

# ========================================
# CloudWatch Log Groups
# ========================================
resource "aws_cloudwatch_log_group" "ec2" {
  name              = "/ec2/${var.project_name}-${var.environment}"
  retention_in_days = 14
}

# ========================================
# ECR Repositories (for Docker images)
# ========================================
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "line_bot" {
  name                 = "${var.project_name}-line-bot"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# ========================================
# SSH Key Pair
# ========================================
resource "aws_key_pair" "ec2" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = file("${path.module}/ec2_key.pub")

  lifecycle {
    ignore_changes = [public_key]
  }
}

# ========================================
# IAM Role for EC2
# ========================================
resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# ECR pull + Secrets Manager read + S3 access + CloudWatch logs
resource "aws_iam_role_policy" "ec2_policy" {
  name = "${var.project_name}-${var.environment}-ec2-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [aws_secretsmanager_secret.app_secrets.arn]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
        ]
        Resource = ["${aws_cloudwatch_log_group.ec2.arn}:*"]
      },
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# ========================================
# EC2 Security Group
# ========================================
resource "aws_security_group" "ec2" {
  name_prefix = "${var.project_name}-${var.environment}-ec2-"
  vpc_id      = var.vpc_id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # HTTP (Nginx)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # HTTPS (Nginx TLS)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-${var.environment}-ec2-sg" }
}

# ========================================
# Elastic IP (static public IP)
# ========================================
resource "aws_eip" "ec2" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-${var.environment}-ec2-eip" }
}

resource "aws_eip_association" "ec2" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.ec2.id
}

# ========================================
# EC2 Instance (t4g.small - Graviton ARM)
# ========================================

# Latest Amazon Linux 2023 ARM AMI
data "aws_ami" "al2023_arm" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-arm64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.al2023_arm.id
  instance_type          = var.ec2_instance_type
  key_name               = aws_key_pair.ec2.key_name
  vpc_security_group_ids = [aws_security_group.ec2.id]
  subnet_id              = var.public_subnet_ids[0]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.ec2_volume_size
    encrypted             = true
    delete_on_termination = true
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region    = var.aws_region
    project_name  = var.project_name
    environment   = var.environment
    secret_arn    = aws_secretsmanager_secret.app_secrets.arn
    backend_ecr   = aws_ecr_repository.backend.repository_url
    linebot_ecr   = aws_ecr_repository.line_bot.repository_url
    db_endpoint   = var.db_endpoint
    db_name       = var.db_name
  }))

  tags = {
    Name = "${var.project_name}-${var.environment}-server"
  }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# ========================================
# Outputs
# ========================================
output "ec2_public_ip" { value = aws_eip.ec2.public_ip }
output "ec2_instance_id" { value = aws_instance.main.id }
output "backend_ecr_url" { value = aws_ecr_repository.backend.repository_url }
output "line_bot_ecr_url" { value = aws_ecr_repository.line_bot.repository_url }
output "security_group_id" { value = aws_security_group.ec2.id }
