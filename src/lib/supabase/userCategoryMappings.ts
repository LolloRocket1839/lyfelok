import { supabase } from './client';
import { CategoryMapping, DirectUserMapping } from './types';
import { globalCategoryMappings } from './globalCategoryMappings';

// Functions to interact with user category mappings
export const userCategoryMappings = {
  // Get mappings for a specific user
  async getUserMappings(userId: string): Promise<Record<string, Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('user_category_mappings')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user mappings:', error);
        throw error;
      }
      
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
        
      if (error) {
        console.error('Error fetching direct user mappings:', error);
        throw error;
      }
      
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
      console.log('Updating mappings for:', {
        description,
        categoryId,
        userId
      });
      
      // Extract keywords from description
      const keywords = description
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      if (keywords.length === 0) {
        console.warn('No valid keywords extracted from description');
        return false;
      }
      
      // 1. First update direct mappings (highest priority)
      const directResult = await this.updateDirectMappings(keywords, categoryId, userId);
      
      if (!directResult) {
        console.warn('Direct mapping update failed');
      }
      
      // 2. Also update probabilistic mappings
      for (const keyword of keywords) {
        // Check if mapping already exists for this user and keyword
        const { data: existing, error: fetchError } = await supabase
          .from('user_category_mappings')
          .select('*')
          .eq('user_id', userId)
          .eq('keyword', keyword)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error fetching existing mapping:', fetchError);
          continue;
        }
        
        if (existing) {
          // Update existing mapping
          const categories = existing.categories || {};
          categories[categoryId] = (categories[categoryId] ? Number(categories[categoryId]) : 0) + 1;
          
          const { error: updateError } = await supabase
            .from('user_category_mappings')
            .update({ 
              categories: categories,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
            
          if (updateError) {
            console.error('Error updating existing mapping:', updateError);
          }
        } else {
          // Create new mapping
          const categories: Record<string, number> = {};
          categories[categoryId] = 1;
          
          const { error: insertError } = await supabase
            .from('user_category_mappings')
            .insert({
              user_id: userId,
              keyword: keyword,
              categories: categories,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating new mapping:', insertError);
          }
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
      
      if (keywords.length === 0 || !categoryId || !userId) {
        console.error('Missing required parameters for direct mapping update');
        return false;
      }
      
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
        console.error('Error upserting direct mappings:', error);
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
      
      if (error) {
        console.error('Verification query failed:', error);
        return false;
      }
      
      if (!data) {
        console.error('No data returned from verification query');
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
      
      // First, try to delete any existing mapping
      await supabase
        .from('user_direct_mappings')
        .delete()
        .eq('user_id', userId)
        .eq('keyword', keyword);
      
      // Then insert the new mapping
      const { error } = await supabase
        .from('user_direct_mappings')
        .insert({
          user_id: userId,
          keyword: keyword,
          category: category,
          updated_at: new Date().toISOString(),
          force_flag: true
        });
      
      if (error) {
        console.error('Force insert failed:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Force save failed:', error);
      return false;
    }
  }
};
