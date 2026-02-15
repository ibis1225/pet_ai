import { getDistance, formatDistance } from './distance';
import type { NearbyPlace } from '@/types';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

const CATEGORY_SEARCH: Record<string, { keyword: string; type?: string }> = {
  all:        { keyword: 'ペット' },
  veterinary: { keyword: 'ペット 動物病院', type: 'veterinary_care' },
  grooming:   { keyword: 'ペット トリミング 美容室' },
  training:   { keyword: 'ペット しつけ トレーニング' },
  hotel:      { keyword: 'ペット ホテル' },
  daycare:    { keyword: 'ペット 保育園 デイケア' },
  cafe:       { keyword: 'ペット カフェ', type: 'cafe' },
  pet_shop:   { keyword: 'ペットショップ', type: 'pet_store' },
  insurance:  { keyword: 'ペット 保険' },
};

export async function searchNearbyPlaces(lat: number, lng: number, category = 'all', radius = 5000): Promise<NearbyPlace[]> {
  const search = CATEGORY_SEARCH[category] || CATEGORY_SEARCH.all;
  const params = new URLSearchParams({
    location: `${lat},${lng}`, radius: radius.toString(),
    keyword: search.keyword, language: 'ja', key: GOOGLE_API_KEY,
  });
  if (search.type) params.set('type', search.type);

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);
    const data = await res.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];

    return (data.results || []).map((p: any) => {
      const dist = getDistance(lat, lng, p.geometry.location.lat, p.geometry.location.lng);
      return {
        place_id: p.place_id, name: p.name,
        address: p.vicinity || p.formatted_address || '',
        latitude: p.geometry.location.lat, longitude: p.geometry.location.lng,
        rating: p.rating || 0, rating_count: p.user_ratings_total || 0,
        is_open: p.opening_hours?.open_now ?? null,
        photo_url: p.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${GOOGLE_API_KEY}` : null,
        distance: dist, distance_text: formatDistance(dist), category,
      };
    }).sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance);
  } catch { return []; }
}

export async function getPlaceDetail(placeId: string) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,reviews,photos,geometry,rating,user_ratings_total,url',
    language: 'ja', key: GOOGLE_API_KEY,
  });
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const data = await res.json();
    if (data.status !== 'OK') return null;
    const p = data.result;
    return {
      place_id: placeId, name: p.name, address: p.formatted_address,
      phone: p.formatted_phone_number || null, website: p.website || null,
      google_maps_url: p.url || null, rating: p.rating || 0,
      rating_count: p.user_ratings_total || 0,
      latitude: p.geometry.location.lat, longitude: p.geometry.location.lng,
      opening_hours: p.opening_hours?.weekday_text || [],
      is_open: p.opening_hours?.open_now ?? null,
      reviews: (p.reviews || []).slice(0, 5).map((r: any) => ({
        author: r.author_name, rating: r.rating, text: r.text, time: r.relative_time_description,
      })),
      photos: (p.photos || []).slice(0, 5).map((ph: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ph.photo_reference}&key=${GOOGLE_API_KEY}`
      ),
    };
  } catch { return null; }
}
