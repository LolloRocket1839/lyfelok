
// Interfaces for category mapping
export interface CategoryMapping {
  id: string;
  user_id?: string;
  keyword: string;
  categories: Record<string, number>;
  count?: number;
  created_at: string;
  updated_at: string;
}

// Interface for direct user mappings
export interface DirectUserMapping {
  id: string;
  user_id: string;
  keyword: string;
  category: string;
  created_at: string;
  updated_at: string;
  force_flag?: boolean;
}
