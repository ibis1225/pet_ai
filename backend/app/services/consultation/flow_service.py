"""
Consultation Flow Service

Manages the 11-step consultation state machine.
Handles step transitions and data validation.
"""

from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consultation import (
    Consultation,
    ConsultationCategory,
    ConsultationStatus,
    ConsultationStep,
    ConsultationUrgency,
    DailyConsultationCounter,
    MemberType,
    PetType,
)


# Step order for the consultation flow
STEP_ORDER = [
    ConsultationStep.MEMBER_TYPE,
    ConsultationStep.GUARDIAN_NAME,
    ConsultationStep.GUARDIAN_PHONE,
    ConsultationStep.PET_TYPE,
    ConsultationStep.PET_NAME,
    ConsultationStep.PET_AGE,
    ConsultationStep.CATEGORY,
    ConsultationStep.SUBCATEGORY,
    ConsultationStep.URGENCY,
    ConsultationStep.DESCRIPTION,
    ConsultationStep.PREFERRED_TIME,
    ConsultationStep.COMPLETED,
]

# Step prompts for Korean UI
STEP_PROMPTS = {
    ConsultationStep.MEMBER_TYPE: "회원 유형을 선택해주세요.",
    ConsultationStep.GUARDIAN_NAME: "보호자님의 성함을 입력해주세요.",
    ConsultationStep.GUARDIAN_PHONE: "📞 연락처를 입력해주세요\n\n예시: 010-1234-5678",
    ConsultationStep.PET_TYPE: "반려동물 종류를 선택해주세요 🐾",
    ConsultationStep.PET_NAME: "반려동물의 이름을 입력해주세요.",
    ConsultationStep.PET_AGE: "🎂 반려동물의 나이를 입력해주세요\n\n예시: 3살 또는 3",
    ConsultationStep.CATEGORY: "상담 카테고리를 선택해주세요 📋",
    ConsultationStep.SUBCATEGORY: "세부 상담 항목을 선택해주세요.",
    ConsultationStep.URGENCY: "긴급도를 선택해주세요.",
    ConsultationStep.DESCRIPTION: "상세한 문의 내용을 입력해주세요.",
    ConsultationStep.PREFERRED_TIME: "선호하는 상담 시간대를 선택해주세요 🕐",
    ConsultationStep.COMPLETED: "✅ 상담 신청이 완료되었습니다!",
}

# Subcategories per category
SUBCATEGORIES = {
    ConsultationCategory.VETERINARY: {
        "checkup": "🩺 건강검진",
        "vaccination": "💉 예방접종",
        "disease": "🏥 질병치료",
        "surgery": "🔬 수술상담",
        "dental": "🦷 치과진료",
        "skin": "🐾 피부질환",
    },
    ConsultationCategory.GROOMING: {
        "full_grooming": "✂️ 전체미용",
        "bath": "🛁 목욕",
        "partial": "🎀 부분미용 (얼굴/발/위생)",
        "style": "💇 스타일 상담",
    },
    ConsultationCategory.NUTRITION: {
        "food_recommend": "🍖 사료 추천",
        "diet": "⚖️ 다이어트 상담",
        "allergy": "🤧 알러지/식이 상담",
        "supplement": "💊 영양제 상담",
        "homemade": "🍳 수제간식/자연식",
    },
    ConsultationCategory.BEHAVIOR: {
        "barking": "🗣️ 짖음/소음",
        "aggression": "😡 공격성",
        "anxiety": "😰 분리불안",
        "toilet": "🚽 배변훈련",
        "socialization": "🤝 사회화 문제",
    },
    ConsultationCategory.TRAINING: {
        "basic": "📚 기본 훈련 (앉아/기다려)",
        "obedience": "🎖️ 복종 훈련",
        "agility": "🏃 어질리티/운동",
        "puppy": "🐕 퍼피 교육 (사회화)",
        "special": "⭐ 특수 훈련 (치료견 등)",
    },
    ConsultationCategory.HOTEL: {
        "daycare_hotel": "☀️ 데이케어 (당일)",
        "short_stay": "🌙 단기 위탁 (1-3일)",
        "long_stay": "📅 장기 위탁 (4일+)",
        "pickup": "🚗 픽업 서비스",
    },
    ConsultationCategory.DAYCARE: {
        "regular": "📆 정기 등원",
        "trial": "🎯 체험 등원",
        "program": "📋 프로그램 문의",
        "fee": "💰 비용 문의",
    },
    ConsultationCategory.INSURANCE: {
        "health_plan": "🏥 건강보험 (질병/수술)",
        "accident_plan": "🚑 상해보험",
        "liability": "📋 배상책임보험",
        "compare": "🔍 보험 비교 상담",
    },
    ConsultationCategory.SHOPPING: {
        "food_shop": "🍖 사료/간식",
        "clothing": "👕 의류/악세서리",
        "toys": "🎾 장난감",
        "health_goods": "💊 건강용품",
        "housing": "🏠 하우스/캐리어",
        "grooming_goods": "🧴 미용용품",
    },
    ConsultationCategory.EMERGENCY: {
        "accident": "🚨 사고/외상",
        "poison": "☠️ 중독 (음식/화학물질)",
        "breathing": "😮‍💨 호흡곤란",
        "seizure": "⚡ 경련/발작",
        "other_emergency": "🆘 기타 응급",
    },
    ConsultationCategory.OTHER: {
        "adoption": "🐶 입양/분양 상담",
        "funeral": "🕯️ 장례/추모",
        "travel": "✈️ 여행/이동",
        "law": "⚖️ 반려동물 법률 상담",
        "etc": "📌 기타 문의",
    },
}

