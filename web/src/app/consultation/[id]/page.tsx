'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ConsultationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white px-4 md:px-6 py-3 flex items-center gap-3 border-b border-gray-100">
          <Link href="/consultation" className="text-lg">←</Link>
          <h1 className="text-base font-bold">상담 상세</h1>
        </div>

        <div className="p-4 md:px-6 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">상담 번호</span>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">상태</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">대기중</span>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">보호자 정보</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">이름</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">연락처</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">반려동물 정보</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">이름</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">종류</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">나이</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-gray-900">상담 내용</h3>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">분류</span>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">긴급도</span>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="py-2.5">
              <span className="text-sm text-gray-500">상세 설명</span>
              <p className="text-sm text-gray-800 leading-6 mt-1.5">상담 상세 내용을 불러오는 중입니다...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
