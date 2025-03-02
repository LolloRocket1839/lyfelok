import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { motion, AnimatePresence } from 'framer-motion';
import { convertAnalysisToTransaction } from '@/utils/transactionRouter';
import { transactionStore } from '@/utils/transactionStore';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import ElegantFeedbackUI from './ElegantFeedbackUI';
import ResponsiveCashTalk from './ResponsiveCashTalk';
import { supabase } from '@/lib/supabase';
import { useTransactionPersistence } from '@/hooks/useTransactionPersistence';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

const ConversationalInterface = ({ viewSetter }: ConversationalInterfaceProps) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [feedbackNeeded, setFeedbackNeeded] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { expenses, setExpenses } = useLifestyleLock();
  
  // Use our new transaction persistence hook
  const { 
    saveTransaction, 
    isLoading, 
    isOnline,
    updateUIBasedOnTransaction
  } = useTransactionPersistence();
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        
        // Initialize NLP processor with user ID
        enhancedNlpProcessor.setUserId(data.user.id);
        enhancedNlpProcessor.initialize();
      }
    };
    
    getUserId();
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'assistant',
          text: 'Ciao! Puoi dirmi le tue spese o entrate, ad esempio: "Ho speso 25€ per la spesa" o "Ho guadagnato 1500€ di stipendio".',
          timestamp: new Date()
        }
      ]);
    }
  }, []);
  
  // Analizza l'input utente utilizzando l'EnhancedNlpProcessor
  const handleAnalyze = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    // Se siamo offline e non è stato autenticato l'utente
    if (!isOnline && !userId) {
      toast({
        title: "Connessione assente",
        description: "Per utilizzare Cash Talk in modalità offline, devi prima effettuare l'accesso.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setIsExpanded(true);
    
    // Aggiungi il messaggio dell'utente
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userInput,
      timestamp: new Date()
    }]);
    
    setInput('');
    
    try {
      // Inizializza il processore NLP se necessario
      if (!userId) {
        // Usa un ID utente temporaneo per dimostrazioni
        enhancedNlpProcessor.setUserId('demo-user');
      }
      
      // Analyze the input
      const analysis = enhancedNlpProcessor.analyzeText(userInput);
      
      // Convert the NLP analysis to a transaction
      const transaction = convertAnalysisToTransaction(analysis);
      
      // Get the process result from the transaction store with smart categorization
      const processResult = await transactionStore.processTransactionWithSmartCategories(
        transaction,
        userId || 'demo-user'
      );
      
      // Set analysis result message
      setMessages(prev => [...prev, {
        sender: 'assistant',
        analysis: transaction,
        timestamp: new Date()
      }]);
      
      // Check if we need to request feedback on the category
      if (processResult.requireFeedback) {
        setFeedbackNeeded(true);
        setCurrentTransaction(processResult.transaction);
        setSuggestedCategories(processResult.suggestedCategories);
      } else {
        // If no feedback needed, save the transaction
        const savedTransaction = await saveTransaction(transaction);
        
        if (savedTransaction) {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: getConfirmationMessage(transaction),
            timestamp: new Date()
          }]);
          
          updateUIBasedOnTransaction(transaction);
          setTransactionCompleted(true);
          
          setTimeout(() => {
            setIsExpanded(false);
          }, 1500);
          
          // Automatic view switching based on transaction type
          if (transaction.type === 'USCITA') {
            viewSetter('expenses');
          } else if (transaction.type === 'INVESTIMENTO') {
            viewSetter('investments');
          } else if (transaction.type === 'ENTRATA' || transaction.type === 'AUMENTO_REDDITO') {
            viewSetter('dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Error processing input:', error);
      
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Mi dispiace, non sono riuscito a elaborare la richiesta. Puoi riprovare?',
        timestamp: new Date()
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Genera un messaggio di conferma in base al tipo di transazione
  const getConfirmationMessage = (transaction: any): string => {
    const amount = Math.abs(transaction.amount);
    const formattedAmount = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    
    switch (transaction.type) {
      case 'ENTRATA':
        return `Ho registrato un'entrata di ${formattedAmount} ${transaction.category ? `per ${transaction.category}` : ''}.`;
      case 'USCITA':
        return `Ho registrato una spesa di ${formattedAmount} ${transaction.category ? `per ${transaction.category}` : ''}.`;
      case 'INVESTIMENTO':
        return `Ho registrato un investimento di ${formattedAmount} ${transaction.category ? `in ${transaction.category}` : ''}.`;
      case 'AUMENTO_REDDITO':
        return `Ho registrato un aumento di reddito di ${formattedAmount}.`;
      default:
        return `Transazione di ${formattedAmount} registrata con successo.`;
    }
  };
  
  // Gestione del feedback sulla categoria
  const handleFeedbackSubmit = async (selectedCategory: string) => {
    if (!currentTransaction) return;
    
    try {
      // Aggiorna la transazione con la categoria corretta
      const updatedTransaction = {
        ...currentTransaction,
        category: selectedCategory,
        confidence: 1.0
      };
      
      // Processo il feedback per migliorare le future classificazioni
      await transactionStore.processFeedback(
        0, // Utilizziamo 0 come ID temporaneo
        selectedCategory,
        userId || 'demo-user'
      );
      
      // Salva la transazione aggiornata
      const savedTransaction = await saveTransaction(updatedTransaction);
      
      if (savedTransaction) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `Ho aggiornato la categoria a "${selectedCategory}" e registrato la transazione.`,
          timestamp: new Date()
        }]);
        
        // Update UI
        updateUIBasedOnTransaction(updatedTransaction);
        
        // Automatic view switching based on transaction type
        if (updatedTransaction.type === 'USCITA') {
          viewSetter('expenses');
        } else if (updatedTransaction.type === 'INVESTIMENTO') {
          viewSetter('investments');
        } else {
          viewSetter('dashboard');
        }
      }
      
      setFeedbackNeeded(false);
      setCurrentTransaction(null);
      setSuggestedCategories([]);
      
      setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Mi dispiace, si è verificato un errore. La transazione è stata comunque registrata con la categoria selezionata.',
        timestamp: new Date()
      }]);
      
      setFeedbackNeeded(false);
    }
  };
  
  // Ignora il feedback e usa la categoria originale
  const handleFeedbackCancel = async () => {
    if (!currentTransaction) return;
    
    try {
      // Salva la transazione con la categoria originale
      const savedTransaction = await saveTransaction(currentTransaction);
      
      if (savedTransaction) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: getConfirmationMessage(currentTransaction),
          timestamp: new Date()
        }]);
        
        // Update UI
        updateUIBasedOnTransaction(currentTransaction);
      }
    } catch (error) {
      console.error('Error saving transaction after canceling feedback:', error);
    }
    
    setFeedbackNeeded(false);
    setCurrentTransaction(null);
    setSuggestedCategories([]);
    
    setTimeout(() => {
      setIsExpanded(false);
    }, 500);
  };
  
  // Toggle expansion state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // UI Component
  return (
    <div className="relative">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="sticky bottom-0 right-0 z-50 w-full md:w-auto md:absolute md:bottom-8 md:right-8"
          >
            <ResponsiveCashTalk 
              onSubmit={handleAnalyze}
              messages={messages}
              inputValue={input}
              setInputValue={setInput}
              isLoading={isAnalyzing || isLoading}
              transactionCompleted={transactionCompleted}
            />
            
            <motion.button
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-20"
              onClick={toggleExpanded}
              aria-label="Minimizza Cash Talk"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="sticky bottom-8 right-8 z-50 md:absolute"
          >
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-2 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
              aria-label="Apri Cash Talk"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="font-medium hidden md:inline">Cash Talk</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Feedback UI */}
      <AnimatePresence>
        {feedbackNeeded && currentTransaction && (
          <ElegantFeedbackUI
            transaction={currentTransaction}
            suggestedCategories={suggestedCategories}
            onSubmit={handleFeedbackSubmit}
            onCancel={handleFeedbackCancel}
          />
        )}
      </AnimatePresence>
      
      {/* Network status indicator */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-center text-sm py-1">
          Modalità offline - Le transazioni verranno sincronizzate quando tornerai online
        </div>
      )}
    </div>
  );
};

export default ConversationalInterface;
