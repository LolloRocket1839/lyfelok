
import { ExpenseItem, DepositItem } from '@/hooks/useLifestyleLock';
import { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';

export type TransactionType = 'ENTRATA' | 'USCITA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';

export interface Transaction {
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  date: string;
  metadata?: Record<string, any>;
}

// Converts NLP analysis result to a standardized transaction
export const convertAnalysisToTransaction = (
  analysis: NlpAnalysisResult
): Transaction => {
  // Default date to today if not specified
  const date = analysis.date || new Date().toISOString().split('T')[0];
  
  // Map NLP result type to transaction type
  let type: TransactionType = 'USCITA';
  if (analysis.type === 'entrata') {
    type = 'ENTRATA';
  } else if (analysis.type === 'investimento') {
    type = 'INVESTIMENTO';
  } else if (analysis.type === 'spesa') {
    type = 'USCITA';
  }
  
  // Special case for income increases (stipendio significativamente superiore)
  if (analysis.type === 'entrata' && 
      (analysis.category === 'Stipendio' || analysis.category === 'Salario') && 
      analysis.amount > 0) {
    // This could be an income increase if it's significantly higher than previous income
    // The actual logic for this detection would happen in the router
  }
  
  return {
    type,
    amount: analysis.amount,
    description: analysis.unknownWords?.join(' ') || analysis.category,
    category: analysis.category,
    date,
    metadata: {
      confidence: analysis.confidence,
      baselineAmount: analysis.baselineAmount
    }
  };
};

// Router implementation as described in the specification
export class TransactionRouter {
  private incomeService: any;
  private expenseService: any;
  private investmentService: any;
  private incomeIncreaseService: any;
  private unclassifiedService: any;
  private transactionStore: TransactionStore;
  
  constructor(transactionStore: TransactionStore) {
    this.transactionStore = transactionStore;
    
    // Initialize services (these will be implemented with hooks/context in React)
    this.incomeService = {
      add: (transaction: Transaction) => {
        console.log('Adding income transaction:', transaction);
        this.transactionStore.addTransaction(transaction);
        return transaction;
      }
    };
    
    this.expenseService = {
      add: (transaction: Transaction) => {
        console.log('Adding expense transaction:', transaction);
        this.transactionStore.addTransaction(transaction);
        return transaction;
      }
    };
    
    this.investmentService = {
      add: (transaction: Transaction) => {
        console.log('Adding investment transaction:', transaction);
        this.transactionStore.addTransaction(transaction);
        return transaction;
      }
    };
    
    this.incomeIncreaseService = {
      add: (transaction: Transaction) => {
        console.log('Adding income increase transaction:', transaction);
        this.transactionStore.addTransaction(transaction);
        return transaction;
      }
    };
    
    this.unclassifiedService = {
      add: (transaction: Transaction) => {
        console.log('Adding unclassified transaction:', transaction);
        this.transactionStore.addTransaction(transaction);
        return transaction;
      }
    };
  }
  
  route(transaction: Transaction) {
    // Check for special case: could be income increase
    if (transaction.type === 'ENTRATA' && 
        transaction.amount > 0 && 
        (transaction.category === 'Stipendio' || transaction.category === 'Salario')) {
      // Logic to determine if this is a significant increase could be added here
      // For now, we'll assume all salary entries above a certain threshold are increases
      if (transaction.amount >= 3000) {
        transaction.type = 'AUMENTO_REDDITO';
      }
    }
    
    // Route to appropriate service
    switch(transaction.type) {
      case 'ENTRATA':
        return this.incomeService.add(transaction);
      case 'USCITA':
        return this.expenseService.add(transaction);
      case 'INVESTIMENTO':
        return this.investmentService.add(transaction);
      case 'AUMENTO_REDDITO':
        return this.incomeIncreaseService.add(transaction);
      default:
        return this.unclassifiedService.add(transaction);
    }
  }
  
  // Helper method to convert a transaction to an expense item
  convertToExpense(transaction: Transaction): ExpenseItem {
    return {
      id: Date.now(),
      category: transaction.category || 'Altro',
      spent: transaction.amount,
      baseline: transaction.metadata?.baselineAmount || transaction.amount,
      icon: determineExpenseIcon(transaction.category || 'Altro'),
      date: transaction.date
    };
  }
  
  // Helper method to convert a transaction to a deposit item
  convertToDeposit(transaction: Transaction): DepositItem {
    return {
      id: Date.now(),
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category
    };
  }
}

// Helper function to determine icon based on category
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';
import { TransactionStore } from './transactionStore';

function determineExpenseIcon(category: string): JSX.Element {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('alloggio') || categoryLower.includes('casa') || categoryLower.includes('affitto')) {
    return <Home size={18} />;
  } else if (categoryLower.includes('cibo') || categoryLower.includes('spesa') || categoryLower.includes('alimentari')) {
    return <ShoppingBag size={18} />;
  } else if (categoryLower.includes('intrattenimento') || categoryLower.includes('divertimento') || categoryLower.includes('svago')) {
    return <Coffee size={18} />;
  } else if (categoryLower.includes('trasporto') || categoryLower.includes('auto') || categoryLower.includes('viaggio')) {
    return <Car size={18} />;
  } else {
    return <Smartphone size={18} />;
  }
}
