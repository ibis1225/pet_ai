'use client';
import Link from 'next/link';

const QUICK_MENU = [
  { icon: '💬', label: 'AI 상담', href: '/chat', bg: 'bg-orange-50' },
  { icon: '🏥', label: '수의 상담', href: '/consultation', bg: 'bg-teal-50' },
  { icon: '✂️', label: '미용실', href: '/business?cat=grooming', bg: 'bg-pink-50' },
  { icon: '🛒', label: '쇼핑', href: '/shopping', bg: 'bg-blue-50' },
];

const SERVICE_CATEGORIES = [
  { icon: '🏥', label: '동물병원', color: '#E74C3C', category: 'veterinary' },
  { icon: '✂️', label: '미용실', color: '#E91E63', category: 'grooming' },
  { icon: '🎓', label: '훈련소', color: '#3F51B5', category: 'training' },
  { icon: '🏨', label: '호텔', color: '#00BCD4', category: 'hotel' },
  { icon: '🧒', label: '유치원', color: '#4CAF50', category: 'daycare' },
  { icon: '☕', label: '카페', color: '#795548', category: 'cafe' },
  { icon: '🛡️', label: '보험', color: '#607D8B', category: 'insurance' },
  { icon: '🏪', label: '펫샵', color: '#FF5722', category: 'pet_shop' },
];

const POPULAR_PRODUCTS = ['사료', '간식', '장난감', '옷'];

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-3">
          <div>
            <p className="text-sm text-gray-500">안녕하세요!</p>
            <h1 className="text-2xl font-bold text-[#FF6B35] md:hidden">PetAI</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Banner */}
        <div className="mb-5 rounded-2xl bg-[#FF6B35] p-5 md:p-8 flex items-center justify-between overflow-hidden">
          <div className="flex-1">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1">AI 반려동물 상담</h2>
            <p className="text-sm md:text-base text-white/85 leading-5 mb-3">건강, 영양, 행동 등 무엇이든 물어보세요</p>
            <Link href="/chat" className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition">
              상담 시작 →
            </Link>
          </div>
          <div className="text-6xl md:text-8xl opacity-30 ml-3">🐾</div>
        </div>

        {/* Quick Menu */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {QUICK_MENU.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-sm transition">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${item.bg} flex items-center justify-center text-2xl md:text-3xl`}>
                {item.icon}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Service Categories */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base md:text-lg font-bold text-gray-900">서비스 찾기</h3>
          <Link href="/business" className="text-sm text-[#FF6B35]">전체보기</Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          {SERVICE_CATEGORIES.map((item) => (
            <Link key={item.category} href={`/business?cat=${item.category}`} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white hover:shadow-sm transition">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: item.color + '15' }}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Two column layout on desktop */}
        <div className="md:grid md:grid-cols-2 md:gap-6">
          {/* Recent Consultations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-bold text-gray-900">최근 상담</h3>
              <Link href="/consultation" className="text-sm text-[#FF6B35]">더보기</Link>
            </div>
            <div className="mb-5 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-400">아직 상담 내역이 없습니다</p>
                <Link href="/chat" className="text-sm text-[#FF6B35] font-semibold">AI 상담 시작하기</Link>
              </div>
            </div>
          </div>

          {/* Popular Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-bold text-gray-900">인기 상품</h3>
              <Link href="/shopping" className="text-sm text-[#FF6B35]">더보기</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-8">
              {POPULAR_PRODUCTS.map((name) => (
                <Link key={name} href="/shopping" className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="h-24 bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-800">{name} 상품</p>
                    <p className="text-xs text-gray-400 mt-0.5">준비중</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
