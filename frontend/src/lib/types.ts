// LUSH LAYERS - Core TypeScript Interfaces
// STRICT POLICY: ZERO PRICE FIELDS, ZERO ONLINE PAYMENTS

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  accent?: string;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cake {
  id: string;
  display_id?: string;
  name: string;
  slug: string;
  flavour: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  description: string;
  available_sizes: string[];
  image_url: string; // Mandatory!
  cloudinary_public_id?: string;
  status: "pending" | "approved" | "rejected" | "published";
  ai_metadata?: {
    original_file?: string;
    suggested_name?: string;
    suggested_flavour?: string;
    suggested_category?: string;
    suggested_category_id?: string | null;
    suggested_description?: string;
    suggested_sizes?: string[];
    tags?: string[];
    confidence?: number;
    local_preview_url?: string;
    local_thumb_url?: string;
    regenerated?: boolean;
    ai_status?: "not_generated" | "generating" | "generated" | "failed";
    ai_error?: string | null;
    generated_at?: string;
  };
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface Review {
  id: string;
  customer_name: string;
  customer_location?: string;
  review_text: string;
  rating: number; // 1 - 5
  cake_id?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at?: string | null;
}

export interface ProcessingJob {
  id: string;
  file_name: string;
  original_size_bytes?: number;
  status: "queued" | "processing" | "image_processed" | "ai_processing" | "uploading" | "completed" | "failed" | "retrying";
  progress: number;
  error_message?: string | null;
  cake_id?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  phone: string;
  cake_name: string;
  flavour?: string;
  selected_size?: string;
  custom_message?: string;
  status: "New" | "Contacted" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  pending: number;
  approved: number;
  published: number;
  total_approved: number;
  rejected: number;
  processing: number;
  failed: number;
  pending_reviews: number;
  enquiries?: {
    total: number;
    new: number;
    contacted: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}
