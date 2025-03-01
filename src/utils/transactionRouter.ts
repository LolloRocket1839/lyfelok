
import { ExpenseItem, DepositItem } from '@/hooks/useLifestyleLock';
import { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';
import { TransactionStore } from './transactionStore';
import React from 'react';

export type TransactionType = 'ENTRATA' | 'USCITA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';

export interface Transaction {
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  date: string;
  metadata?: Record<string, any>;
  alternativeCategories?: string[]; // Categorie alternative suggerite
  confidence?: number; // Livello di confidenza nella categorizzazione
}

// Database di alimenti e ingredienti
const foodItemsDatabase = [
  // Condimenti e spezie
  'sale', 'pepe', 'origano', 'basilico', 'rosmarino', 'curry', 'paprika', 'cannella',
  // Frutta e verdura
  'mela', 'banana', 'pera', 'arancia', 'limone', 'pomodoro', 'lattuga', 'carota',
  // Altri alimenti comuni
  'pane', 'latte', 'uova', 'pasta', 'riso', 'formaggio', 'yogurt', 'burro',
  'spesa', 'supermercato', 'cibo', 'alimentari', 'grocery', 'frutta', 'verdura',
  'carne', 'pesce', 'forno', 'panetteria', 'pasticceria', 'dolce', 'zucchero'
];

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
  
  // Check if the description contains food items and correct category if needed
  let category = analysis.category;
  let confidence = analysis.confidence === 'high' ? 0.9 : 
                  analysis.confidence === 'medium' ? 0.7 : 0.5;
  
  if (category === 'Altro' || !category) {
    const descriptionLower = (analysis.description || '').toLowerCase();
    const words = descriptionLower.split(/\s+/);
    
    // Check if any word matches a food item
    for (const word of words) {
      if (foodItemsDatabase.includes(word)) {
        category = 'Cibo';
        confidence = 0.85; // High confidence but not highest
        break;
      }
    }
  }
  
  return {
    type,
    amount: analysis.amount,
    description: analysis.description || analysis.unknownWords?.join(' ') || analysis.category,
    category: category,
    date,
    alternativeCategories: analysis.alternativeCategories,
    confidence,
    metadata: {
      confidence: analysis.confidence,
      baselineAmount: analysis.baselineAmount,
      rawInput: analysis.metadata?.rawInput || '',
      processingTime: analysis.metadata?.processingTime || new Date()
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
  private userCategoryMappings: Map<string, Record<string, Record<string, number>>> = new Map();
  private confidenceThreshold: number = 0.7;
  
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
    // Apply enhanced categorization if needed
    if ((transaction.category === 'Altro' || !transaction.category) && transaction.type === 'USCITA') {
      this.enhanceTransactionCategory(transaction);
    }
    
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
  
  // Helper method to enhance transaction category with user feedback and food database
  private enhanceTransactionCategory(transaction: Transaction) {
    if (!transaction.description) return;
    
    const words = transaction.description.toLowerCase().split(/\s+/);
    
    // Check if words match food database
    for (const word of words) {
      if (foodItemsDatabase.includes(word)) {
        transaction.category = 'Cibo';
        transaction.confidence = 0.9; // High confidence
        return;
      }
    }
    
    // If no match in food database, try user-specific mappings
    // This would be expanded in a production environment to use user-specific data
  }
  
  // Process user feedback for category correction
  processFeedback(transactionId: number, selectedCategory: string, userId: string = 'default') {
    const transaction = this.transactionStore.getTransactionById(transactionId);
    if (!transaction) return false;
    
    // Update the transaction with the corrected category
    const updatedTransaction = {
      ...transaction,
      category: selectedCategory,
      metadata: {
        ...transaction.metadata,
        corrected: true,
        originalCategory: transaction.category
      }
    };
    
    // Save the updated transaction
    this.transactionStore.updateTransaction(updatedTransaction);
    
    // Update user category mappings for future transactions
    this.updateUserCategoryMapping(transaction.description, selectedCategory, userId);
    
    return true;
  }
  
  // Update user category mappings based on feedback
  private updateUserCategoryMapping(description: string, category: string, userId: string) {
    if (!description) return;
    
    // Get existing user mappings or create new ones
    let userMappings = this.userCategoryMappings.get(userId) || {};
    
    // Extract keywords from description
    const keywords = this.extractKeywords(description);
    
    // Update mappings for each keyword
    for (const keyword of keywords) {
      if (!userMappings[keyword]) {
        userMappings[keyword] = {};
      }
      
      // Increment counter for this category
      userMappings[keyword][category] = (userMappings[keyword][category] || 0) + 1;
    }
    
    // Save updated mappings
    this.userCategoryMappings.set(userId, userMappings);
    console.log(`Updated user category mappings for user ${userId}:`, userMappings);
  }
  
  // Extract keywords from description
  private extractKeywords(description: string): string[] {
    // Extract significant words from description
    return description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);
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
// Changed to return icon component creator function instead of direct JSX
function determineExpenseIcon(category: string): JSX.Element {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('alloggio') || categoryLower.includes('casa') || categoryLower.includes('affitto')) {
    return React.createElement(Home, { size: 18 });
  } else if (categoryLower.includes('cibo') || categoryLower.includes('spesa') || categoryLower.includes('alimentari')) {
    return React.createElement(ShoppingBag, { size: 18 });
  } else if (categoryLower.includes('intrattenimento') || categoryLower.includes('divertimento') || categoryLower.includes('svago')) {
    return React.createElement(Coffee, { size: 18 });
  } else if (categoryLower.includes('trasporto') || categoryLower.includes('auto') || categoryLower.includes('viaggio')) {
    return React.createElement(Car, { size: 18 });
  } else {
    return React.createElement(Smartphone, { size: 18 });
  }
}
