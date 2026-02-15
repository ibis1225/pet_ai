import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
5. 한국어로 답변하세요.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history
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

    const content = completion.choices[0]?.message?.content || '죄송합니다. 다시 시도해주세요.';

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error);
    const detail = error?.message || 'Unknown error';
    return NextResponse.json(
      { error: detail, content: `오류: ${detail}` },
      { status: 500 },
    );
  }
}
