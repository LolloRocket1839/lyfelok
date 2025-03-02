import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import { transactionStore } from '@/utils/transactionStore';
import { TransactionRouter, convertAnalysisToTransaction } from '@/utils/transactionRouter';
import ElegantFeedbackUI from './ElegantFeedbackUI';
import { mainCategories } from '@/utils/transactionStore';
import ResponsiveCashTalk from './ResponsiveCashTalk';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

export default function ConversationalInterface({ viewSetter }: ConversationalInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const transactionRouterRef = useRef<TransactionRouter | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  
  // New states for feedback UI
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

  // Initialize the NLP processor and transaction router when the user is available
  useEffect(() => {
    if (user?.id) {
      enhancedNlpProcessor.setUserId(user.id);
      enhancedNlpProcessor.initialize();
      
      // Initialize transaction router if not already done
      if (!transactionRouterRef.current) {
        transactionRouterRef.current = new TransactionRouter(transactionStore);
      }
    }
  }, [user]);

  // Subscribe to transaction notifications
  useEffect(() => {
    // Function to handle transactions based on type
    const handleTransaction = async (transaction: any) => {
      console.log('Transaction notification received:', transaction);
      
      // Add the transaction to history and update last transaction
      setTransactionHistory(prev => [transaction, ...prev].slice(0, 10));
      setLastTransaction(transaction);
      
      // Store the transaction ID for potential feedback
      setLastTransactionId(transactionHistory.length);
      
      // Process with smart categorization
      if (user?.id && transaction.type === 'USCITA') {
        const result = await transactionStore.processTransactionWithSmartCategories(
          transaction,
          user.id
        );
        
        // If feedback is needed, show the feedback UI
        if (result.requireFeedback) {
          setCurrentTransaction(result.transaction);
          setSuggestedCategories(result.suggestedCategories.length > 0 
            ? result.suggestedCategories 
            : mainCategories);
          setFeedbackNeeded(true);
          return; // Wait for user feedback before updating UI
        }
      }
      
      // Update UI based on transaction type
      updateUIBasedOnTransaction(transaction);
    };
    
    // Subscribe to ALL transaction types
    const unsubscribe = transactionStore.subscribe('ALL', handleTransaction);
    
    // Cleanup subscription on unmount
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

  // Update UI based on transaction type
  const updateUIBasedOnTransaction = (transaction: any) => {
    switch(transaction.type) {
      case 'USCITA':
        // Set expense data and submit
        setExpenseCategory(transaction.category || 'Altro');
        setExpenseSpent(transaction.amount.toString());
        setExpenseBaseline((transaction.metadata?.baselineAmount || transaction.amount).toString());
        setExpenseDate(transaction.date);
        handleExpenseSubmit();
        resetExpenseForm();
        break;
        
      case 'INVESTIMENTO':
        // Set deposit data and submit
        setDepositAmount(transaction.amount.toString());
        setDepositCategory(transaction.category || '');
        setDepositDescription(transaction.description || '');
        setDepositDate(transaction.date);
        handleAddDeposit();
        resetDepositForm();
        break;
        
      case 'AUMENTO_REDDITO':
        // Set new income data and submit
        setNewIncomeValue(transaction.amount.toString());
        setIncomeDate(transaction.date);
        handleIncomeIncrease();
        break;
        
      case 'ENTRATA':
        // For now, we'll treat regular income similar to an income increase
        setNewIncomeValue(transaction.amount.toString());
        setIncomeDate(transaction.date);
        handleIncomeIncrease();
        break;
        
      default:
        console.log('Unhandled transaction type:', transaction.type);
    }
  };

  // Handle category selection from feedback UI
  const handleCategorySelection = async (categoryId: string) => {
    if (!currentTransaction || lastTransactionId === null || !user?.id) return;
    
    try {
      // Process the feedback using the transaction store
      const result = await transactionStore.processFeedback(
        lastTransactionId,
        categoryId,
        user.id
      );
      
      if (result.success && result.updatedTransaction) {
        // Update the UI with the new category
        updateUIBasedOnTransaction(result.updatedTransaction);
        
        // Show confirmation toast
        showToast(`Categoria aggiornata a: ${categoryId}`);
      } else {
        showToast("Non è stato possibile aggiornare la categoria", "destructive");
      }
    } catch (error) {
      console.error('Error processing category feedback:', error);
      showToast("Errore nell'aggiornamento della categoria", "destructive");
    } finally {
      // Reset feedback state
      setFeedbackNeeded(false);
      setCurrentTransaction(null);
      setSuggestedCategories([]);
    }
  };

  // Handle dismissal of feedback UI
  const handleDismissFeedback = () => {
    if (currentTransaction) {
      // If dismissed, use the original transaction
      updateUIBasedOnTransaction(currentTransaction);
    }
    
    // Reset feedback state
    setFeedbackNeeded(false);
    setCurrentTransaction(null);
    setSuggestedCategories([]);
  };

  // Analyze input text and process transaction
  const handleAnalyze = async (inputText: string): Promise<void> => {
    if (!inputText.trim() || !transactionRouterRef.current) {
      return Promise.reject(new Error("Empty input or router not initialized"));
    }
    
    setProcessing(true);
    
    // Handle navigational commands first
    const lowerText = inputText.toLowerCase();
    
    if (lowerText.includes('dashboard') || lowerText.includes('panoramica') || lowerText.includes('home')) {
      viewSetter('dashboard');
      showToast('Dashboard aperta');
      setProcessing(false);
      return Promise.resolve();
    } else if (lowerText.includes('investiment') || lowerText.includes('deposit')) {
      viewSetter('investments');
      showToast('Sezione investimenti aperta');
      setProcessing(false);
      return Promise.resolve();
    } else if (lowerText.includes('spes') || lowerText.includes('budget') || lowerText.includes('cost')) {
      viewSetter('expenses');
      showToast('Sezione spese aperta');
      setProcessing(false);
      return Promise.resolve();
    } else if (lowerText.includes('proiezion') || lowerText.includes('previs') || lowerText.includes('futur')) {
      viewSetter('projections');
      showToast('Sezione proiezioni aperta');
      setProcessing(false);
      return Promise.resolve();
    }
    
    // Process the transaction
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Use enhanced NLP processor to analyze text
          const analysisResult = enhancedNlpProcessor.analyzeText(inputText);
          console.log('NLP Analysis result:', analysisResult);
          
          // Convert analysis to transaction
          const transaction = convertAnalysisToTransaction(analysisResult);
          console.log('Converted transaction:', transaction);
          
          // Route transaction to the appropriate handler
          if (transactionRouterRef.current) {
            const routedTransaction = transactionRouterRef.current.route(transaction);
            console.log('Routed transaction:', routedTransaction);
            
            // Show toast notification based on transaction type
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

  // Handle form submission from the unified interface
  const handleFormSubmit = async (formData: any): Promise<void> => {
    console.log('Form data received:', formData);
    
    if (!user?.id || !formData.amount || !formData.category) {
      return Promise.reject(new Error("Missing required fields or user not authenticated"));
    }
    
    // Construct a transaction from form data
    const transaction = {
      type: formData.type === 'expense' ? 'USCITA' : 
            formData.type === 'investment' ? 'INVESTIMENTO' : 'ENTRATA',
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
    
    // Route the transaction using the existing router
    return new Promise((resolve, reject) => {
      try {
        if (transactionRouterRef.current) {
          const routedTransaction = transactionRouterRef.current.route(transaction);
          console.log('Routed transaction from form:', routedTransaction);
          
          // Show toast notification based on transaction type
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

  // Show a toast notification for the transaction
  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? "Errore" : "Cash Talk",
      description: message,
      variant: variant,
      duration: 3000, // 3 seconds
    });
  };

  // Show a toast notification based on transaction type
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
      />
      
      {/* Render Feedback UI when needed */}
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
