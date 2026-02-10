"""
PetAI Consultant - AI-powered pet consultation service.

This service handles:
- Pet health/behavior consultations
- Business recommendations (vet, grooming, etc.)
- Product recommendations
- Booking assistance
"""

import json
from typing import Any

import anthropic

from app.core.config import settings

SYSTEM_PROMPT = """당신은 반려동물 전문 AI 상담사 'PetAI'입니다.

역할:
- 강아지와 고양이를 키우는 보호자에게 전문적인 상담을 제공합니다.
- 반려동물의 건강, 행동, 영양, 훈련 등에 대한 질문에 답변합니다.
- 필요한 경우 적절한 업체(동물병원, 미용실, 훈련소 등)를 추천합니다.
- 상품 구매에 대한 조언을 제공합니다.

가이드라인:
1. 항상 친절하고 전문적으로 응답하세요.
2. 의료 관련 질문은 반드시 "정확한 진단은 수의사와 상담하세요"라는 안내를 포함하세요.
3. 응급 상황이 의심되면 즉시 가까운 동물병원 방문을 권유하세요.
4. 사용자의 반려동물 정보(종류, 나이, 품종 등)를 파악하여 맞춤형 답변을 제공하세요.
5. 업체나 상품을 추천할 때는 사용자의 위치와 반려동물 특성을 고려하세요.

응답 시 다음 액션을 JSON으로 제안할 수 있습니다:
- {"action": "recommend_business", "category": "veterinary", "reason": "..."}
- {"action": "recommend_product", "category": "food", "pet_type": "dog", "reason": "..."}
- {"action": "create_booking", "business_category": "grooming", "reason": "..."}
- {"action": "none"} (단순 상담인 경우)

응답 형식:
먼저 사용자에게 친절한 답변을 제공하고, 마지막 줄에 [ACTION: {...}] 형식으로 액션을 포함하세요.
"""


class PetAIConsultant:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def consult(
        self,
        user_message: str,
        conversation_history: list[dict] | None = None,
        pet_context: dict | None = None,
    ) -> dict[str, Any]:
        """Process a consultation message and return AI response with optional actions."""
        messages = []

        if conversation_history:
            messages.extend(conversation_history)

        # Add pet context if available
        context_note = ""
        if pet_context:
            context_note = f"\n\n[사용자 반려동물 정보: {json.dumps(pet_context, ensure_ascii=False)}]"

        messages.append({
            "role": "user",
            "content": user_message + context_note,
        })

        response = await self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )

        response_text = response.content[0].text

        # Parse action from response
        action = {"action": "none"}
        if "[ACTION:" in response_text:
            try:
                action_str = response_text.split("[ACTION:")[1].split("]")[0].strip()
                action = json.loads(action_str)
                response_text = response_text.split("[ACTION:")[0].strip()
            except (json.JSONDecodeError, IndexError):
                pass

        return {
            "response": response_text,
            "action_type": action.get("action"),
            "action_data": action if action.get("action") != "none" else None,
        }


pet_consultant = PetAIConsultant()
