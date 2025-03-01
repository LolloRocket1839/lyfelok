
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import nlpProcessor from '@/utils/adaptiveNlpProcessor';

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
  
  const {
    handleExpenseSubmit,
    handleAddDeposit,
    handleIncomeIncrease,
    setExpenseCategory,
    setExpenseSpent,
    setExpenseBaseline,
    setDepositAmount,
    setDepositCategory,
    setDepositDescription,
    setNewIncomeValue,
    resetExpenseForm,
    resetDepositForm,
  } = useLifestyleLock();

  // Inizializza il processore NLP quando l'utente è disponibile
  useEffect(() => {
    if (user?.id) {
      nlpProcessor.setUserId(user.id);
      nlpProcessor.initialize();
    }
  }, [user]);

  // Gestisce lo swipe per nascondere/mostrare l'interfaccia
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

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    
    // Salva il testo inserito e poi svuota l'input
    const textToAnalyze = inputText;
    setInputText('');
    setProcessing(true);
    
    // Gestisci le navigazioni conversazionali
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
    
    // Simula un breve ritardo per l'analisi
    setTimeout(() => {
      try {
        // Usa il processore NLP per analizzare il testo
        const result = nlpProcessor.analyzeText(textToAnalyze);
        
        // Processa direttamente il risultato
        handleTransaction(result);
        setProcessing(false);
      } catch (error) {
        console.error('Errore durante l\'analisi del testo:', error);
        setProcessing(false);
        showToast("Non riuscito a interpretare il testo", "destructive");
      }
    }, 300);
  };

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? "Errore" : "Cash Talk",
      description: message,
      variant: variant,
      duration: 3000, // 3 secondi
    });
  };

  const handleTransaction = (analysis: any) => {
    try {
      const { type, amount, category, baselineAmount } = analysis;

      // In base al tipo di transazione, utilizziamo le funzioni appropriate
      if (type === 'spesa') {
        setExpenseCategory(category);
        setExpenseSpent(amount.toString());
        setExpenseBaseline(baselineAmount.toString());
        handleExpenseSubmit();
        resetExpenseForm();
        showToast(`Spesa: ${amount}€ (${category})`);
      } else if (type === 'investimento') {
        setDepositAmount(amount.toString());
        setDepositCategory(category);
        setDepositDescription(inputText);
        handleAddDeposit();
        resetDepositForm();
        showToast(`Investimento: ${amount}€ (${category})`);
      } else if (type === 'entrata') {
        if (category.toLowerCase() === 'stipendio') {
          setNewIncomeValue(amount.toString());
          handleIncomeIncrease();
          showToast(`Reddito aggiornato a ${amount}€`);
        } else {
          // Per altri tipi di entrate
          showToast(`Entrata: ${amount}€ (${category})`);
        }
      }
    } catch (error) {
      console.error('Errore durante la conferma della transazione:', error);
      showToast("Errore nella registrazione della transazione", "destructive");
    }
  };

  // Se l'interfaccia è nascosta, mostra solo un piccolo indicatore
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

  return (
    <div 
      className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-4xl z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center w-full bg-white rounded-lg shadow-sm border border-gray-200 h-[60px]">
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
            placeholder="Registra transazione..."
            className="w-full px-3 py-2 bg-gray-50 border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-500"
            disabled={processing}
          />
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim() || processing}
          className="flex items-center justify-center h-9 w-9 bg-[#06D6A0] text-white rounded-full mx-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#05c090] transition-colors"
          aria-label="Invia"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
