import { Entity, ExtractedEntities, ProcessedText, ClassificationResult } from './types';
import { autoCategorize } from '../categorization';

export class EntityExtractor {
  static extract(processedText: ProcessedText, classification: ClassificationResult): ExtractedEntities {
    const entities: ExtractedEntities = {
      amount: null,
      currency: 'EUR', // Default
      date: new Date(), // Default to today
      description: '',
      keywords: []
    };
    
    // Extract amount
    const amountMatch = processedText.originalText.match(/\b(\d+(?:\.\d{1,2})?)\b/);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1]);
    }
    
    // Extract currency (default is EUR)
    if (processedText.originalText.includes('dollari') || processedText.originalText.includes('$')) {
      entities.currency = 'USD';
    } else if (processedText.originalText.includes('sterline') || processedText.originalText.includes('£')) {
      entities.currency = 'GBP';
    }
    
    // Extract keywords (remove stopwords)
    const stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra'];
    entities.keywords = processedText.tokens
      .filter(word => word.length > 2) // Ignore very short words
      .filter(word => !stopWords.includes(word)) // Remove stop words
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
    
    // Use remaining words as description
    entities.description = processedText.cleanText;
    
    // Try to categorize based on description using autoCategorization
    if (entities.description) {
      const categorization = autoCategorize(entities.description);
      if (categorization && categorization.category) {
        // Add category to classification if not already set
        if (!classification.subcategory) {
          classification.subcategory = categorization.category;
        }
      }
    }
    
    return entities;
  }
  
  // New method to enrich transaction data after processing
  static enrichTransactionData(transaction: any, text: string): any {
    if (!transaction) return null;
    
    // Try to extract more detailed category info
    const categorization = autoCategorize(text);
    if (categorization && categorization.category) {
      // Only update if no category was previously assigned
      if (!transaction.category || transaction.category === 'Altro') {
        transaction.category = categorization.category;
      }
    }
    
    return transaction;
  }
}
