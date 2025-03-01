import { Transaction } from './transactionRouter';
import { supabase, userCategoryMappings, globalCategoryMappings } from '@/lib/supabase';

// Main category definitions
export const mainCategories = [
  { id: 'Cibo', label: 'Cibo', icon: '🍽️', color: '#4CAF50' },
  { id: 'Alloggio', label: 'Casa', icon: '🏠', color: '#2196F3' },
  { id: 'Trasporto', label: 'Trasporti', icon: '🚗', color: '#FF9800' },
  { id: 'Intrattenimento', label: 'Svago', icon: '🎬', color: '#9C27B0' },
  { id: 'Utenze', label: 'Utenze', icon: '💡', color: '#F44336' },
  { id: 'Shopping', label: 'Shopping', icon: '👕', color: '#3F51B5' },
  { id: 'Altro', label: 'Altro', icon: '📦', color: '#607D8B' }
];

// Observer pattern for real-time UI updates
export class TransactionStore {
  private listeners: Map<string, Function[]> = new Map();
  private transactions: Transaction[] = [];
  private feedbackRequestCount = 0;
  private confidenceThreshold = 0.75;
  private localMappingCache: Record<string, any> = {};
  private directMappingsCache: Map<string, Record<string, string>> = new Map();
  private enableDebugLogging = true;
  
  // Add a transaction and notify listeners
  addTransaction(transaction: Transaction) {
    // Save to internal store (in a real app, this would go to a database)
    this.transactions.push(transaction);
    this.logDebug('Transaction added to store:', transaction);
    
    // Notify appropriate listeners
    this.notify(transaction.type, transaction);
    this.notify('ALL', transaction);
    
    return transaction;
  }
  
  // Update an existing transaction
  updateTransaction(updatedTransaction: Transaction) {
    const index = this.transactions.findIndex(t => 
      t.description === updatedTransaction.description && 
      t.amount === updatedTransaction.amount &&
      t.date === updatedTransaction.date
    );
    
    if (index !== -1) {
      this.transactions[index] = updatedTransaction;
      this.logDebug('Transaction updated in store:', updatedTransaction);
      
      // Notify appropriate listeners
      this.notify(updatedTransaction.type, updatedTransaction);
      this.notify('UPDATE', updatedTransaction);
      this.notify('ALL', updatedTransaction);
      
      return updatedTransaction;
    }
    
    return null;
  }
  
  // Get transaction by ID (simplified - in a real app, would use actual IDs)
  getTransactionById(id: number): Transaction | null {
    // In this simplified version, we just get by index
    // In a real app, each transaction would have a unique ID
    if (id >= 0 && id < this.transactions.length) {
      return this.transactions[id];
    }
    return null;
  }
  
  // Get all transactions of a specific type
  getTransactions(type?: string): Transaction[] {
    if (!type || type === 'ALL') {
      return [...this.transactions];
    }
    return this.transactions.filter(t => t.type === type);
  }
  
