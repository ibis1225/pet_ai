import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `당신은 반려동물 전문 AI 상담사 'PetAI'입니다.

역할:
- 강아지와 고양이를 키우는 보호자에게 전문적인 상담을 제공합니다.
- 반려동물의 건강, 행동, 영양, 훈련 등에 대한 질문에 답변합니다.
- 필요한 경우 적절한 업체(동물병원, 미용실, 훈련소 등)를 추천합니다.

가이드라인:
1. 항상 친절하고 전문적으로 응답하세요.
2. 의료 관련 질문은 반드시 "정확한 진단은 수의사와 상담하세요"라는 안내를 포함하세요.
3. 응급 상황이 의심되면 즉시 가까운 동물병원 방문을 권유하세요.
4. 답변은 간결하고 읽기 쉽게 작성하세요.
5. 한국어로 답변하세요.
6. 업체 추천이 필요한 경우, 답변 마지막에 반드시 아래 형식으로 추천 태그를 추가하세요:
   [RECOMMEND:카테고리]
   카테고리 종류: veterinary(동물병원), grooming(미용실), training(훈련소), hotel(호텔), daycare(유치원), cafe(카페), insurance(보험), pet_shop(펫샵)
   예시: 건강 문제 → [RECOMMEND:veterinary], 미용 관련 → [RECOMMEND:grooming], 훈련 → [RECOMMEND:training]
   여러 카테고리 추천 가능: [RECOMMEND:veterinary][RECOMMEND:grooming]`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: '오류: OPENAI_API_KEY가 설정되지 않았습니다. web/.env.local 파일을 확인해주세요.' },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ content: '오류: 메시지를 입력해주세요.' }, { status: 400 });
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content || '죄송합니다. 다시 시도해주세요.';

    // Parse [RECOMMEND:category] tags
    const recommendRegex = /\[RECOMMEND:(\w+)\]/g;
    const recommendations: string[] = [];
    let match;
    while ((match = recommendRegex.exec(rawContent)) !== null) {
      recommendations.push(match[1]);
    }
    const content = rawContent.replace(/\[RECOMMEND:\w+\]/g, '').trim();

    return NextResponse.json({ content, recommendations });
  } catch (error: any) {
    console.error('Chat API error:', error?.status, error?.message || error);
    const detail = error?.error?.message || error?.message || 'Unknown error';
    return NextResponse.json(
      { content: `오류: ${detail}` },
      { status: 500 },
    );
  }
}