# Category-specific description prompts
CATEGORY_DESCRIPTION_PROMPTS = {
    ConsultationCategory.VETERINARY: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 현재 증상 (언제부터, 어떤 증상)\n"
        "• 기존 질병 이력\n"
        "• 복용 중인 약\n"
        "• 최근 예방접종 여부"
    ),
    ConsultationCategory.GROOMING: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 반려동물 품종\n"
        "• 원하는 미용 스타일\n"
        "• 피부 질환 여부\n"
        "• 미용 경험 (처음/경험 있음)"
    ),
    ConsultationCategory.NUTRITION: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 현재 급여 중인 사료\n"
        "• 알러지 유무\n"
        "• 체중 및 목표\n"
        "• 특이 식습관"
    ),
    ConsultationCategory.BEHAVIOR: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 문제 행동 설명\n"
        "• 언제부터 시작되었는지\n"
        "• 어떤 상황에서 발생하는지\n"
        "• 시도해본 교정 방법"
    ),
    ConsultationCategory.TRAINING: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 반려동물 품종 및 나이\n"
        "• 현재 훈련 수준\n"
        "• 원하는 훈련 목표\n"
        "• 선호하는 훈련 방식 (방문/출장)"
    ),
    ConsultationCategory.HOTEL: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 맡기실 기간 (체크인/체크아웃)\n"
        "• 반려동물 성격 (활발/조용)\n"
        "• 특별 관리 사항 (약 복용 등)\n"
        "• 사료 지참 여부"
    ),
    ConsultationCategory.DAYCARE: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 등원 희망 요일/시간\n"
        "• 반려동물 성격\n"
        "• 다른 동물과의 사회성\n"
        "• 특이사항 (알러지, 약 복용 등)"
    ),
    ConsultationCategory.INSURANCE: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 반려동물 나이 및 품종\n"
        "• 기존 질병 이력\n"
        "• 원하는 보장 범위\n"
        "• 월 보험료 예산"
    ),
    ConsultationCategory.SHOPPING: (
        "아래 내용을 포함해서 작성해주세요:\n\n"
        "• 찾고 있는 상품\n"
        "• 반려동물 크기/품종\n"
        "• 예산 범위\n"
        "• 선호 브랜드 (있으면)"
    ),
    ConsultationCategory.EMERGENCY: (
        "🚨 응급 상황 정보를 알려주세요:\n\n"
        "• 현재 증상 (최대한 상세히)\n"
        "• 발생 시간\n"
        "• 삼킨 물질 (중독인 경우)\n"
        "• 현재 위치\n\n"
        "⚠️ 위급한 경우 가까운 24시 동물병원에 먼저 연락하세요!"
    ),
    ConsultationCategory.OTHER: (
        "상담 내용을 자유롭게 작성해주세요.\n\n"
        "• 문의 내용을 상세히 적어주시면\n  더 정확한 상담이 가능합니다."
    ),
}


