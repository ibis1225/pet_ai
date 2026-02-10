// User types
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  nickname: string | null;
  profile_image_url: string | null;
  role: "customer" | "business_owner" | "admin" | "super_admin";
  auth_provider: "local" | "line" | "google" | "apple";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// Pet types
export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  pet_type: "dog" | "cat";
  breed: string | null;
  gender: "male" | "female" | null;
  birth_date: string | null;
  weight_kg: number | null;
  profile_image_url: string | null;
  created_at: string;
}

// Business types
export type BusinessCategory =
  | "grooming"
  | "veterinary"
  | "pet_shop"
  | "insurance"
  | "hotel"
  | "training"
  | "daycare"
  | "cafe"
  | "funeral"
  | "other";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: BusinessCategory;
  status: "pending" | "approved" | "rejected" | "suspended";
  description: string | null;
  address: string;
  city: string;
  phone: string;
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

// Product types
export type ProductCategory =
  | "food"
  | "treats"
  | "clothing"
  | "accessories"
  | "toys"
  | "health"
  | "grooming"
  | "housing"
  | "other";

export interface Product {
  id: string;
  business_id: string;
  name: string;
  category: ProductCategory;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total: number;
  currency: string;
  created_at: string;
}

// Chat types
export interface ChatSession {
  id: string;
  user_id: string | null;
  channel: "line" | "app" | "web";
  is_active: boolean;
  created_at: string;
}

// Consultation types
export type ConsultationStatus =
  | "in_progress"
  | "pending"
  | "assigned"
  | "completed"
  | "cancelled";

export type ConsultationCategory =
  | "health"
  | "behavior"
  | "nutrition"
  | "grooming"
  | "training"
  | "emergency"
  | "insurance"
  | "other";

export type ConsultationUrgency = "normal" | "urgent" | "emergency";

export interface Consultation {
  id: string;
  consultation_number: string;
  channel: string;
  channel_user_id: string | null;
  current_step: string;
  member_type: "existing" | "new" | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  pet_type: "dog" | "cat" | null;
  pet_name: string | null;
  pet_age: string | null;
  category: ConsultationCategory | null;
  urgency: ConsultationUrgency | null;
  description: string | null;
  preferred_time: string | null;
  status: ConsultationStatus;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ConsultationStats {
  total_consultations: number;
  in_progress: number;
  pending: number;
  assigned: number;
  completed: number;
  cancelled: number;
  today_count: number;
  by_category: Record<string, number>;
  by_urgency: Record<string, number>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}