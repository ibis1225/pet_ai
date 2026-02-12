// ===========================
// User & Auth
// ===========================
export type UserRole = 'customer' | 'business_owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  profile_image: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ===========================
// Pet
// ===========================
export type PetType = 'dog' | 'cat';
export type PetGender = 'male' | 'female';

export interface Pet {
  id: string;
  name: string;
  pet_type: PetType;
  breed: string | null;
  gender: PetGender;
  birth_date: string | null;
  weight: number | null;
  is_neutered: boolean;
  profile_image: string | null;
  notes: string | null;
}

// ===========================
// Business
// ===========================
export type BusinessCategory =
  | 'grooming'
  | 'veterinary'
  | 'pet_shop'
  | 'insurance'
  | 'hotel'
  | 'training'
  | 'daycare'
  | 'cafe'
  | 'funeral';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string | null;
  address: string;
  phone: string;
  rating: number;
  review_count: number;
  image_url: string | null;
  is_open: boolean;
}

// ===========================
// Product
// ===========================
export type ProductCategory =
  | 'food'
  | 'treats'
  | 'clothing'
  | 'accessories'
  | 'toys'
  | 'health'
  | 'grooming'
  | 'housing'
  | 'other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  sale_price: number | null;
  description: string | null;
  image_url: string | null;
  stock: number;
  rating: number;
}

// ===========================
// Consultation
// ===========================
export type ConsultationStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type ConsultationCategory =
  | 'veterinary'
  | 'grooming'
  | 'nutrition'
  | 'behavior'
  | 'training'
  | 'hotel'
  | 'daycare'
  | 'insurance'
  | 'shopping'
  | 'emergency'
  | 'other';

export interface Consultation {
  id: string;
  consultation_number: string;
  status: ConsultationStatus;
  category: ConsultationCategory | null;
  subcategory: string | null;
  guardian_name: string;
  guardian_phone: string;
  pet_name: string;
  pet_type: string;
  description: string | null;
  created_at: string;
}

// ===========================
// Booking
// ===========================
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  business: Business;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  notes: string | null;
}

// ===========================
// Chat
// ===========================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action_type: string | null;
  created_at: string;
}

// ===========================
// Navigation
// ===========================
export type RootTabParamList = {
  HomeTab: undefined;
  ConsultationTab: undefined;
  BusinessTab: undefined;
  ShoppingTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Chat: undefined;
  Notification: undefined;
};

export type ConsultationStackParamList = {
  ConsultationList: undefined;
  ConsultationDetail: { id: string };
  ConsultationNew: undefined;
};

export type BusinessStackParamList = {
  BusinessList: undefined;
  BusinessDetail: { id: string };
  BusinessSearch: { category?: BusinessCategory };
  BookingCreate: { businessId: string };
};

export type ShoppingStackParamList = {
  ShoppingHome: undefined;
  ProductList: { category?: ProductCategory };
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PetList: undefined;
  PetDetail: { id: string };
  PetRegister: undefined;
  BookingHistory: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
