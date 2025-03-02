
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import { transactionStore } from '@/utils/transactionStore';
import { TransactionRouter, convertAnalysisToTransaction, Transaction, TransactionType } from '@/utils/transactionRouter';
import ElegantFeedbackUI from './ElegantFeedbackUI';
import { mainCategories } from '@/utils/transactionStore';
import ResponsiveCashTalk from './ResponsiveCashTalk';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'finances' | 'projections') => void;
}

export default function ConversationalInterface({ viewSetter }: ConversationalInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const transactionRouterRef = useRef<TransactionRouter | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  
  const [feedbackNeeded, setFeedbackNeeded] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  
  const {
    handleExpenseSubmit,
    handleAddDeposit,
    handleIncomeIncrease,
    setExpenseCategory,
    setExpenseSpent,
    setExpenseBaseline,
    setExpenseDate,
    setDepositAmount,
    setDepositCategory,
    setDepositDescription,
    setDepositDate,
    setNewIncomeValue,
    setIncomeDate,
    resetExpenseForm,
    resetDepositForm,
  } = useLifestyleLock();

  useEffect(() => {
    if (user?.id) {
      enhancedNlpProcessor.setUserId(user.id);
      enhancedNlpProcessor.initialize();
      
      if (!transactionRouterRef.current) {
        transactionRouterRef.current = new TransactionRouter(transactionStore);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleTransaction = async (transaction: any) => {
      console.log('Transaction notification received:', transaction);
      
      setTransactionHistory(prev => [transaction, ...prev].slice(0, 10));
      setLastTransaction(transaction);
      
      // Store the transaction ID for later reference
      if (transaction.id) {
        setLastTransactionId(transaction.id);
      } else {
        // Fallback to using the index in history if no ID is present
        setLastTransactionId(transactionHistory.length);
      }
      
      if (user?.id && transaction.type === 'USCITA') {
        const result = await transactionStore.processTransactionWithSmartCategories(
          transaction,
          user.id
        );
        
        if (result.requireFeedback) {
          setCurrentTransaction(result.transaction);
          setSuggestedCategories(result.suggestedCategories.length > 0 
            ? result.suggestedCategories 
            : mainCategories);
          setFeedbackNeeded(true);
          return;
        }
      }
      
      updateUIBasedOnTransaction(transaction);
    };
    
    const unsubscribe = transactionStore.subscribe('ALL', handleTransaction);
    
    return () => unsubscribe();
  }, [
    handleAddDeposit, 
    handleExpenseSubmit, 
    handleIncomeIncrease, 
    resetDepositForm, 
    resetExpenseForm, 
    setDepositAmount, 
    setDepositCategory, 
    setDepositDate, 
    setDepositDescription, 
    setExpenseBaseline, 
    setExpenseCategory, 
    setExpenseDate, 
    setExpenseSpent, 
    setIncomeDate, 
    setNewIncomeValue,
    transactionHistory.length,
    user
  ]);

  const updateUIBasedOnTransaction = (transaction: any) => {
    switch(transaction.type) {
      case 'USCITA':
        setExpenseCategory(transaction.category || 'Altro');
        setExpenseSpent(transaction.amount.toString());
        setExpenseBaseline((transaction.metadata?.baselineAmount || transaction.amount).toString());
        setExpenseDate(transaction.date);
        handleExpenseSubmit();
        resetExpenseForm();
        break;
        
      case 'INVESTIMENTO':
        setDepositAmount(transaction.amount.toString());
        setDepositCategory(transaction.category || '');
        setDepositDescription(transaction.description || '');
        setDepositDate(transaction.date);
        handleAddDeposit();
        resetDepositForm();
        break;
        
      case 'AUMENTO_REDDITO':
        setNewIncomeValue(transaction.amount.toString());
        setIncomeDate(transaction.date);
        handleIncomeIncrease();
        break;
        
      case 'ENTRATA':
        setNewIncomeValue(transaction.amount.toString());
        setIncomeDate(transaction.date);
        handleIncomeIncrease();
        break;
        
      default:
        console.log('Unhandled transaction type:', transaction.type);
    }
  };

  const handleCategorySelection = async (categoryId: string) => {
    if (!currentTransaction || !lastTransactionId || !user?.id) {
      console.error('Missing required data for category update:', {
        transaction: currentTransaction,
        id: lastTransactionId,
        userId: user?.id
      });
      showToast("Dati mancanti per l'aggiornamento della categoria", "destructive");
      return;
    }
    
    try {
      console.log('Processing category feedback with:', {
        transactionId: lastTransactionId,
        categoryId: categoryId,
        userId: user.id
      });
      
      const result = await transactionStore.processFeedback(
        lastTransactionId,
        categoryId,
        user.id
      );
      
      console.log('Feedback processing result:', result);
      
      if (result.success && result.updatedTransaction) {
        updateUIBasedOnTransaction(result.updatedTransaction);
        showToast(`Categoria aggiornata a: ${categoryId}`);
      } else {
        console.error('Feedback processing failed:', result.error || 'Unknown error');
        showToast("Non è stato possibile aggiornare la categoria", "destructive");
      }
    } catch (error) {
      console.error('Error processing category feedback:', error);
      showToast("Errore nell'aggiornamento della categoria", "destructive");
    } finally {
      setFeedbackNeeded(false);
      setCurrentTransaction(null);
      setSuggestedCategories([]);
    }
  };

  const handleDismissFeedback = () => {
    if (currentTransaction) {
      updateUIBasedOnTransaction(currentTransaction);
    }
    
    setFeedbackNeeded(false);
    setCurrentTransaction(null);
    setSuggestedCategories([]);
  };

  const handleAnalyze = async (inputText: string): Promise<void> => {
    if (!inputText.trim() || !transactionRouterRef.current) {
      return Promise.reject(new Error("Empty input or router not initialized"));
    }
    
    setProcessing(true);
    
    const lowerText = inputText.toLowerCase();
    
    if (lowerText.includes('dashboard') || lowerText.includes('panoramica') || lowerText.includes('home')) {
      viewSetter('dashboard');
      showToast('Dashboard aperta');
      setProcessing(false);
      return Promise.resolve();
    } else if (lowerText.includes('investiment') || lowerText.includes('deposit') || 
               lowerText.includes('spes') || lowerText.includes('budget') || 
               lowerText.includes('cost') || lowerText.includes('finanz') || 
               lowerText.includes('gestione')) {
      viewSetter('finances');
      showToast('Gestione Finanziaria aperta');
      setProcessing(false);
      return Promise.resolve();
    } else if (lowerText.includes('proiezion') || lowerText.includes('previs') || lowerText.includes('futur')) {
      viewSetter('projections');
      showToast('Sezione proiezioni aperta');
      setProcessing(false);
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const analysisResult = enhancedNlpProcessor.analyzeText(inputText);
          console.log('NLP Analysis result:', analysisResult);
          
          const transaction = convertAnalysisToTransaction(analysisResult);
          console.log('Converted transaction:', transaction);
          
          if (transactionRouterRef.current) {
            const routedTransaction = transactionRouterRef.current.route(transaction);
            console.log('Routed transaction:', routedTransaction);
            
            showTransactionToast(routedTransaction);
          }
          
          setProcessing(false);
          resolve();
        } catch (error) {
          console.error('Error analyzing text:', error);
          setProcessing(false);
          showToast("Non riuscito a interpretare il testo", "destructive");
          reject(error);
        }
      }, 300);
    });
  };

  const handleFormSubmit = async (formData: any): Promise<void> => {
    console.log('Form data received:', formData);
    
    if (!user?.id || !formData.amount || !formData.category) {
      return Promise.reject(new Error("Missing required fields or user not authenticated"));
    }
    
    const transaction: Transaction = {
      type: formData.type === 'expense' ? 'USCITA' : 
            formData.type === 'investment' ? 'INVESTIMENTO' : 'ENTRATA' as TransactionType,
      amount: parseFloat(formData.amount),
      description: formData.description || formData.category,
      category: formData.category,
      date: formData.date || new Date().toISOString().split('T')[0],
      metadata: {
        baselineAmount: parseFloat(formData.amount),
        rawInput: `${formData.amount} ${formData.description} (${formData.category})`,
        processingTime: new Date()
      }
    };
    
    console.log('Constructed transaction from form:', transaction);
    
    return new Promise((resolve, reject) => {
      try {
        if (transactionRouterRef.current) {
          const routedTransaction = transactionRouterRef.current.route(transaction);
          console.log('Routed transaction from form:', routedTransaction);
          
          showTransactionToast(routedTransaction);
          resolve();
        } else {
          reject(new Error("Transaction router not initialized"));
        }
      } catch (error) {
        console.error('Error processing form submission:', error);
        reject(error);
      }
    });
  };

  const handleClose = () => {
    // Close the cash talk interface
    setFeedbackNeeded(false);
    setCurrentTransaction(null);
    setSuggestedCategories([]);
  };

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? "Errore" : "Cash Talk",
      description: message,
      variant: variant,
      duration: 3000,
    });
  };

  const showTransactionToast = (transaction: any) => {
    const { type, amount, category } = transaction;
    
    switch(type) {
      case 'USCITA':
        showToast(`Spesa: ${amount}€ (${category || 'Altro'})`);
        break;
      case 'INVESTIMENTO':
        showToast(`Investimento: ${amount}€ (${category || 'Generico'})`);
        break;
      case 'AUMENTO_REDDITO':
        showToast(`Reddito aggiornato a ${amount}€`);
        break;
      case 'ENTRATA':
        showToast(`Entrata: ${amount}€ (${category || 'Generico'})`);
        break;
      default:
        showToast(`Transazione registrata: ${amount}€`);
    }
  };

  return (
    <>
      <ResponsiveCashTalk 
        onSubmit={handleAnalyze}
        onFormSubmit={handleFormSubmit}
        isProcessing={processing}
        categories={mainCategories}
        lastTransaction={lastTransaction}
        onClose={handleClose}
      />
      
      {feedbackNeeded && currentTransaction && (
        <ElegantFeedbackUI
          transaction={currentTransaction}
          suggestedCategories={suggestedCategories}
          onSelectCategory={handleCategorySelection}
          onDismiss={handleDismissFeedback}
        />
      )}
    </>
  );
}
