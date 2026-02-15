'use client';
import { useState } from 'react';
import Link from 'next/link';

const PRODUCT_CATEGORIES = [
  { key: 'food', label: '사료', icon: '🍚', color: '#FF9800' },
  { key: 'treats', label: '간식', icon: '🍪', color: '#E91E63' },
  { key: 'clothing', label: '옷', icon: '👕', color: '#9C27B0' },
  { key: 'accessories', label: '악세서리', icon: '💎', color: '#00BCD4' },
  { key: 'toys', label: '장난감', icon: '🎮', color: '#4CAF50' },
  { key: 'health', label: '건강', icon: '💊', color: '#F44336' },
  { key: 'grooming', label: '미용', icon: '✨', color: '#E91E63' },
  { key: 'housing', label: '하우스', icon: '🏠', color: '#795548' },
];

const SAMPLE_PRODUCTS = [
  { id: '1', name: '프리미엄 유기농 사료', price: 45000, category: 'food' },
  { id: '2', name: '닭가슴살 간식', price: 12000, category: 'treats' },
  { id: '3', name: '강아지 겨울 패딩', price: 38000, category: 'clothing' },
  { id: '4', name: '노즈워크 장난감', price: 15000, category: 'toys' },
  { id: '5', name: '관절 영양제', price: 28000, category: 'health' },
  { id: '6', name: '원목 하우스', price: 89000, category: 'housing' },
];

export default function ShoppingPage() {
  const [searchText, setSearchText] = useState('');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="bg-white px-4 md:px-6 py-3">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 h-11 max-w-xl">
            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
              placeholder="상품 검색" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white grid grid-cols-4 md:grid-cols-8 gap-y-3 p-4 md:px-6 mb-2">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button key={cat.key} className="flex flex-col items-center gap-1.5 hover:opacity-80 transition">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '15' }}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-800">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="mx-4 md:mx-6 my-3 bg-[#FF6B35] rounded-xl p-5 md:p-6">
          <p className="text-base md:text-lg font-bold text-white">신규 가입 혜택</p>
          <p className="text-sm text-white/85 mt-1">첫 주문 10% 할인 쿠폰 지급!</p>
        </div>

        {/* Product List Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
          <h3 className="text-base font-bold text-gray-900">인기 상품</h3>
          <button className="text-sm text-[#FF6B35]">전체보기</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 md:px-6 pb-8">
          {SAMPLE_PRODUCTS.map((product) => (
            <Link key={product.id} href={`/shopping/${product.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-32 md:h-40 bg-gray-100 flex items-center justify-center">
                <svg className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-2.5 space-y-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                <p className="text-base font-bold text-[#FF6B35]">{product.price.toLocaleString()}원</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
