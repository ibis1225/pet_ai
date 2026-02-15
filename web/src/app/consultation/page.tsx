'use client';
import Link from 'next/link';

const consultations: any[] = [];

export default function ConsultationPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white px-4 md:px-6 py-3 border-b border-gray-100 md:hidden">
          <h1 className="text-base font-bold text-gray-900">상담 내역</h1>
        </div>
        {consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-base font-semibold text-gray-600">상담 내역이 없습니다</p>
            <p className="text-sm text-gray-400">AI 상담 또는 전문 상담을 시작해보세요</p>
            <Link href="/chat" className="mt-2 px-6 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl hover:bg-[#FF6B35]/90 transition">
              상담 시작
            </Link>
          </div>
        ) : (
          <div className="p-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {consultations.map((item: any) => (
              <Link key={item.id} href={`/consultation/${item.id}`} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-bold text-gray-900">{item.consultation_number}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
