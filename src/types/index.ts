
export interface Product {
  id: string; // uuid
  name: string | null;
  description: string | null;
  image: string | null;
  category: string | null;
  datahint?: string | null; // Marked as unused
  is_active: boolean;
  is_visible: boolean;
  created_at: string | null; // Year as string or int as string
}

// For form handling, ensure non-nullable fields are enforced by Zod schema
export type ProductFormData = {
  name: string;
  description?: string;
  image: string;
  category: string;
  is_active: boolean;
  is_visible: boolean;
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
