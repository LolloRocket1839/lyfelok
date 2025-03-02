
import { Entity, ExtractedEntities, ProcessedText, ClassificationResult } from './types';

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
    
    return entities;
  }
}
