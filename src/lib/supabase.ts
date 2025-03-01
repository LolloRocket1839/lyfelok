
import { createClient } from '@supabase/supabase-js';

// Configura i dati di accesso a Supabase
const supabaseUrl = 'https://ypxromfyumbdhxyxarnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweHJvbWZ5dW1iZGh4eXhhcm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDI0ODIsImV4cCI6MjA1NjI3ODQ4Mn0._gsWU88WBUSXFp-MrDBwHmjS6ycK2FyzUGGMUPDUN5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Functions to interact with user category mappings
export const userCategoryMappings = {
  // Get mappings for a specific user
  async getUserMappings(userId: string): Promise<Record<string, Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('user_category_mappings')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Transform to more usable format
      const mappings: Record<string, Record<string, number>> = {};
      data?.forEach((mapping: CategoryMapping) => {
        mappings[mapping.keyword] = mapping.categories;
      });
      
      return mappings;
    } catch (error) {
      console.error('Error fetching user mappings:', error);
      return {};
    }
  },
  
  // Get suggested category for a specific transaction
  async getSuggestedCategory(description: string, userId: string): Promise<{category: string, confidence: number}> {
    try {
      // Extract keywords
      const keywords = description
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      if (keywords.length === 0) {
        return { category: 'altro', confidence: 0.1 };
      }
      
      // Get user mappings
      const userMappings = await this.getUserMappings(userId);
      
      // Get global mappings
      const globalMappings = await globalCategoryMappings.getGlobalMappings();
      
      // Calculate scores for each category
      const scores: Record<string, number> = {};
      
      // User mappings have higher weight (3x)
      for (const keyword of keywords) {
        if (userMappings[keyword]) {
          for (const [category, count] of Object.entries(userMappings[keyword])) {
            scores[category] = (scores[category] || 0) + (count * 3);
          }
        }
        
        // Global mappings have normal weight
        if (globalMappings[keyword]) {
          for (const [category, count] of Object.entries(globalMappings[keyword])) {
            scores[category] = (scores[category] || 0) + count;
          }
        }
      }
      
      // Find category with highest score
      let bestCategory = 'altro';
      let bestScore = 0;
      
      for (const [category, score] of Object.entries(scores)) {
        if (score > bestScore) {
          bestCategory = category;
          bestScore = score;
        }
      }
      
      // Calculate confidence score (0-1)
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const confidence = totalScore > 0 ? bestScore / totalScore : 0.1;
      
      return {
        category: bestCategory,
        confidence: confidence
      };
    } catch (error) {
      console.error('Error getting suggested category:', error);
      return { category: 'altro', confidence: 0.1 };
    }
  }
};

// Functions to interact with global category mappings
export const globalCategoryMappings = {
  // Get all global mappings
  async getGlobalMappings(): Promise<Record<string, Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('global_category_mappings')
        .select('*');
        
      if (error) throw error;
      
      // Transform to more usable format
      const mappings: Record<string, Record<string, number>> = {};
      data?.forEach((mapping: CategoryMapping) => {
        mappings[mapping.keyword] = mapping.categories;
      });
      
      return mappings;
    } catch (error) {
      console.error('Error fetching global mappings:', error);
      return {};
    }
  }
};
