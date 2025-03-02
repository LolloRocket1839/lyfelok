
import { EntityType, TransactionType } from './types';
import { textProcessor } from './textProcessor';
import { knowledgeBase } from './knowledgeBase';

// Transaction type classifier
export const classifyTransactionType = (text: string): 'expense' | 'income' | 'investment' | 'unknown' => {
  const lowercaseText = text.toLowerCase();
  
  // Check for expense indicators
  if (
    lowercaseText.includes('speso') ||
    lowercaseText.includes('pagato') ||
    lowercaseText.includes('acquistato') ||
    lowercaseText.includes('comprato') ||
    lowercaseText.includes('spesa')
  ) {
    return 'expense';
  }
  
  // Check for income indicators
  if (
    lowercaseText.includes('ricevuto') ||
    lowercaseText.includes('guadagnato') ||
    lowercaseText.includes('incassato') ||
    lowercaseText.includes('stipendio') ||
    lowercaseText.includes('entrata')
  ) {
    return 'income';
  }
  
  // Check for investment indicators
  if (
    lowercaseText.includes('investito') ||
    lowercaseText.includes('azioni') ||
    lowercaseText.includes('borsa') ||
    lowercaseText.includes('etf') ||
    lowercaseText.includes('fondo')
  ) {
    return 'investment';
  }
  
  return 'unknown';
};

// Category classifier
export const classifyCategory = (text: string, transactionType: string): string => {
  const lowercaseText = text.toLowerCase();
  let category = 'altro';
  
  if (transactionType === 'expense') {
    // Food related
    if (
      lowercaseText.includes('pizza') ||
      lowercaseText.includes('ristorante') ||
      lowercaseText.includes('cibo') ||
      lowercaseText.includes('pranzo') ||
      lowercaseText.includes('cena') ||
      lowercaseText.includes('colazione') ||
      lowercaseText.includes('spesa') ||
      lowercaseText.includes('supermercato') ||
      lowercaseText.includes('bar')
    ) {
      category = 'cibo';
    }
    
    // Bills and utilities
    else if (
      lowercaseText.includes('bolletta') ||
      lowercaseText.includes('luce') ||
      lowercaseText.includes('gas') ||
      lowercaseText.includes('acqua') ||
      lowercaseText.includes('telefono') ||
      lowercaseText.includes('internet')
    ) {
      category = 'utenze';
    }
    
    // Transportation
    else if (
      lowercaseText.includes('trasporto') ||
      lowercaseText.includes('treno') ||
      lowercaseText.includes('bus') ||
      lowercaseText.includes('metro') ||
      lowercaseText.includes('taxi') ||
      lowercaseText.includes('benzina') ||
      lowercaseText.includes('carburante') ||
      lowercaseText.includes('auto') ||
      lowercaseText.includes('macchina')
    ) {
      category = 'trasporto';
    }
    
    // Entertainment
    else if (
      lowercaseText.includes('cinema') ||
      lowercaseText.includes('teatro') ||
      lowercaseText.includes('concerto') ||
      lowercaseText.includes('evento') ||
      lowercaseText.includes('netflix') ||
      lowercaseText.includes('spotify') ||
      lowercaseText.includes('abbonamento')
    ) {
      category = 'intrattenimento';
    }
    
    // Shopping
    else if (
      lowercaseText.includes('shopping') ||
      lowercaseText.includes('vestiti') ||
      lowercaseText.includes('scarpe') ||
      lowercaseText.includes('abbigliamento') ||
      lowercaseText.includes('accessori')
    ) {
      category = 'shopping';
    }
    
    // Health
    else if (
      lowercaseText.includes('medico') ||
      lowercaseText.includes('farmacia') ||
      lowercaseText.includes('medicine') ||
      lowercaseText.includes('salute') ||
      lowercaseText.includes('visita') ||
      lowercaseText.includes('dottore')
    ) {
      category = 'salute';
    }
    
    // Housing
    else if (
      lowercaseText.includes('affitto') ||
      lowercaseText.includes('mutuo') ||
      lowercaseText.includes('casa') ||
      lowercaseText.includes('condominio')
    ) {
      category = 'alloggio';
    }
  }
  
  else if (transactionType === 'income') {
    if (
      lowercaseText.includes('stipendio') ||
      lowercaseText.includes('salario') ||
      lowercaseText.includes('lavoro')
    ) {
      category = 'stipendio';
    }
  }
  
  else if (transactionType === 'investment') {
    category = 'investimenti';
  }
  
  return category;
};

// Process a transaction object and enrich it with classified data
export const enrichTransaction = (transaction: TransactionType): TransactionType => {
  if (!transaction.type || transaction.type === 'unknown') {
    transaction.type = classifyTransactionType(transaction.description || '');
  }
  
  if (!transaction.category) {
    transaction.category = classifyCategory(transaction.description || '', transaction.type);
  }
  
  return transaction;
};
