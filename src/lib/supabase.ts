
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

  // Get direct user mappings (highest priority)
  async getDirectUserMappings(userId: string): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('user_direct_mappings')
        .select('keyword, category')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Transform to a simple keyword -> category mapping
      const directMappings: Record<string, string> = {};
      data?.forEach((mapping: DirectUserMapping) => {
        directMappings[mapping.keyword] = mapping.category;
      });
      
      console.log('Loaded direct user mappings:', Object.keys(directMappings).length);
      return directMappings;
    } catch (error) {
      console.error('Error fetching direct user mappings:', error);
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
      
      // FIRST: Check direct mappings (highest priority)
      const directMappings = await this.getDirectUserMappings(userId);
      
      // If any keyword has a direct mapping, use it immediately with highest confidence
      for (const keyword of keywords) {
        if (directMappings[keyword]) {
          console.log(`Direct mapping found for "${keyword}": ${directMappings[keyword]}`);
          return { 
            category: directMappings[keyword], 
            confidence: 1.0  // Maximum confidence for direct mappings
          };
        }
      }
      
      // If no direct mapping, fall back to probabilistic approach
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
            scores[category] = (scores[category] || 0) + (Number(count) * 3);
          }
        }
        
        // Global mappings have normal weight
        if (globalMappings[keyword]) {
          for (const [category, count] of Object.entries(globalMappings[keyword])) {
            scores[category] = (scores[category] || 0) + Number(count);
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
  },
  
  // Update a user's mappings with feedback
  async updateMappings(description: string, categoryId: string, userId: string): Promise<boolean> {
    try {
      // Extract keywords from description
      const keywords = description
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      // 1. First update direct mappings (highest priority)
      await this.updateDirectMappings(keywords, categoryId, userId);
      
      // 2. Also update probabilistic mappings
      for (const keyword of keywords) {
        // Check if mapping already exists for this user and keyword
        const { data: existing } = await supabase
          .from('user_category_mappings')
          .select('*')
          .eq('user_id', userId)
          .eq('keyword', keyword)
          .maybeSingle();
        
        if (existing) {
          // Update existing mapping
          const categories = existing.categories || {};
          categories[categoryId] = (categories[categoryId] ? Number(categories[categoryId]) : 0) + 1;
          
          await supabase
            .from('user_category_mappings')
            .update({ 
              categories: categories,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Create new mapping
          const categories: Record<string, number> = {};
          categories[categoryId] = 1;
          
          await supabase
            .from('user_category_mappings')
            .insert({
              user_id: userId,
              keyword: keyword,
              categories: categories,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user mappings:', error);
      return false;
    }
  },

  // Update direct mappings (highest priority user choices)
  async updateDirectMappings(keywords: string[], categoryId: string, userId: string): Promise<boolean> {
    try {
      console.log(`Updating direct mappings for ${keywords.length} keywords to category: ${categoryId}`);
      
      // Create upsert data for all keywords
      const updates = keywords.map(keyword => ({
        user_id: userId,
        keyword: keyword,
        category: categoryId,
        updated_at: new Date().toISOString()
      }));
      
      // Upsert all mappings
      const { error } = await supabase
        .from('user_direct_mappings')
        .upsert(updates, {
          onConflict: 'user_id,keyword'
        });
      
      if (error) {
        throw error;
      }
      
      // Verify at least the first keyword was saved correctly
      if (keywords.length > 0) {
        const verificationResult = await this.verifyDirectMappingSaved(keywords[0], categoryId, userId);
        if (!verificationResult) {
          console.warn('Verification failed, attempting force save');
          // Try force save for at least the first keyword
          await this.forceSaveDirectMapping(keywords[0], categoryId, userId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating direct mappings:', error);
      
      // Recovery attempt for at least one keyword
      if (keywords.length > 0) {
        try {
          await this.forceSaveDirectMapping(keywords[0], categoryId, userId);
          return true;
        } catch (recoveryError) {
          console.error('Recovery attempt failed:', recoveryError);
        }
      }
      
      return false;
    }
  },
  
  // Verify direct mapping was saved correctly
  async verifyDirectMappingSaved(keyword: string, category: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_direct_mappings')
        .select('category')
        .eq('user_id', userId)
        .eq('keyword', keyword)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Verification query failed:', error);
        return false;
      }
      
      return data.category === category;
    } catch (error) {
      console.error('Error during mapping verification:', error);
      return false;
    }
  },
  
  // Force save direct mapping as recovery mechanism
  async forceSaveDirectMapping(keyword: string, category: string, userId: string): Promise<boolean> {
    try {
      console.log(`Force saving direct mapping: ${keyword} -> ${category}`);
      
      const { error } = await supabase
        .from('user_direct_mappings')
        .upsert({
          user_id: userId,
          keyword: keyword,
          category: category,
          updated_at: new Date().toISOString(),
          force_flag: true
        }, {
          onConflict: 'user_id,keyword'
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Force save failed:', error);
      return false;
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
  },
  
  // Update global mappings with a new categorization
  async updateGlobalMapping(keyword: string, categoryId: string): Promise<boolean> {
    try {
      // Check if global mapping already exists
      const { data: existing } = await supabase
        .from('global_category_mappings')
        .select('*')
        .eq('keyword', keyword)
        .maybeSingle();
      
      if (existing) {
        // Update existing mapping
        const categories = existing.categories || {};
        categories[categoryId] = (categories[categoryId] ? Number(categories[categoryId]) : 0) + 1;
        
        await supabase
          .from('global_category_mappings')
          .update({ 
            categories: categories,
            count: (existing.count ? Number(existing.count) : 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new mapping
        const categories: Record<string, number> = {};
        categories[categoryId] = 1;
        
        await supabase
          .from('global_category_mappings')
          .insert({
            keyword: keyword,
            categories: categories,
            count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating global category mapping:', error);
      return false;
    }
  }
};
