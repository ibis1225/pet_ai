variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "backend_cpu" { type = number }
variable "backend_memory" { type = number }
variable "backend_desired_count" { type = number }
variable "linebot_cpu" { type = number }
variable "linebot_memory" { type = number }
variable "linebot_desired_count" { type = number }
variable "db_endpoint" { type = string }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string }
variable "line_channel_access_token" { type = string }
variable "line_channel_secret" { type = string }
variable "openai_api_key" { type = string }

# ========================================
# Secrets Manager
# ========================================
resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}-${var.environment}-secrets"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL               = "mysql+aiomysql://${var.db_username}:${var.db_password}@${var.db_endpoint}/${var.db_name}"
    LINE_CHANNEL_ACCESS_TOKEN  = var.line_channel_access_token
    LINE_CHANNEL_SECRET        = var.line_channel_secret
    OPENAI_API_KEY             = var.openai_api_key
  })
}

# ========================================
# CloudWatch Log Groups
# ========================================
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}/backend"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "line_bot" {
  name              = "/ecs/${var.project_name}-${var.environment}/line-bot"
  retention_in_days = 30
}

# ========================================
# ECS Cluster
# ========================================
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ========================================
# ECR Repositories
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
# IAM Roles
# ========================================
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_secrets" {
  name = "${var.project_name}-${var.environment}-ecs-secrets"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_secretsmanager_secret.app_secrets.arn]
    }]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "${var.project_name}-${var.environment}-ecs-s3"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = ["*"]
    }]
  })
}

# ========================================
# ALB (Application Load Balancer)
# ========================================
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-${var.environment}-alb-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

resource "aws_lb_target_group" "line_bot" {
  name        = "${var.project_name}-${var.environment}-linebot"
  port        = 8001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# HTTP listener - default to backend API
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# LINE Bot routing: /webhook -> LINE Bot service
resource "aws_lb_listener_rule" "line_bot" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.line_bot.arn
  }

  condition {
    path_pattern {
      values = ["/webhook", "/webhook/*"]
    }
  }
}

# ========================================
# ECS Security Group
# ========================================
resource "aws_security_group" "ecs" {
  name_prefix = "${var.project_name}-${var.environment}-ecs-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ========================================
# Backend - Task Definition & Service
# ========================================
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.backend.repository_url}:latest"
    portMappings = [{ containerPort = 8000, protocol = "tcp" }]
    secrets = [
      { name = "DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:DATABASE_URL::" },
      { name = "LINE_CHANNEL_ACCESS_TOKEN", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:LINE_CHANNEL_ACCESS_TOKEN::" },
      { name = "LINE_CHANNEL_SECRET", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:LINE_CHANNEL_SECRET::" },
      { name = "OPENAI_API_KEY", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:OPENAI_API_KEY::" },
    ]
    environment = [
      { name = "APP_NAME", value = "PetAI" },
      { name = "DEBUG", value = "false" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project_name}-${var.environment}/backend"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs.id]
    subnets         = var.private_subnet_ids
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }
}

# ========================================
# LINE Bot - Task Definition & Service
# ========================================
resource "aws_ecs_task_definition" "line_bot" {
  family                   = "${var.project_name}-${var.environment}-line-bot"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.linebot_cpu
  memory                   = var.linebot_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "line-bot"
    image = "${aws_ecr_repository.line_bot.repository_url}:latest"
    portMappings = [{ containerPort = 8001, protocol = "tcp" }]
    secrets = [
      { name = "LINE_CHANNEL_ACCESS_TOKEN", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:LINE_CHANNEL_ACCESS_TOKEN::" },
      { name = "LINE_CHANNEL_SECRET", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:LINE_CHANNEL_SECRET::" },
      { name = "OPENAI_API_KEY", valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:OPENAI_API_KEY::" },
    ]
    environment = [
      { name = "BACKEND_API_URL", value = "http://${aws_lb.main.dns_name}/api/v1" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project_name}-${var.environment}/line-bot"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "line_bot" {
  name            = "${var.project_name}-${var.environment}-line-bot"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.line_bot.arn
  desired_count   = var.linebot_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs.id]
    subnets         = var.private_subnet_ids
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.line_bot.arn
    container_name   = "line-bot"
    container_port   = 8001
  }
}

# ========================================
# Outputs
# ========================================
output "cluster_name" { value = aws_ecs_cluster.main.name }
output "alb_dns_name" { value = aws_lb.main.dns_name }
output "backend_ecr_url" { value = aws_ecr_repository.backend.repository_url }
output "line_bot_ecr_url" { value = aws_ecr_repository.line_bot.repository_url }