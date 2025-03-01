
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
  
  // Update an existing transaction
  updateTransaction(updatedTransaction: Transaction) {
    const index = this.transactions.findIndex(t => 
      t.description === updatedTransaction.description && 
      t.amount === updatedTransaction.amount &&
      t.date === updatedTransaction.date
    );
    
    if (index !== -1) {
      this.transactions[index] = updatedTransaction;
      console.log('Transaction updated in store:', updatedTransaction);
      
      // Notify appropriate listeners
      this.notify(updatedTransaction.type, updatedTransaction);
      this.notify('UPDATE', updatedTransaction);
      this.notify('ALL', updatedTransaction);
      
      return updatedTransaction;
    }
    
    return null;
  }
  
  // Get transaction by ID (simplified - in a real app, would use actual IDs)
  getTransactionById(id: number): Transaction | null {
    // In this simplified version, we just get by index
    // In a real app, each transaction would have a unique ID
    if (id >= 0 && id < this.transactions.length) {
      return this.transactions[id];
    }
    return null;
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
