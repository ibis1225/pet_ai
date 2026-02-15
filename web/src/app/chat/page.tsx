'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: string[];
}

const CATEGORY_INFO: Record<string, { icon: string; label: string }> = {
  veterinary: { icon: '🏥', label: '주변 동물병원 찾기' },
  grooming: { icon: '✂️', label: '주변 미용실 찾기' },
  training: { icon: '🎓', label: '주변 훈련소 찾기' },
  hotel: { icon: '🏨', label: '주변 호텔 찾기' },
  daycare: { icon: '🧒', label: '주변 유치원 찾기' },
  cafe: { icon: '☕', label: '주변 카페 찾기' },
  insurance: { icon: '🛡️', label: '반려동물 보험 찾기' },
  pet_shop: { icon: '🏪', label: '주변 펫샵 찾기' },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! PetAI입니다.\n반려동물에 대해 무엇이든 물어보세요!\n\n건강, 미용, 훈련 등 상담 후 주변 업체도 찾아드려요.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRecommendClick = (category: string) => {
    trackEvent({
      type: 'chat_recommendation',
      category,
      source: 'chat',
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, history }),
      });
      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || '죄송합니다. 다시 시도해주세요.',
        recommendations: data.recommendations,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 md:px-6 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center">
          <span className="text-sm">🐾</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">PetAI 상담</h1>
          <p className="text-xs text-gray-400">AI 반려동물 상담</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id}>
                <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
                      <span className="text-xs">🐾</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] md:max-w-[60%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#FF6B35] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>

                {/* Recommendation Buttons */}
                {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="ml-10 mt-2 flex flex-wrap gap-2">
                    {msg.recommendations.map((cat) => {
                      const info = CATEGORY_INFO[cat];
                      if (!info) return null;
                      return (
                        <Link
                          key={cat}
                          href={`/business?cat=${cat}`}
                          onClick={() => handleRecommendClick(cat)}
                          className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-white text-xs font-medium px-3 py-2 rounded-full hover:bg-[#e55a2b] transition shadow-sm"
                        >
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-gray-400 ml-1">AI가 답변 중...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            maxLength={1000}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none resize-none max-h-24 focus:ring-2 focus:ring-[#FF6B35]/30"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
              inputText.trim() ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
