'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocation } from '@/hooks/useLocation';
import { searchNearbyPlaces } from '@/lib/places';
import type { NearbyPlace } from '@/types';

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'veterinary', label: '병원' },
  { key: 'grooming', label: '미용' },
  { key: 'training', label: '훈련' },
  { key: 'hotel', label: '호텔' },
  { key: 'daycare', label: '유치원' },
  { key: 'cafe', label: '카페' },
  { key: 'pet_shop', label: '펫샵' },
  { key: 'insurance', label: '보험' },
];

export default function BusinessPage() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchText, setSearchText] = useState('');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  const loadPlaces = useCallback(async (category: string) => {
    if (!location.latitude || !location.longitude) return;
    setIsSearching(true);
    try {
      const results = await searchNearbyPlaces(location.latitude, location.longitude, category);
      setPlaces(results);
    } catch { /* ignore */ } finally { setIsSearching(false); }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (location.latitude && location.longitude) loadPlaces(selectedCategory);
  }, [location.latitude, location.longitude, selectedCategory, loadPlaces]);

  const filteredPlaces = searchText
    ? places.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()) || p.address.toLowerCase().includes(searchText.toLowerCase()))
    : places;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="bg-white px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 max-w-xl">
            <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 h-11">
              <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                placeholder="업체명, 지역 검색" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </div>

          {/* Location Status */}
          {location.loading && (
            <div className="flex items-center gap-1.5 mt-2 ml-1">
              <div className="w-3 h-3 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">위치를 가져오는 중...</span>
            </div>
          )}
          {location.error && (
            <div className="flex items-center gap-1.5 mt-2 ml-1">
              <span className="text-xs text-amber-500">⚠️ {location.error}</span>
            </div>
          )}
          {location.latitude && !isSearching && (
            <div className="flex items-center gap-1.5 mt-2 ml-1">
              <span className="text-xs text-green-500">📍 내 주변 {filteredPlaces.length}개 업체</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 md:px-6 py-2.5 bg-white overflow-x-auto scrollbar-hide border-b border-gray-100">
          {CATEGORIES.map((cat) => (
            <button key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.key
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">주변 업체를 검색하고 있습니다...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-gray-400">
              {location.latitude ? '주변에 검색된 업체가 없습니다' : '위치 권한을 허용해주세요'}
            </p>
          </div>
        ) : (
          <div className="p-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlaces.map((place) => (
              <Link key={place.place_id} href={`/business/${place.place_id}?lat=${location.latitude}&lng=${location.longitude}`}
                className="flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                {place.photo_url ? (
                  <img src={place.photo_url} alt={place.name} className="w-24 md:w-32 h-[100px] md:h-[120px] object-cover shrink-0" />
                ) : (
                  <div className="w-24 md:w-32 h-[100px] md:h-[120px] bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 p-2.5 md:p-3 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-500 truncate">{place.address}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-sm font-semibold">{place.rating > 0 ? place.rating.toFixed(1) : '-'}</span>
                      {place.rating_count > 0 && <span className="text-xs text-gray-400">({place.rating_count})</span>}
                    </div>
                    <span className="text-xs font-semibold text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-full">
                      📍 {place.distance_text}
                    </span>
                  </div>
                  {place.is_open !== null && (
                    <span className={`text-xs font-medium ${place.is_open ? 'text-green-500' : 'text-gray-400'}`}>
                      {place.is_open ? '영업중' : '영업 종료'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
