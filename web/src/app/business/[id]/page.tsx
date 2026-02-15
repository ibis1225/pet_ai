'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPlaceDetail } from '@/lib/places';
import { getDistance, formatDistance } from '@/lib/distance';

export default function BusinessDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const placeId = params.id as string;
  const userLat = Number(searchParams.get('lat')) || null;
  const userLng = Number(searchParams.get('lng')) || null;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlaceDetail(placeId);
        setDetail(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [placeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">업체 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <span className="text-4xl">😿</span>
        <p className="text-sm text-gray-500">업체 정보를 불러올 수 없습니다</p>
        <Link href="/business" className="text-sm text-[#FF6B35] font-semibold">목록으로 돌아가기</Link>
      </div>
    );
  }

  const distance = userLat && userLng
    ? formatDistance(getDistance(userLat, userLng, detail.latitude, detail.longitude))
    : null;

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* Back button */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <Link href="/business" className="text-lg">←</Link>
        <h1 className="text-base font-bold truncate flex-1">{detail.name}</h1>
      </div>

      {/* Photos */}
      {detail.photos && detail.photos.length > 0 ? (
        <div className="flex overflow-x-auto scrollbar-hide">
          {detail.photos.map((url: string, i: number) => (
            <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full h-52 object-cover shrink-0" />
          ))}
        </div>
      ) : (
        <div className="w-full h-52 bg-gray-200 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
          </svg>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white p-5 space-y-3">
        <h2 className="text-xl font-bold text-gray-900">{detail.name}</h2>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-yellow-400">★</span>
          <span className="text-lg font-bold">{detail.rating > 0 ? detail.rating.toFixed(1) : '-'}</span>
          <span className="text-sm text-gray-500">({detail.rating_count}개의 리뷰)</span>
          {distance && (
            <span className="text-sm font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-2.5 py-1 rounded-full">
              📍 {distance}
            </span>
          )}
        </div>

        {detail.is_open !== null && (
          <p className={`text-sm font-semibold ${detail.is_open ? 'text-green-500' : 'text-red-400'}`}>
            {detail.is_open ? '영업중' : '영업 종료'}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{detail.address}</span>
        </div>

        {detail.phone && (
          <a href={`tel:${detail.phone}`} className="flex items-center gap-2 text-sm text-[#FF6B35]">
            <span>📞</span>
            <span>{detail.phone}</span>
          </a>
        )}

        {detail.website && (
          <a href={detail.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#FF6B35] truncate">
            <span>🌐</span>
            <span className="truncate">{detail.website}</span>
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 px-4 py-3">
        {detail.phone && (
          <a href={`tel:${detail.phone}`} className="flex-1 h-11 border-2 border-[#FF6B35] text-[#FF6B35] font-semibold rounded-xl flex items-center justify-center text-sm">
            전화하기
          </a>
        )}
        {detail.google_maps_url && (
          <a href={detail.google_maps_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 h-11 bg-[#FF6B35] text-white font-semibold rounded-xl flex items-center justify-center text-sm">
            길찾기
          </a>
        )}
      </div>

      {/* Map Link */}
      {detail.google_maps_url && (
        <div className="mx-4 bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="h-44 bg-gray-100 flex items-center justify-center">
            <iframe
              src={`https://maps.google.com/maps?q=${detail.latitude},${detail.longitude}&z=16&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a href={detail.google_maps_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100 text-sm text-[#FF6B35] font-medium">
            🔗 Google Maps에서 보기
          </a>
        </div>
      )}

      {/* Opening Hours */}
      {detail.opening_hours && detail.opening_hours.length > 0 && (
        <>
          <h3 className="text-base font-bold text-gray-900 px-4 mb-2">영업 시간</h3>
          <div className="mx-4 bg-white rounded-xl p-4 shadow-sm mb-4 space-y-1.5">
            {detail.opening_hours.map((line: string, i: number) => (
              <p key={i} className="text-sm text-gray-600 leading-5">{line}</p>
            ))}
          </div>
        </>
      )}

      {/* Reviews */}
      <h3 className="text-base font-bold text-gray-900 px-4 mb-2">리뷰</h3>
      {detail.reviews && detail.reviews.length > 0 ? (
        <div className="space-y-2 px-4">
          {detail.reviews.map((review: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">{review.author}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className={`text-xs ${idx < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-5 line-clamp-4">{review.text}</p>
              <p className="text-xs text-gray-400 mt-2">{review.time}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-4 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-gray-400">아직 리뷰가 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
}