  // Subscribe to transaction events
  subscribe(type: string, callback: Function): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.push(callback);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.get(type)?.indexOf(callback) ?? -1;
      if (index !== -1) {
        this.listeners.get(type)?.splice(index, 1);
      }
    };
  }
  
  // Notify listeners of a transaction event
  private notify(type: string, data: any) {
    this.listeners.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in transaction listener:', error);
      }
    });
  }
  
  // Clear all transactions (useful for testing)
  clear() {
    this.transactions = [];
  }

  // Process a transaction with smart categorization
  async processTransactionWithSmartCategories(transaction: Transaction, userId: string): Promise<{
    transaction: Transaction;
    requireFeedback: boolean;
    suggestedCategories: any[];
  }> {
    try {
      // Extract keywords from description
      const keywords = this.extractKeywords(transaction.description);
      this.logDebug('Processing transaction with keywords:', keywords);
      
      // Check direct mappings first (highest priority)
      const directMapping = await this.checkDirectMappings(keywords, userId);
      
      if (directMapping) {
        // If direct mapping exists, use it with maximum confidence
        this.logDebug('Found direct mapping:', directMapping);
        transaction.category = directMapping.category;
        transaction.confidence = 1.0; // Maximum confidence
        
        return {
          transaction,
          requireFeedback: false, // No feedback needed for direct mappings
          suggestedCategories: []
        };
      }
      
      // If no direct mapping, find best category match using probabilistic approach
      const categoryMatch = await this.findBestCategoryMatch(keywords, userId);
      
      // Determine if feedback should be requested
      const shouldRequestFeedback = this.shouldAskForFeedback(categoryMatch, userId);
      
      // Update transaction with the determined category
      transaction.category = categoryMatch.category;
      transaction.confidence = categoryMatch.confidence;
      
      // Return the processed transaction with metadata
      return {
        transaction,
        requireFeedback: shouldRequestFeedback,
        suggestedCategories: shouldRequestFeedback 
          ? this.getSuggestedCategories(keywords)
          : []
      };
    } catch (error) {
      console.error('Error processing transaction with smart categories:', error);
      
      // Default to 'Altro' category with low confidence
      transaction.category = 'Altro';
      transaction.confidence = 0.1;
      
      return {
        transaction,
        requireFeedback: true,
        suggestedCategories: mainCategories
      };
    }
  }

  // Check for direct user mappings (highest priority)
  private async checkDirectMappings(keywords: string[], userId: string): Promise<{keyword: string, category: string} | null> {
    try {
      // Get direct mappings from cache or load them
      let directMappings = this.directMappingsCache.get(userId);
      
      if (!directMappings) {
        directMappings = await userCategoryMappings.getDirectUserMappings(userId);
        this.directMappingsCache.set(userId, directMappings);
      }
      
      // Check each keyword for a direct mapping
      for (const keyword of keywords) {
        if (directMappings[keyword]) {
          return {
            keyword: keyword,
            category: directMappings[keyword]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking direct mappings:', error);
      return null;
    }
  }

  // Find the best category match based on keywords
  private async findBestCategoryMatch(keywords: string[], userId: string) {
    // Results with scores for each category
    const scores: Record<string, number> = {};
    
    // 1. Check user mappings (high priority)
    const userMappings = await this.getUserMappings(userId);
    
    // 2. Check global mappings (medium priority)
    const globalMappings = await this.getGlobalMappings();
    
    // Calculate scores by combining mappings
    for (const keyword of keywords) {
      // User mappings have more weight (3x)
      if (userMappings[keyword]) {
        for (const [category, count] of Object.entries(userMappings[keyword])) {
          scores[category] = (scores[category] || 0) + (count as number * 3);
        }
      }
      
      // Global mappings have normal weight
      if (globalMappings[keyword]) {
        for (const [category, count] of Object.entries(globalMappings[keyword])) {
          scores[category] = (scores[category] || 0) + (count as number);
        }
      }
    }
    
    // Find category with highest score
    let bestCategory = 'Altro';
    let bestScore = 0;
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
      }
    }
    
    // Calculate normalized confidence score (0-1)
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? bestScore / totalScore : 0;
    
    return {
      category: bestCategory,
      confidence,
      scores
    };
  }

  // Determine if feedback should be requested
  private shouldAskForFeedback(categoryMatch: { confidence: number }, userId: string) {
    // 1. If confidence is high, don't ask for feedback
    if (categoryMatch.confidence >= this.confidenceThreshold) {
      return false;
    }
    
    // 2. Don't ask for feedback for too many consecutive transactions
    if (this.feedbackRequestCount >= 3) {
      this.feedbackRequestCount = 0;
      return false;
    }
    
    // 3. Balance learning and user experience
    // If user has already provided many feedbacks, ask less frequently
    const userFeedbackCount = this.getUserFeedbackCount(userId);
    if (userFeedbackCount > 50 && Math.random() > 0.5) {
      return false;
    }
    
    // Increment feedback request counter
    this.feedbackRequestCount++;
    return true;
  }

  // Process user feedback for category correction
  async processFeedback(transactionId: number, selectedCategory: string, userId: string) {
    try {
      const transaction = this.getTransactionById(transactionId);
      if (!transaction) return { success: false, error: 'Transaction not found' };
      
      // Extract keywords from description
      const keywords = this.extractKeywords(transaction.description);
      this.logDebug('Processing feedback for keywords:', keywords);
      
      if (keywords.length === 0) {
        return { success: false, error: 'No keywords extracted' };
      }
      
      // 1. Update direct mappings (highest priority)
      const directUpdateResult = await userCategoryMappings.updateDirectMappings(keywords, selectedCategory, userId);
      
      // 2. Update user probabilistic mappings
      await userCategoryMappings.updateMappings(transaction.description, selectedCategory, userId);
      
      // 3. Update global mappings
      for (const keyword of keywords) {
        await globalCategoryMappings.updateGlobalMapping(keyword, selectedCategory);
      }
      
      // 4. Update transaction with the correct category
      const updatedTransaction = {
        ...transaction,
        category: selectedCategory,
        confidence: 1.0, // Maximum confidence for user selection
        metadata: {
          ...transaction.metadata,
          corrected: true,
          originalCategory: transaction.category
        }
      };
      
      // Save the updated transaction
      this.updateTransaction(updatedTransaction);
      
      // Reset consecutive feedback counter
      this.feedbackRequestCount = 0;
      
      // Clear the direct mappings cache to force reload on next use
      this.directMappingsCache.delete(userId);
      
      // Verify the update worked for at least the first keyword
      if (keywords.length > 0) {
        const verificationResult = await userCategoryMappings.verifyDirectMappingSaved(
          keywords[0], 
          selectedCategory, 
          userId
        );
        
        if (!verificationResult) {
          this.logDebug('Verification failed, attempting recovery save');
          await userCategoryMappings.forceSaveDirectMapping(
            keywords[0], 
            selectedCategory, 
            userId
          );
        }
      }
      
      return { 
        success: true, 
        updatedTransaction,
        directUpdateResult 
      };
      
    } catch (error) {
      console.error('Error processing feedback:', error);
      
      // Recovery attempt
      try {
        const transaction = this.getTransactionById(transactionId);
        if (transaction) {
          const keywords = this.extractKeywords(transaction.description);
          if (keywords.length > 0) {
            await userCategoryMappings.forceSaveDirectMapping(
              keywords[0], 
              selectedCategory, 
              userId
            );
            return { success: true, recovery: true };
          }
        }
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
      
      return { success: false, error: (error as Error).message };
    }
  }

  // Update user category mappings in Supabase
  private async updateUserMappings(keywords: string[], category: string, userId: string) {
    for (const keyword of keywords) {
      try {
        // Get existing mapping or create new
        const { data: existing } = await supabase
          .from('user_category_mappings')
          .select('*')
          .eq('user_id', userId)
          .eq('keyword', keyword)
          .maybeSingle();
        
        if (existing) {
          // Update existing mapping
          const categories = typeof existing.categories === 'string' 
            ? JSON.parse(existing.categories) 
            : existing.categories;
          
          categories[category] = (categories[category] || 0) + 1;
          
          await supabase
            .from('user_category_mappings')
            .update({ 
              categories,
              updated_at: new Date()
            })
            .eq('id', existing.id);
        } else {
          // Create new mapping
          const categories: Record<string, number> = {};
          categories[category] = 1;
          
          await supabase
            .from('user_category_mappings')
            .insert({
              user_id: userId,
              keyword,
              categories,
              created_at: new Date(),
              updated_at: new Date()
            });
        }
        
        // Update local cache
        if (!this.localMappingCache[userId]) {
          this.localMappingCache[userId] = {};
        }
        if (!this.localMappingCache[userId][keyword]) {
          this.localMappingCache[userId][keyword] = {};
        }
        this.localMappingCache[userId][keyword][category] = 
          (this.localMappingCache[userId][keyword][category] || 0) + 1;
        
      } catch (error) {
        console.error(`Error updating user mappings for keyword '${keyword}':`, error);
      }
    }
  }

  // Update global category mappings in Supabase
  private async updateGlobalMappings(keywords: string[], category: string) {
    for (const keyword of keywords) {
      try {
        // Get existing global mapping or create new
        const { data: existing } = await supabase
          .from('global_category_mappings')
          .select('*')
          .eq('keyword', keyword)
          .maybeSingle();
        
        if (existing) {
          // Update existing mapping
          const categories = typeof existing.categories === 'string' 
            ? JSON.parse(existing.categories) 
            : existing.categories;
          
          categories[category] = (categories[category] || 0) + 1;
          
          await supabase
            .from('global_category_mappings')
            .update({ 
              categories,
              count: existing.count + 1,
              updated_at: new Date()
            })
            .eq('id', existing.id);
        } else {
          // Create new mapping
          const categories: Record<string, number> = {};
          categories[category] = 1;
          
          await supabase
            .from('global_category_mappings')
            .insert({
              keyword,
              categories,
              count: 1,
              created_at: new Date(),
              updated_at: new Date()
            });
        }
      } catch (error) {
        console.error(`Error updating global mappings for keyword '${keyword}':`, error);
      }
    }
  }

  // Get user-specific mappings from Supabase or cache
  private async getUserMappings(userId: string): Promise<Record<string, Record<string, number>>> {
    // Check if we have it in cache
    if (this.localMappingCache[userId]) {
      return this.localMappingCache[userId];
    }
    
    try {
      // Fetch from Supabase
      const { data } = await supabase
        .from('user_category_mappings')
        .select('keyword, categories')
        .eq('user_id', userId);
      
      // Format the data for easier access
      const mappings: Record<string, Record<string, number>> = {};
      
      if (data && data.length > 0) {
        data.forEach(item => {
          const categories = typeof item.categories === 'string' 
            ? JSON.parse(item.categories) 
            : item.categories;
          
          mappings[item.keyword] = categories;
        });
      }
      
      // Save to cache
      this.localMappingCache[userId] = mappings;
      
      return mappings;
    } catch (error) {
      console.error('Error fetching user mappings:', error);
      return {};
    }
  }

  // Get global mappings from Supabase
  private async getGlobalMappings(): Promise<Record<string, Record<string, number>>> {
    try {
      const { data } = await supabase
        .from('global_category_mappings')
        .select('keyword, categories');
      
      // Format the data for easier access
      const mappings: Record<string, Record<string, number>> = {};
      
      if (data && data.length > 0) {
        data.forEach(item => {
          const categories = typeof item.categories === 'string' 
            ? JSON.parse(item.categories) 
            : item.categories;
          
          mappings[item.keyword] = categories;
        });
      }
      
      return mappings;
    } catch (error) {
      console.error('Error fetching global mappings:', error);
      return {};
    }
  }

  // Get suggested categories based on keywords
  private getSuggestedCategories(keywords: string[]): any[] {
    // This is a simplified version, in a real app we'd use more sophisticated logic
    // to determine which categories to suggest based on the keywords
    
    // For now, we'll just return all main categories
    return mainCategories;
  }

  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    // Remove stopwords, tokenize and filter
    const stopwords = ['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'i', 'gli', 'le'];
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.includes(word));
  }

  // Get the count of feedback provided by user
  private getUserFeedbackCount(userId: string): number {
    // In a real app, this would be fetched from the database
    // For now, return a dummy value
    return 10;
  }
  
  // Debug logging function
  private logDebug(message: string, data?: any): void {
    if (this.enableDebugLogging) {
      console.log(`[TransactionStore] ${message}`, data || '');
    }
  }
}

// Create singleton instance
export const transactionStore = new TransactionStore();
