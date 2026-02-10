"""
Consultation Flow Service

Manages the 10-step consultation state machine.
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
    ConsultationStep.URGENCY: "긴급도를 선택해주세요.",
    ConsultationStep.DESCRIPTION: "상세한 문의 내용을 입력해주세요\n\n예시:\n• 증상이 언제부터 시작되었나요?\n• 어떤 증상이 있나요?\n• 기타 특이사항",
    ConsultationStep.PREFERRED_TIME: "선호하는 상담 시간대를 선택해주세요 🕐",
    ConsultationStep.COMPLETED: "✅ 상담 신청이 완료되었습니다!",
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

    def get_step_prompt(self, step: ConsultationStep) -> str:
        """Get the prompt message for a step."""
        return STEP_PROMPTS.get(step, "")

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

            return next_step, self.get_step_prompt(next_step)

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
        category_map = {
            "건강": ConsultationCategory.HEALTH,
            "질병": ConsultationCategory.HEALTH,
            "health": ConsultationCategory.HEALTH,
            "영양": ConsultationCategory.NUTRITION,
            "사료": ConsultationCategory.NUTRITION,
            "nutrition": ConsultationCategory.NUTRITION,
            "행동": ConsultationCategory.BEHAVIOR,
            "behavior": ConsultationCategory.BEHAVIOR,
            "미용": ConsultationCategory.GROOMING,
            "관리": ConsultationCategory.GROOMING,
            "grooming": ConsultationCategory.GROOMING,
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
