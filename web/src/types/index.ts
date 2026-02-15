export type UserRole = 'customer' | 'business_owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  profile_image: string | null;
}

export type PetType = 'dog' | 'cat';
export interface Pet {
  id: string;
  name: string;
  pet_type: PetType;
  breed: string | null;
  gender: 'male' | 'female';
  birth_date: string | null;
  weight: number | null;
  is_neutered: boolean;
  profile_image: string | null;
}

export type BusinessCategory = 'grooming' | 'veterinary' | 'pet_shop' | 'insurance' | 'hotel' | 'training' | 'daycare' | 'cafe' | 'funeral';
export type ProductCategory = 'food' | 'treats' | 'clothing' | 'accessories' | 'toys' | 'health' | 'grooming' | 'housing' | 'other';
export type ConsultationCategory = 'veterinary' | 'grooming' | 'nutrition' | 'behavior' | 'training' | 'hotel' | 'daycare' | 'insurance' | 'shopping' | 'emergency' | 'other';

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
  distance: number;
  distance_text: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
