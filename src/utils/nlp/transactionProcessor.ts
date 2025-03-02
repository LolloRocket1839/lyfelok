
import { Transaction, TransactionType } from '../transactionRouter';
import { Entity } from './types';

export interface ClassificationResult {
  type: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';
  confidence: number;
  subcategory: string | null;
  allScores: Record<string, number>;
}

/**
 * Arricchisce la transazione con informazioni aggiuntive
 */
export function enrichTransaction(entities: Entity, classification: ClassificationResult): any {
  const transaction = {
    type: classification.type,
    amount: entities.amount,
    currency: entities.currency,
    date: entities.date,
    description: entities.description,
    category: classification.subcategory,
    confidence: classification.confidence,
    metadata: {
      corrected: (entities.wasTypoCorrected === true),
      originalInput: entities.originalInput,
      allScores: classification.allScores,
      extractedKeywords: entities.keywords,
      warnings: [] as string[],
      corrections: [] as string[]
    }
  };
  
  // Modifica l'importo in base al tipo di transazione
  if (transaction.type === 'SPESA') {
    // Per le spese, l'importo è negativo se non lo è già
    transaction.amount = Math.abs(transaction.amount as number) * -1;
  } else {
    // Per altri tipi, l'importo è positivo
    transaction.amount = Math.abs(transaction.amount as number);
  }
  
  return transaction;
}

/**
 * Valida la transazione e controlla la coerenza dei dati
 */
export function validateTransaction(transaction: any): any {
  const validated = { ...transaction };
  const currentDate = new Date();
  
  // Controlla la presenza dell'importo
  if (validated.amount === null || isNaN(validated.amount)) {
    validated.amount = 0; // Default
    validated.metadata.warnings.push('missing_amount');
  }
  
  // Controlla la validità della data
  if (!(validated.date instanceof Date) || isNaN(validated.date.getTime())) {
    validated.date = currentDate; // Default a oggi
    validated.metadata.warnings.push('invalid_date');
  }
  
  // Non permettere date future (a meno che non sia un'entrata ricorrente)
  if (validated.date > currentDate && validated.type !== 'ENTRATA') {
    validated.date = currentDate;
    validated.metadata.warnings.push('future_date');
  }
  
  // Controlla la coerenza tra tipo e importo
  if (validated.type === 'SPESA' && validated.amount > 0) {
    validated.amount *= -1;
    validated.metadata.corrections.push('amount_sign_corrected');
  }
  
  return validated;
}

/**
 * Maps the internal type to TransactionType enum
 */
export function mapTypeToTransactionType(type: string): TransactionType {
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
