
import { Transaction } from './transactionRouter';

// Observer pattern for real-time UI updates
export class TransactionStore {
  private listeners: Map<string, Function[]> = new Map();
  private transactions: Transaction[] = [];
  
  // Add a transaction and notify listeners
  addTransaction(transaction: Transaction) {
    // Save to internal store (in a real app, this would go to a database)
    this.transactions.push(transaction);
    console.log('Transaction added to store:', transaction);
    
    // Notify appropriate listeners
    this.notify(transaction.type, transaction);
    this.notify('ALL', transaction);
    
    return transaction;
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
}

// Create singleton instance
export const transactionStore = new TransactionStore();
