
export interface Product {
  id: string; // uuid
  name: string | null;
  description: string | null;
  image: string | null;
  category: string | null;
  price: number | null; // Added price field
  datahint?: string | null;
  is_active: boolean;
  created_at: string | null; // ISO 8601 timestamp string
}

// For form handling, ensure non-nullable fields are enforced by Zod schema
export type ProductFormData = {
  name: string;
  description?: string;
  image: string;
  category: string;
  price: number; // Added price field
  is_active: boolean;
  // created_at will be set automatically or is not typically part of create/edit form directly by user
};

// This can be expanded if specific error structures are needed
export interface ApiError {
  message: string;
  details?: any;
}

// For data table actions
export type ProductColumn = Product & {
  // any additional fields needed for column display
};
