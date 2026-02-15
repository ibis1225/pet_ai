'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Back */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <Link href="/shopping" className="text-lg">←</Link>
        <h1 className="text-base font-bold">상품 상세</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Product Image */}
        <div className="h-72 bg-gray-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Info */}
        <div className="p-5 space-y-2.5">
          <p className="text-sm text-[#FF6B35] font-medium">카테고리</p>
          <h2 className="text-xl font-bold text-gray-900">상품 정보 로딩중...</h2>
          <p className="text-2xl font-bold text-[#FF6B35]">0원</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-sm text-yellow-400">★</span>
            ))}
            <span className="text-sm text-gray-500 ml-1">0.0 (0개 리뷰)</span>
          </div>
        </div>

        <div className="h-2 bg-gray-100" />

        {/* Description */}
        <div className="p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">상품 설명</h3>
          <p className="text-sm text-gray-600 leading-6">상품 상세 정보가 여기에 표시됩니다.</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex gap-3 p-4 bg-white border-t border-gray-100">
        <button className="flex-1 h-12 border-2 border-[#FF6B35] text-[#FF6B35] font-semibold rounded-xl text-sm">
          장바구니 담기
        </button>
        <button className="flex-1 h-12 bg-[#FF6B35] text-white font-semibold rounded-xl text-sm">
          바로 구매
        </button>
      </div>
    </div>
  );
}
