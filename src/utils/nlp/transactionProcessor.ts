
import { Transaction, TransactionType } from '../transactionRouter';
import { Entity, ClassificationResult, ProcessedText, ExtractedEntities } from './types';

export class TransactionProcessor {
  static processIntoTransaction(
    processedText: ProcessedText, 
    classification: ClassificationResult, 
    entities: ExtractedEntities
  ): Transaction | null {
    try {
      const transaction: Transaction = {
        type: this.mapTypeToTransactionType(classification.type),
        amount: entities.amount || 0,
        description: entities.description || '',
        category: classification.subcategory || '',
        date: entities.date.toISOString().split('T')[0],
        metadata: {
          baselineAmount: entities.amount || 0,
          rawInput: processedText.originalText,
          processingTime: new Date()
        }
      };
      
      // Adjust amount based on transaction type
      if (transaction.type === 'USCITA' && transaction.amount > 0) {
        transaction.amount = -Math.abs(transaction.amount);
      } else if (transaction.type !== 'USCITA') {
        transaction.amount = Math.abs(transaction.amount);
      }
      
      return this.validateTransaction(transaction);
    } catch (error) {
      console.error('Error processing into transaction:', error);
      return null;
    }
  }
  
  static validateTransaction(transaction: Transaction): Transaction | null {
    if (!transaction.amount && transaction.amount !== 0) {
      console.warn('Transaction missing amount');
      return null;
    }
    
    if (!transaction.type) {
      console.warn('Transaction missing type');
      return null;
    }
    
    return transaction;
  }
  
  static mapTypeToTransactionType(type: string): TransactionType {
    switch(type) {
      case 'SPESA':
        return 'USCITA';
      case 'ENTRATA':
        return 'ENTRATA';
      case 'INVESTIMENTO':
        return 'INVESTIMENTO';
      case 'AUMENTO_REDDITO':
        return 'AUMENTO_REDDITO';
      default:
        return 'USCITA'; // Default fallback
    }
  }
}