class ConsultationFlowService:
    """Manages the consultation flow state machine."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_consultation_number(self) -> str:
        """Generate unique consultation number (e.g., C20260201-001)."""
        today = datetime.now(timezone.utc)
        date_str = today.strftime("%Y%m%d")

        # Get or create daily counter
        result = await self.db.execute(
            select(DailyConsultationCounter).where(
                DailyConsultationCounter.date_str == date_str
            )
        )
        counter_record = result.scalar_one_or_none()

        if counter_record:
            counter_record.counter += 1
            counter = counter_record.counter
        else:
            counter_record = DailyConsultationCounter(
                date_str=date_str,
                counter=1
            )
            self.db.add(counter_record)
            counter = 1

        await self.db.flush()
        return f"C{date_str}-{counter:03d}"

    async def create_consultation(
        self,
        channel: str = "line",
        channel_user_id: str | None = None,
    ) -> Consultation:
        """Create a new consultation and start the flow."""
        consultation_number = await self.generate_consultation_number()

        consultation = Consultation(
            consultation_number=consultation_number,
            channel=channel,
            channel_user_id=channel_user_id,
            current_step=ConsultationStep.MEMBER_TYPE,
            status=ConsultationStatus.IN_PROGRESS,
        )
        self.db.add(consultation)
        await self.db.flush()
        await self.db.refresh(consultation)

        return consultation

    async def get_consultation_by_channel_user(
        self,
        channel_user_id: str,
        channel: str = "line",
    ) -> Consultation | None:
        """Get active consultation for a channel user."""
        result = await self.db.execute(
            select(Consultation).where(
                Consultation.channel_user_id == channel_user_id,
                Consultation.channel == channel,
                Consultation.status == ConsultationStatus.IN_PROGRESS,
            ).order_by(Consultation.created_at.desc())
        )
        return result.scalar_one_or_none()

    async def get_consultation(self, consultation_id) -> Consultation | None:
        """Get consultation by ID."""
        result = await self.db.execute(
            select(Consultation).where(Consultation.id == consultation_id)
        )
        return result.scalar_one_or_none()

    async def get_consultation_by_number(
        self,
        consultation_number: str
    ) -> Consultation | None:
        """Get consultation by consultation number."""
        result = await self.db.execute(
            select(Consultation).where(
                Consultation.consultation_number == consultation_number
            )
        )
        return result.scalar_one_or_none()

    def get_next_step(self, current_step: ConsultationStep) -> ConsultationStep | None:
        """Get the next step in the flow."""
        try:
            current_index = STEP_ORDER.index(current_step)
            if current_index < len(STEP_ORDER) - 1:
                return STEP_ORDER[current_index + 1]
        except ValueError:
            pass
        return None

    def get_step_prompt(self, step: ConsultationStep, consultation: Consultation | None = None) -> str:
        """Get the prompt message for a step."""
        if step == ConsultationStep.DESCRIPTION and consultation and consultation.category:
            return CATEGORY_DESCRIPTION_PROMPTS.get(
                consultation.category,
                STEP_PROMPTS.get(step, ""),
            )
        return STEP_PROMPTS.get(step, "")

    def get_subcategories(self, category: ConsultationCategory) -> dict[str, str]:
        """Get subcategories for a given category."""
        return SUBCATEGORIES.get(category, {})

    async def process_step(
        self,
        consultation: Consultation,
        value: str,
    ) -> tuple[ConsultationStep | None, str]:
        """
        Process user input for current step and advance to next.
        Returns (next_step, message).
        """
        current_step = consultation.current_step

        # Validate and store the value
        validation_result = self._validate_and_store(consultation, current_step, value)
        if not validation_result["valid"]:
            return current_step, validation_result["message"]

        # Get next step
        next_step = self.get_next_step(current_step)

        if next_step:
            consultation.current_step = next_step

            # If completed, update status
            if next_step == ConsultationStep.COMPLETED:
                consultation.status = ConsultationStatus.PENDING
                consultation.completed_at = datetime.now(timezone.utc)

            await self.db.flush()
            await self.db.refresh(consultation)

            return next_step, self.get_step_prompt(next_step, consultation)

        return None, "상담 흐름이 완료되었습니다."

    def _validate_and_store(
        self,
        consultation: Consultation,
        step: ConsultationStep,
        value: str,
    ) -> dict:
        """Validate input and store in consultation."""
        value = value.strip()

        if step == ConsultationStep.MEMBER_TYPE:
            member_type = self._parse_member_type(value)
            if not member_type:
                return {
                    "valid": False,
                    "message": "개인 회원 또는 기업/단체 회원을 선택해주세요.",
                }
            consultation.member_type = member_type

        elif step == ConsultationStep.GUARDIAN_NAME:
            if len(value) < 2:
                return {
                    "valid": False,
                    "message": "올바른 이름을 입력해주세요.",
                }
            consultation.guardian_name = value

        elif step == ConsultationStep.GUARDIAN_PHONE:
            phone = self._normalize_phone(value)
            if not phone:
                return {
                    "valid": False,
                    "message": "올바른 전화번호를 입력해주세요. (예: 010-1234-5678)",
                }
            consultation.guardian_phone = phone

        elif step == ConsultationStep.PET_TYPE:
            pet_type = self._parse_pet_type(value)
            if not pet_type:
                return {
                    "valid": False,
                    "message": "강아지, 고양이, 또는 기타를 선택해주세요.",
                }
            consultation.pet_type = pet_type

        elif step == ConsultationStep.PET_NAME:
            if len(value) < 1:
                return {
                    "valid": False,
                    "message": "반려동물 이름을 입력해주세요.",
                }
            consultation.pet_name = value

        elif step == ConsultationStep.PET_AGE:
            consultation.pet_age = value

        elif step == ConsultationStep.CATEGORY:
            category = self._parse_category(value)
            if not category:
                return {
                    "valid": False,
                    "message": "상담 분야를 선택해주세요.",
                }
            consultation.category = category

        elif step == ConsultationStep.SUBCATEGORY:
            if consultation.category:
                valid_subs = SUBCATEGORIES.get(consultation.category, {})
                if value not in valid_subs and value not in valid_subs.values():
                    return {
                        "valid": False,
                        "message": "세부 항목을 선택해주세요.",
                    }
            consultation.subcategory = value

        elif step == ConsultationStep.URGENCY:
            urgency = self._parse_urgency(value)
            if not urgency:
                return {
                    "valid": False,
                    "message": "긴급도를 선택해주세요.",
                }
            consultation.urgency = urgency

        elif step == ConsultationStep.DESCRIPTION:
            if len(value) < 10:
                return {
                    "valid": False,
                    "message": "상담 내용을 10자 이상 자세히 작성해주세요.",
                }
            consultation.description = value

        elif step == ConsultationStep.PREFERRED_TIME:
            consultation.preferred_time = value

        return {"valid": True, "message": ""}

    def _parse_member_type(self, value: str) -> MemberType | None:
        """Parse member type from user input."""
        value_lower = value.lower()
        if "개인" in value or "personal" in value_lower:
            return MemberType.PERSONAL
        elif "기업" in value or "단체" in value or "corporate" in value_lower:
            return MemberType.CORPORATE
        return None

    def _parse_pet_type(self, value: str) -> PetType | None:
        """Parse pet type from user input."""
        value_lower = value.lower()
        if "강아지" in value or "개" in value or "dog" in value_lower:
            return PetType.DOG
        elif "고양이" in value or "냥" in value or "cat" in value_lower:
            return PetType.CAT
        elif "기타" in value or "other" in value_lower:
            return PetType.OTHER
        return None

    def _parse_category(self, value: str) -> ConsultationCategory | None:
        """Parse consultation category from user input."""
        # Direct enum value match
        try:
            return ConsultationCategory(value)
        except ValueError:
            pass

        category_map = {
            "병원": ConsultationCategory.VETERINARY,
            "건강": ConsultationCategory.VETERINARY,
            "질병": ConsultationCategory.VETERINARY,
            "veterinary": ConsultationCategory.VETERINARY,
            "미용": ConsultationCategory.GROOMING,
            "grooming": ConsultationCategory.GROOMING,
            "영양": ConsultationCategory.NUTRITION,
            "사료": ConsultationCategory.NUTRITION,
            "nutrition": ConsultationCategory.NUTRITION,
            "행동": ConsultationCategory.BEHAVIOR,
            "behavior": ConsultationCategory.BEHAVIOR,
            "훈련": ConsultationCategory.TRAINING,
            "training": ConsultationCategory.TRAINING,
            "호텔": ConsultationCategory.HOTEL,
            "돌봄": ConsultationCategory.HOTEL,
            "hotel": ConsultationCategory.HOTEL,
            "유치원": ConsultationCategory.DAYCARE,
            "daycare": ConsultationCategory.DAYCARE,
            "보험": ConsultationCategory.INSURANCE,
            "insurance": ConsultationCategory.INSURANCE,
            "쇼핑": ConsultationCategory.SHOPPING,
            "상품": ConsultationCategory.SHOPPING,
            "구매": ConsultationCategory.SHOPPING,
            "shopping": ConsultationCategory.SHOPPING,
            "응급": ConsultationCategory.EMERGENCY,
            "emergency": ConsultationCategory.EMERGENCY,
            "기타": ConsultationCategory.OTHER,
            "other": ConsultationCategory.OTHER,
        }
        value_lower = value.lower()
        for key, cat in category_map.items():
            if key in value_lower:
                return cat
        return None

    def _parse_urgency(self, value: str) -> ConsultationUrgency | None:
        """Parse urgency level from user input."""
        value_lower = value.lower()
        if "긴급" in value or "urgent" in value_lower:
            return ConsultationUrgency.URGENT
        elif "보통" in value or "일반" in value or "normal" in value_lower:
            return ConsultationUrgency.NORMAL
        elif "여유" in value or "flexible" in value_lower:
            return ConsultationUrgency.FLEXIBLE
        return None

    def _normalize_phone(self, value: str) -> str | None:
        """Normalize phone number to standard format."""
        import re
        digits = re.sub(r"[^0-9]", "", value)
        if len(digits) == 11 and digits.startswith("010"):
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        elif len(digits) == 10:
            return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
        return None

    async def cancel_consultation(self, consultation: Consultation) -> None:
        """Cancel an in-progress consultation."""
        consultation.status = ConsultationStatus.CANCELLED
        await self.db.flush()

    async def get_stats(self) -> dict:
        """Get consultation statistics."""
        from sqlalchemy import func

        # Total counts by status
        status_counts = {}
        for status in ConsultationStatus:
            result = await self.db.execute(
                select(func.count(Consultation.id)).where(
                    Consultation.status == status
                )
            )
            status_counts[status.value] = result.scalar() or 0

        # Today's count
        today = datetime.now(timezone.utc).date()
        today_result = await self.db.execute(
            select(func.count(Consultation.id)).where(
                func.date(Consultation.created_at) == today
            )
        )
        today_count = today_result.scalar() or 0

        # By category
        category_counts = {}
        for category in ConsultationCategory:
            result = await self.db.execute(
                select(func.count(Consultation.id)).where(
                    Consultation.category == category
                )
            )
            category_counts[category.value] = result.scalar() or 0

        # By urgency
        urgency_counts = {}
        for urgency in ConsultationUrgency:
            result = await self.db.execute(
                select(func.count(Consultation.id)).where(
                    Consultation.urgency == urgency
                )
            )
            urgency_counts[urgency.value] = result.scalar() or 0

        total = sum(status_counts.values())

        return {
            "total_consultations": total,
            "in_progress": status_counts.get("in_progress", 0),
            "pending": status_counts.get("pending", 0),
            "assigned": status_counts.get("assigned", 0),
            "completed": status_counts.get("completed", 0),
            "cancelled": status_counts.get("cancelled", 0),
            "today_count": today_count,
            "by_category": category_counts,
            "by_urgency": urgency_counts,
        }
