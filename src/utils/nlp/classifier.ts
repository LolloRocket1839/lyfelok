
import { ProcessedText, ClassificationResult, IntentType } from './types';
import { KnowledgeBase } from './knowledgeBase';

export class Classifier {
  static classify(processedText: ProcessedText): ClassificationResult {
    const { normalizedText } = processedText;
    
    // Default classification
    let classification: ClassificationResult = {
      intent: 'unknown',
      confidence: 0,
      category: null
    };
    
    // Check for income related intents
    if (this.matchesAny(normalizedText, KnowledgeBase.income.variations)) {
      classification = {
        intent: 'add_income',
        confidence: 0.9,
        category: 'income'
      };
    }
    
    // Check for expense related intents
    else if (this.matchesAny(normalizedText, KnowledgeBase.expense.variations)) {
      classification = {
        intent: 'add_expense',
        confidence: 0.9,
        category: 'expense'
      };
    }
    
    // Check for investment related intents
    else if (this.matchesAny(normalizedText, KnowledgeBase.investment.variations)) {
      classification = {
        intent: 'add_investment',
        confidence: 0.9,
        category: 'investment'
      };
    }
    
    // Check for view changing intents
    else if (this.matchesAny(normalizedText, KnowledgeBase.navigation.variations)) {
      classification = {
        intent: 'change_view',
        confidence: 0.9,
        category: 'navigation'
      };
    }
    
    // Specific view intents
    for (const view of ['dashboard', 'finances', 'projections']) {
      if (normalizedText.includes(view) || 
          (view === 'finances' && (normalizedText.includes('expense') || normalizedText.includes('investment')))) {
        classification = {
          intent: 'change_view',
          confidence: 0.95,
          category: view as IntentType
        };
        break;
      }
    }
    
    return classification;
  }
  
  private static matchesAny(text: string, variations: string[]): boolean {
    return variations.some(variation => text.includes(variation));
  }
}
