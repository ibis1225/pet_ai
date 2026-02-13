import { getDistance, formatDistance } from './distance';

// Google Maps API key - should be set in environment
const GOOGLE_API_KEY = 'AIzaSyBZg8UPrCrDeCJSDEVsNdqCthkt5W1-Mzg';

// Pet-related place type mappings for Google Places
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

export interface NearbyPlace {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  rating_count: number;
  is_open: boolean | null;
  photo_url: string | null;
  distance: number;      // meters
  distance_text: string; // formatted "350m" or "2.3km"
  category: string;
}

/**
 * Search nearby pet-related businesses using Google Places API
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  category: string = 'all',
  radius: number = 5000, // 5km default
): Promise<NearbyPlace[]> {
  const search = CATEGORY_SEARCH[category] || CATEGORY_SEARCH.all;

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: radius.toString(),
    keyword: search.keyword,
    language: 'ja', // Japanese results (Japan-based)
    key: GOOGLE_API_KEY,
  });

  if (search.type) {
    params.set('type', search.type);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
    );
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Places API error:', data.status, data.error_message);
      return [];
    }

    const places: NearbyPlace[] = (data.results || []).map((place: any) => {
      const placeLatitude = place.geometry.location.lat;
      const placeLongitude = place.geometry.location.lng;
      const dist = getDistance(latitude, longitude, placeLatitude, placeLongitude);

      return {
        place_id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        latitude: placeLatitude,
        longitude: placeLongitude,
        rating: place.rating || 0,
        rating_count: place.user_ratings_total || 0,
        is_open: place.opening_hours?.open_now ?? null,
        photo_url: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : null,
        distance: dist,
        distance_text: formatDistance(dist),
        category,
      };
    });

    // Sort by distance (nearest first)
    places.sort((a, b) => a.distance - b.distance);

    return places;
  } catch (error) {
    console.error('Places API fetch error:', error);
    return [];
  }
}

/**
 * Get place details (phone, website, hours, etc.)
 */
export async function getPlaceDetail(placeId: string) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,reviews,photos,geometry,rating,user_ratings_total,url',
    language: 'ja',
    key: GOOGLE_API_KEY,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    );
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn('Place Details error:', data.status);
      return null;
    }

    const place = data.result;
    return {
      place_id: placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || null,
      website: place.website || null,
      google_maps_url: place.url || null,
      rating: place.rating || 0,
      rating_count: place.user_ratings_total || 0,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      opening_hours: place.opening_hours?.weekday_text || [],
      is_open: place.opening_hours?.open_now ?? null,
      reviews: (place.reviews || []).slice(0, 5).map((r: any) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
      })),
      photos: (place.photos || []).slice(0, 5).map((p: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
      ),
    };
  } catch (error) {
    console.error('Place Details fetch error:', error);
    return null;
  }
}

export function setGoogleApiKey(key: string) {
  // For runtime key configuration
  (globalThis as any).__GOOGLE_MAPS_KEY = key;
}
