
import { supabase } from './client';
import { CategoryMapping } from './types';

// Functions to interact with global category mappings
export const globalCategoryMappings = {
  // Get all global mappings
  async getGlobalMappings(): Promise<Record<string, Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('global_category_mappings')
        .select('*');
        
      if (error) {
        console.error('Error fetching global mappings:', error);
        throw error;
      }
      
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
      const { data: existing, error: fetchError } = await supabase
        .from('global_category_mappings')
        .select('*')
        .eq('keyword', keyword)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching global mapping:', fetchError);
        return false;
      }
      
      if (existing) {
        // Update existing mapping
        const categories = existing.categories || {};
        categories[categoryId] = (categories[categoryId] ? Number(categories[categoryId]) : 0) + 1;
        
        const { error: updateError } = await supabase
          .from('global_category_mappings')
          .update({ 
            categories: categories,
            count: (existing.count ? Number(existing.count) : 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
          
        if (updateError) {
          console.error('Error updating global mapping:', updateError);
          return false;
        }
      } else {
        // Create new mapping
        const categories: Record<string, number> = {};
        categories[categoryId] = 1;
        
        const { error: insertError } = await supabase
          .from('global_category_mappings')
          .insert({
            keyword: keyword,
            categories: categories,
            count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating global mapping:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating global category mapping:', error);
      return false;
    }
  }
};
