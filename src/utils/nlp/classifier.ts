
import { ProcessedText, ClassificationResult, IntentType } from './types';
import { knowledgeBase } from './knowledgeBase';

export class Classifier {
  static classify(processedText: ProcessedText): ClassificationResult {
    const { normalizedText } = processedText;
    
    // Default classification
    let classification: ClassificationResult = {
      type: 'SPESA',
      confidence: 0,
      subcategory: null,
      allScores: {}
    };
    
    // Check for income related intents
    if (this.matchesAny(normalizedText, knowledgeBase.intents.add_income)) {
      classification = {
        type: 'ENTRATA',
        confidence: 0.9,
        subcategory: 'income',
        allScores: { 'ENTRATA': 0.9, 'SPESA': 0.1, 'INVESTIMENTO': 0.1 }
      };
    }
    
    // Check for expense related intents
    else if (this.matchesAny(normalizedText, knowledgeBase.intents.add_expense)) {
      classification = {
        type: 'SPESA',
        confidence: 0.9,
        subcategory: 'expense',
        allScores: { 'SPESA': 0.9, 'ENTRATA': 0.1, 'INVESTIMENTO': 0.1 }
      };
    }
    
    // Check for investment related intents
    else if (this.matchesAny(normalizedText, knowledgeBase.intents.add_investment)) {
      classification = {
        type: 'INVESTIMENTO',
        confidence: 0.9,
        subcategory: 'investment',
        allScores: { 'INVESTIMENTO': 0.9, 'SPESA': 0.1, 'ENTRATA': 0.1 }
      };
    }
    
    // Check for view changing intents
    else if (this.matchesAny(normalizedText, knowledgeBase.intents.view_dashboard)) {
      classification = {
        type: 'SPESA', // Default type, but this won't be used for view changes
        confidence: 0.9,
        subcategory: 'navigation',
        allScores: {}
      };
    }
    
    // Look for specific categories
    if (classification.type === 'SPESA') {
      for (const category of knowledgeBase.entities.expense_category) {
        if (normalizedText.includes(category)) {
          classification.subcategory = category;
          break;
        }
      }
    } else if (classification.type === 'INVESTIMENTO') {
      for (const category of knowledgeBase.entities.investment_category) {
        if (normalizedText.includes(category)) {
          classification.subcategory = category;
          break;
        }
      }
    }
    
    return classification;
  }
  
  private static matchesAny(text: string, variations: string[]): boolean {
    return variations.some(variation => text.includes(variation));
  }
}
