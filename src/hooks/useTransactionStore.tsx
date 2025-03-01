
import { useEffect, useState } from 'react';
import { Transaction } from '@/utils/transactionRouter';
import { transactionStore } from '@/utils/transactionStore';

export function useTransactionStore(type?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    // Initialize with current transactions
    setTransactions(transactionStore.getTransactions(type));
    
    // Subscribe to updates
    const unsubscribe = transactionStore.subscribe(type || 'ALL', (transaction: Transaction) => {
      setTransactions(current => [...current, transaction]);
    });
    
    return () => unsubscribe();
  }, [type]);
  
  // Function to add a new transaction
  const addTransaction = (transaction: Transaction) => {
    return transactionStore.addTransaction(transaction);
  };
  
  return {
    transactions,
    addTransaction
  };
}
