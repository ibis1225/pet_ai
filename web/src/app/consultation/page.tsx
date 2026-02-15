'use client';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  assigned: '배정됨',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const CATEGORY_LABELS: Record<string, string> = {
  veterinary: '수의 상담',
  grooming: '미용 상담',
  nutrition: '영양/사료',
  behavior: '행동 문제',
  training: '훈련/교육',
  hotel: '호텔/위탁',
  daycare: '유치원',
  insurance: '보험',
  shopping: '용품 추천',
  emergency: '응급 상담',
  other: '기타',
};

// Placeholder - no consultations yet
const consultations: any[] = [];

export default function ConsultationPage() {
  if (consultations.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">상담 내역</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-base font-semibold text-gray-600">상담 내역이 없습니다</p>
          <p className="text-sm text-gray-400">AI 상담 또는 전문 상담을 시작해보세요</p>
          <Link href="/chat" className="mt-2 px-6 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl">
            상담 시작
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">상담 내역</h1>
      </div>
      <div className="p-4 space-y-3">
        {consultations.map((item: any) => (
          <Link key={item.id} href={`/consultation/${item.id}`} className="block bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-gray-900">{item.consultation_number}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-500'}`}>
                {STATUS_LABELS[item.status] || item.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📁</span>
                <span>{CATEGORY_LABELS[item.category] || '미분류'}</span>
              </div>
              {item.pet_name && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>🐾</span>
                  <span>{item.pet_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🕐</span>
                <span>{item.created_at}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
