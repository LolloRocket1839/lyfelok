
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import nlpProcessor from '@/utils/adaptiveNlpProcessor';
import { transactionStore } from '@/utils/transactionStore';
import { TransactionRouter, convertAnalysisToTransaction } from '@/utils/transactionRouter';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

export default function ConversationalInterface({ viewSetter }: ConversationalInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [visible, setVisible] = useState(true);
  const transactionRouterRef = useRef<TransactionRouter | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  
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
      nlpProcessor.setUserId(user.id);
      nlpProcessor.initialize();
      
      // Initialize transaction router if not already done
      if (!transactionRouterRef.current) {
        transactionRouterRef.current = new TransactionRouter(transactionStore);
      }
    }
  }, [user]);

  // Subscribe to transaction notifications
  useEffect(() => {
    // Function to handle transactions based on type
    const handleTransaction = (transaction: any) => {
      console.log('Transaction notification received:', transaction);
      
      // Aggiungi la transazione alla cronologia
      setTransactionHistory(prev => [transaction, ...prev].slice(0, 10));
      
      // Update UI based on transaction type
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
    setNewIncomeValue
  ]);

  // Handles the swipe to hide/show the interface
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;
    
    if (isUpSwipe && !visible) {
      setVisible(true);
    } else if (isDownSwipe && visible) {
      setVisible(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleInputKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  // Process feedback from user corrections (new feature)
  const handleFeedback = (originalAnalysis: any, correctedCategory: string) => {
    // Create corrected analysis
    const correctedAnalysis = {
      ...originalAnalysis,
      category: correctedCategory,
      metadata: {
        ...originalAnalysis.metadata,
        corrected: true
      }
    };
    
    // Store feedback for future improvements
    nlpProcessor.storeFeedback(originalAnalysis, correctedAnalysis);
    
    // Show confirmation toast
    showToast(`Categoria corretta salvata: ${correctedCategory}`);
  };

  // Analyze input text and process transaction
  const handleAnalyze = () => {
    if (!inputText.trim() || !transactionRouterRef.current) return;
    
    // Save the text input and clear the field
    const textToAnalyze = inputText;
    setInputText('');
    setProcessing(true);
    
    // Handle navigational commands first
    const lowerText = textToAnalyze.toLowerCase();
    
    if (lowerText.includes('dashboard') || lowerText.includes('panoramica') || lowerText.includes('home')) {
      viewSetter('dashboard');
      showToast('Dashboard aperta');
      setProcessing(false);
      return;
    } else if (lowerText.includes('investiment') || lowerText.includes('deposit')) {
      viewSetter('investments');
      showToast('Sezione investimenti aperta');
      setProcessing(false);
      return;
    } else if (lowerText.includes('spes') || lowerText.includes('budget') || lowerText.includes('cost')) {
      viewSetter('expenses');
      showToast('Sezione spese aperta');
      setProcessing(false);
      return;
    } else if (lowerText.includes('proiezion') || lowerText.includes('previs') || lowerText.includes('futur')) {
      viewSetter('projections');
      showToast('Sezione proiezioni aperta');
      setProcessing(false);
      return;
    }
    
    // Process the transaction
    setTimeout(() => {
      try {
        // Use NLP processor to analyze text
        const analysisResult = nlpProcessor.analyzeText(textToAnalyze);
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
          
          // Se ci sono categorie alternative, mostrale
          if (transaction.alternativeCategories && transaction.alternativeCategories.length > 0) {
            setTimeout(() => {
              showAlternativesToast(transaction);
            }, 2000);
          }
        }
        
        setProcessing(false);
      } catch (error) {
        console.error('Error analyzing text:', error);
        setProcessing(false);
        showToast("Non riuscito a interpretare il testo", "destructive");
      }
    }, 300);
  };

  // Show suggestions for alternative categories
  const showAlternativesToast = (transaction: any) => {
    if (!transaction.alternativeCategories || transaction.alternativeCategories.length === 0) return;
    
    // Prendi solo le prime 2 alternative per non sovraccaricare l'utente
    const alternatives = transaction.alternativeCategories.slice(0, 2);
    
    toast({
      title: "Categorie alternative",
      description: (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-500">
            Forse intendevi una di queste categorie?
          </p>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((category: string) => (
              <button
                key={category}
                onClick={() => handleFeedback(transaction, category)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ),
      duration: 5000,
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

  // Render a small indicator if the interface is hidden
  if (!visible) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 mx-auto flex justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-16 h-1 bg-gray-300 rounded-full mb-2 mt-1" />
      </div>
    );
  }

  // Dynamic placeholder examples based on your specifications
  const placeholders = [
    "Registra transazione...",
    "es: 30 pizza",
    "es: affitto 800€",
    "es: stipendio 1500€",
    "es: investito 200€ in ETF",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <div 
      className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[342px] z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center w-full bg-white rounded-full shadow-sm border border-gray-200 h-[40px]">
        <div className="flex items-center px-3 text-sm text-gray-500">
          <MessageSquare size={14} className="mr-1 text-gray-500" />
          <span className="text-xs font-medium">Cash Talk</span>
        </div>
        
        <div className="flex-1 px-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKeydown}
            placeholder={placeholders[placeholderIndex]}
            className="w-full px-3 py-2 bg-transparent border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-500"
            disabled={processing}
          />
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim() || processing}
          className="flex items-center justify-center h-8 w-8 bg-[#06D6A0] text-white rounded-full mx-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#05c090] transition-colors"
          aria-label="Invia"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ArrowUp size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
