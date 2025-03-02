import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/utils/transactionRouter';
import { transactionStore } from '@/utils/transactionStore';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';

export interface SavedTransaction extends Transaction {
  id: string;
  userId: string;
  source: string;
  synced: boolean;
  createdAt: string;
}

// Queue for offline transactions
let offlineTransactionQueue: SavedTransaction[] = [];

export const useTransactionPersistence = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<SavedTransaction | null>(null);
  const { setExpenses, expenses, setDeposits, deposits } = useLifestyleLock();

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processPendingTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const user = supabase.auth.getUser();
      if (!user) return;

      // Subscribe to transactions table changes
      const channel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'transactions' },
          (payload) => {
            handleNewTransaction(payload.new as SavedTransaction);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  // Handle new transaction from realtime subscription
  const handleNewTransaction = (transaction: SavedTransaction) => {
    // Update UI based on transaction type
    updateUIBasedOnTransaction(transaction);
    
    // Update local storage for offline access
    const recentTransactions = getRecentTransactionsFromStorage();
    saveRecentTransactionsToStorage([transaction, ...recentTransactions].slice(0, 20));
    
    // Show toast notification
    toast({
      title: "Nuova transazione",
      description: `${transaction.type === 'ENTRATA' ? 'Entrata' : 
                   transaction.type === 'USCITA' ? 'Spesa' : 
                   transaction.type === 'INVESTIMENTO' ? 'Investimento' : 
                   'Transazione'} di ${Math.abs(transaction.amount)}€ registrata.`,
      variant: "default",
    });
  };

  // Save transaction to database
  const saveTransaction = async (transaction: Transaction): Promise<SavedTransaction | null> => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("Utente non autenticato");
      }
      
      // Prepare transaction for saving
      const newTransaction: Omit<SavedTransaction, 'id'> = {
        ...transaction,
        userId,
        source: 'cashTalk',
        synced: isOnline,
        createdAt: new Date().toISOString()
      };
      
      // For local state updates (immediately show in UI)
      const localTransaction = {
        ...newTransaction,
        id: `local_${Date.now()}`
      } as SavedTransaction;
      
      // First update local UI
      updateUIBasedOnTransaction(localTransaction);
      
      // If offline, queue for later syncing
      if (!isOnline) {
        offlineTransactionQueue.push(localTransaction);
        saveOfflineQueueToStorage();
        setLastSavedTransaction(localTransaction);
        
        toast({
          title: "Salvato offline",
          description: "La transazione verrà sincronizzata quando tornerai online.",
          variant: "default",
        });
        
        setIsLoading(false);
        return localTransaction;
      }
      
      // If online, save to database
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      const savedTransaction = data as SavedTransaction;
      setLastSavedTransaction(savedTransaction);
      
      // Add to recent transactions for offline access
      const recentTransactions = getRecentTransactionsFromStorage();
      saveRecentTransactionsToStorage([savedTransaction, ...recentTransactions].slice(0, 20));
      
      // Show success toast
      toast({
        title: "Transazione salvata",
        description: `La tua ${transaction.type === 'ENTRATA' ? 'entrata' : 
                     transaction.type === 'USCITA' ? 'spesa' : 
                     transaction.type === 'INVESTIMENTO' ? 'investimento' : 
                     'transazione'} è stata registrata con successo.`,
        variant: "default",
      });
      
      return savedTransaction;
    } catch (error) {
      console.error("Errore nel salvataggio della transazione:", error);
      
      // Auto-retry logic
      setTimeout(() => {
        if (isOnline) {
          saveTransaction(transaction)
            .then(result => {
              if (result) {
                toast({
                  title: "Transazione recuperata",
                  description: "Il salvataggio è stato completato dopo un tentativo di recupero.",
                  variant: "default",
                });
              }
            });
        }
      }, 3000);
      
      toast({
        title: "Errore",
        description: `Non è stato possibile salvare la transazione. ${isOnline ? 'Tentativo di recupero in corso...' : 'Verrà recuperata quando sarai online.'}`,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Process pending offline transactions
  const processPendingTransactions = async () => {
    if (!isOnline || offlineTransactionQueue.length === 0) return;
    
    // Load any stored offline transactions
    loadOfflineQueueFromStorage();
    
    if (offlineTransactionQueue.length === 0) return;
    
    toast({
      title: "Sincronizzazione",
      description: `Sincronizzazione di ${offlineTransactionQueue.length} transazioni offline...`,
      variant: "default",
    });
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    for (const transaction of offlineTransactionQueue) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            ...transaction,
            synced: true
          });
        
        if (error) {
          failedSyncs.push(transaction);
        } else {
          successfulSyncs.push(transaction);
        }
      } catch (error) {
        failedSyncs.push(transaction);
      }
    }
    
    // Update offline queue with only failed transactions
    offlineTransactionQueue = failedSyncs;
    saveOfflineQueueToStorage();
    
    if (successfulSyncs.length > 0) {
      toast({
        title: "Sincronizzazione completata",
        description: `${successfulSyncs.length} transazioni sincronizzate con successo${failedSyncs.length > 0 ? `, ${failedSyncs.length} in attesa` : ''}.`,
        variant: "default",
      });
    }
    
    if (failedSyncs.length > 0) {
      toast({
        title: "Sincronizzazione parziale",
        description: `${failedSyncs.length} transazioni verranno sincronizzate alla prossima connessione.`,
        variant: "default",
      });
    }
  };

  // Get recent transactions
  const getRecentTransactions = async (): Promise<SavedTransaction[]> => {
    // First try to get from database
    if (isOnline) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        if (userId) {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .limit(20);
          
          if (error) {
            throw error;
          }
          
          // Update local storage for offline access
          saveRecentTransactionsToStorage(data as SavedTransaction[]);
          return data as SavedTransaction[];
        }
      } catch (error) {
        console.error("Errore nel recupero delle transazioni:", error);
      }
    }
    
    // If offline or error, get from local storage
    return getRecentTransactionsFromStorage();
  };

  // Update UI based on transaction type
  const updateUIBasedOnTransaction = (transaction: Transaction) => {
    try {
      // First add to transaction store to keep history
      transactionStore.addTransaction(transaction);
      
      // Then update the appropriate UI lists based on transaction type
      if (transaction.type === 'USCITA') {
        // Create new expense item
        const newExpense = {
          id: Date.now(),
          category: transaction.category || 'Altro',
          spent: Math.abs(transaction.amount),
          baseline: Math.abs(transaction.amount),
          icon: getCategoryIcon(transaction.category || 'Altro'),
          date: transaction.date
        };
        
        // Update expenses state
        setExpenses([...expenses, newExpense]);
      } else if (transaction.type === 'INVESTIMENTO') {
        // Create new deposit item
        const newDeposit = {
          id: Date.now(),
          date: transaction.date,
          amount: Math.abs(transaction.amount),
          description: transaction.description,
          category: transaction.category
        };
        
        // Update deposits state
        setDeposits([...deposits, newDeposit]);
      }
      
      // For income types, we'd need to update the income state similarly
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'UI:", error);
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string): JSX.Element => {
    const Home = () => <div>🏠</div>;
    const ShoppingBag = () => <div>🛒</div>;
    const Coffee = () => <div>☕</div>;
    const Car = () => <div>🚗</div>;
    const Smartphone = () => <div>📱</div>;
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('alloggio') || categoryLower.includes('casa') || categoryLower.includes('affitto')) {
      return <Home />;
    } else if (categoryLower.includes('cibo') || categoryLower.includes('spesa') || categoryLower.includes('alimentari')) {
      return <ShoppingBag />;
    } else if (categoryLower.includes('intrattenimento') || categoryLower.includes('divertimento') || categoryLower.includes('svago')) {
      return <Coffee />;
    } else if (categoryLower.includes('trasporto') || categoryLower.includes('auto') || categoryLower.includes('viaggio')) {
      return <Car />;
    } else {
      return <Smartphone />;
    }
  };

  // Local storage functions for offline support
  const saveRecentTransactionsToStorage = (transactions: SavedTransaction[]) => {
    try {
      localStorage.setItem('recentTransactions', JSON.stringify(transactions));
    } catch (error) {
      console.error("Errore nel salvataggio delle transazioni locali:", error);
    }
  };

  const getRecentTransactionsFromStorage = (): SavedTransaction[] => {
    try {
      const stored = localStorage.getItem('recentTransactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Errore nel recupero delle transazioni locali:", error);
      return [];
    }
  };

  const saveOfflineQueueToStorage = () => {
    try {
      localStorage.setItem('offlineTransactionQueue', JSON.stringify(offlineTransactionQueue));
    } catch (error) {
      console.error("Errore nel salvataggio della coda offline:", error);
    }
  };

  const loadOfflineQueueFromStorage = () => {
    try {
      const stored = localStorage.getItem('offlineTransactionQueue');
      if (stored) {
        offlineTransactionQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Errore nel caricamento della coda offline:", error);
    }
  };

  return {
    saveTransaction,
    getRecentTransactions,
    isLoading,
    isOnline,
    lastSavedTransaction,
    updateUIBasedOnTransaction
  };
};
