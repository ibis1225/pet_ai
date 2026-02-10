# PetAI - 반려동물 상담 & 챗봇 플랫폼

## 프로젝트 개요

PetAI는 강아지/고양이 보호자를 위한 AI 기반 반려동물 상담 및 서비스 연결 플랫폼입니다.

**사업 목적**: 고객 상담, 업체 연결, 상품 판매
**타겟 고객**: 강아지 + 고양이 보호자
**타겟 업체**: 동물 미용실, 동물 병원, 상품 판매(옷/간식/사료/악세서리), 동물 보험사, 동물 호텔, 동물 훈련소, 동물 유치원 등

---

## 아키텍처

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  LINE Bot   │    │  Mobile App │    │  Admin Site  │
│  (Webhook)  │    │  (React     │    │  (Next.js)   │
│  Port 8001  │    │   Native)   │    │  Port 3000   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────┬───────┘──────────────────┘
                  │
         ┌────────▼────────┐
         │  Backend API    │
         │  (FastAPI)      │
         │  Port 8000      │
         └────┬───────┬────┘
              │       │
    ┌─────────▼──┐  ┌─▼──────────┐
    │  MySQL 8.4 │  │   Redis    │
    │   :3306    │  │   :6379    │
    └────────────┘  └────────────┘
              │
    ┌─────────▼──────────┐
    │  Claude AI (LLM)   │
    │  Anthropic API     │
    └────────────────────┘
```

## 디렉토리 구조

```
pet_ai/
├── backend/                  # FastAPI 백엔드 서버
│   ├── app/
│   │   ├── api/v1/endpoints/ # API 엔드포인트
│   │   │   ├── auth.py       #   인증 (회원가입/로그인)
│   │   │   ├── businesses.py #   업체 CRUD + 검색
│   │   │   ├── chat.py       #   AI 상담 채팅
│   │   │   ├── pets.py       #   반려동물 프로필 관리
│   │   │   └── products.py   #   상품 검색/조회
│   │   ├── core/             # 핵심 설정
│   │   │   ├── config.py     #   환경변수 설정
│   │   │   ├── database.py   #   DB 연결 (async SQLAlchemy)
│   │   │   └── security.py   #   JWT 인증/비밀번호 해싱
│   │   ├── models/           # SQLAlchemy ORM 모델
│   │   │   ├── user.py       #   사용자 (고객/업체/관리자)
│   │   │   ├── pet.py        #   반려동물 프로필
│   │   │   ├── business.py   #   업체 정보 (9개 카테고리)
│   │   │   ├── product.py    #   상품 (9개 카테고리)
│   │   │   ├── booking.py    #   예약
│   │   │   ├── review.py     #   리뷰
│   │   │   ├── chat.py       #   채팅 세션/메시지
│   │   │   └── order.py      #   주문/결제
│   │   ├── schemas/          # Pydantic 스키마 (요청/응답)
│   │   ├── services/
│   │   │   └── chat/
│   │   │       └── ai_consultant.py  # Claude AI 상담 서비스
│   │   └── utils/
│   ├── alembic/              # DB 마이그레이션
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── line-bot/                 # LINE 챗봇 서비스
│   ├── app/
│   │   ├── handlers/
│   │   │   ├── message_handler.py     # 메시지 처리
│   │   │   └── rich_menu_handler.py   # 리치 메뉴 관리
│   │   ├── services/
│   │   ├── config.py
│   │   └── main.py           # Webhook 서버
│   ├── Dockerfile
│   └── requirements.txt
│
├── admin/                    # 관리자 대시보드 (Next.js 15)
│   ├── src/
│   │   ├── app/              # App Router 페이지
│   │   │   ├── dashboard/    #   대시보드 (통계)
│   │   │   ├── users/        #   사용자 관리
│   │   │   ├── businesses/   #   업체 관리 (승인/거절)
│   │   │   ├── products/     #   상품 관리
│   │   │   ├── orders/       #   주문 관리
│   │   │   ├── chat-logs/    #   상담 로그 조회
│   │   │   └── settings/     #   시스템 설정
│   │   ├── components/
│   │   │   ├── layout/       #   레이아웃 (Sidebar 등)
│   │   │   ├── ui/           #   공통 UI 컴포넌트
│   │   │   ├── forms/        #   폼 컴포넌트
│   │   │   └── tables/       #   테이블 컴포넌트
│   │   ├── lib/api.ts        #   Axios API 클라이언트
│   │   └── types/index.ts    #   TypeScript 타입 정의
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── app/                      # 모바일 앱 (React Native - TBD)
│   └── src/
│
├── infra/                    # AWS 인프라 (Terraform)
│   └── terraform/
│       ├── main.tf           # Provider 설정
│       ├── variables.tf      # 변수 정의
│       ├── modules.tf        # 모듈 구성
│       ├── outputs.tf        # 출력값
│       └── modules/
│           ├── vpc/          # VPC, 서브넷, NAT Gateway
│           ├── ecs/          # ECS Fargate, ALB, ECR
│           ├── rds/          # MySQL 8.4 RDS
│           └── s3/           # 에셋 스토리지
│
├── docker-compose.yml        # 로컬 개발 환경
├── CLAUDE.md                 # 이 파일
└── .gitignore
```

## 기술 스택

| 컴포넌트 | 기술 | 버전 |
|----------|------|------|
| Backend API | Python FastAPI | 0.115+ |
| Database | MySQL (async) | 8.4 |
| ORM | SQLAlchemy (async) | 2.0+ |
| Migration | Alembic | 1.14+ |
| Cache | Redis | 7 |
| LINE Bot | line-bot-sdk Python | 3.14+ |
| AI/LLM | Anthropic Claude API | - |
| Admin Site | Next.js (App Router) | 15 |
| Admin UI | Tailwind CSS | 4.0 |
| Admin State | Zustand + React Query | - |
| Mobile App | React Native (planned) | - |
| Infra | Terraform on AWS | 1.5+ |
| Container | Docker + ECS Fargate | - |

## 로컬 개발 환경 실행

```bash
# 1. 환경변수 설정
cp backend/.env.example backend/.env
# .env 파일에 API 키 입력

# 2. Docker Compose로 전체 서비스 실행
docker compose up -d

# 3. 개별 서비스 실행 (개발 시)
# Backend:
cd backend && uvicorn app.main:app --reload --port 8000

# Admin:
cd admin && npm install && npm run dev

# LINE Bot:
cd line-bot && uvicorn app.main:app --reload --port 8001
```

## 주요 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/v1/auth/register | 회원가입 |
| POST | /api/v1/auth/login | 로그인 |
| GET/POST | /api/v1/pets | 반려동물 목록/등록 |
| GET/POST | /api/v1/businesses | 업체 검색/등록 |
| GET | /api/v1/products | 상품 검색 |
| POST | /api/v1/chat/message | AI 상담 메시지 전송 |
| GET | /health | 서버 상태 확인 |

## 데이터 모델 요약

### 사용자 (User)
- 역할: customer, business_owner, admin, super_admin
- 인증: local, LINE, Google, Apple

### 반려동물 (Pet)
- 종류: dog, cat
- 프로필: 이름, 품종, 성별, 생년월일, 체중, 중성화 여부

### 업체 (Business) - 9개 카테고리
grooming(미용실), veterinary(병원), pet_shop(상품판매), insurance(보험), hotel(호텔), training(훈련소), daycare(유치원), cafe(카페), funeral(장례)

### 상품 (Product) - 9개 카테고리
food(사료), treats(간식), clothing(옷), accessories(악세서리), toys(장난감), health(건강용품), grooming(미용용품), housing(하우스), other

### 주문 (Order)
- 상태: pending → paid → preparing → shipped → delivered
- 결제: credit_card, line_pay, bank_transfer, cash_on_delivery

### 채팅 (ChatSession/ChatMessage)
- 채널: LINE, App, Web
- AI 액션: recommend_business, recommend_product, create_booking

## 코드 컨벤션

### Python (Backend)
- Python 3.12+, 타입 힌트 필수
- async/await 패턴 사용 (비동기 DB 쿼리)
- Pydantic v2 스키마로 요청/응답 검증
- 모든 UUID는 uuid4 사용
- 시간은 UTC timezone-aware datetime 사용

### TypeScript (Admin)
- Strict mode 활성화
- Next.js App Router 사용 (src/app/)
- Tailwind CSS로 스타일링
- zod + react-hook-form으로 폼 검증
- 서버 통신은 src/lib/api.ts의 Axios 인스턴스 사용

### Terraform (Infra)
- 모듈화 구조 (modules/ 디렉토리)
- 환경별 tfvars 파일 분리
- S3 + DynamoDB로 state 관리

## AWS 인프라 구성

- **VPC**: 2 public + 2 private 서브넷, NAT Gateway
- **ECS Fargate**: Backend API + LINE Bot 컨테이너
- **ALB**: HTTP/HTTPS 로드밸런서
- **RDS**: MySQL 8.4 (private 서브넷)
- **S3**: 이미지/에셋 스토리지 (암호화, 버저닝)
- **ECR**: Docker 이미지 레지스트리
- **리전**: ap-northeast-2 (서울)

## 주의사항

- `.env` 파일은 절대 커밋하지 않음 (`.gitignore`에 포함)
- DB 비밀번호, API 키 등 민감 정보는 환경변수로 관리
- `backend/.env.example`을 참고하여 `.env` 파일 생성
- LINE Bot webhook URL은 HTTPS 필수 (로컬 개발 시 ngrok 사용)
- AI 상담에서 의료 관련 답변 시 반드시 수의사 상담 권유 포함