
import { useState, useRef } from 'react';
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
  useState(() => {
    if (user?.id) {
      nlpProcessor.setUserId(user.id);
      nlpProcessor.initialize();
    }
  });

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
      showToast('Ho aperto la dashboard per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('investiment') || lowerText.includes('deposit')) {
      viewSetter('investments');
      showToast('Ho aperto la sezione investimenti per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('spes') || lowerText.includes('budget') || lowerText.includes('cost')) {
      viewSetter('expenses');
      showToast('Ho aperto la sezione spese per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('proiezion') || lowerText.includes('previs') || lowerText.includes('futur')) {
      viewSetter('projections');
      showToast('Ho aperto la sezione proiezioni per te.');
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
        showToast("Mi dispiace, non sono riuscito a interpretare correttamente il testo.", "destructive");
      }
    }, 300);
  };

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? "Errore" : "Cash Talk",
      description: message,
      variant: variant,
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
        showToast(`Spesa registrata: ${amount}€ per ${category}`);
      } else if (type === 'investimento') {
        setDepositAmount(amount.toString());
        setDepositCategory(category);
        setDepositDescription(inputText);
        handleAddDeposit();
        resetDepositForm();
        showToast(`Investimento registrato: ${amount}€ in ${category}`);
      } else if (type === 'entrata') {
        if (category.toLowerCase() === 'stipendio') {
          setNewIncomeValue(amount.toString());
          handleIncomeIncrease();
          showToast(`Reddito aggiornato a ${amount}€`);
        } else {
          // Per altri tipi di entrate
          showToast(`Entrata registrata: ${amount}€ (${category})`);
        }
      }
    } catch (error) {
      console.error('Errore durante la conferma della transazione:', error);
      showToast("Si è verificato un errore durante la registrazione della transazione.", "destructive");
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-4xl z-10">
      <div className="flex items-center w-full bg-white rounded-lg shadow-sm border border-gray-200 h-[60px]">
        <div className="flex items-center px-4 text-sm text-gray-500">
          <MessageSquare size={16} className="mr-2 text-emerald-500" />
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
          className="flex items-center justify-center h-9 w-9 bg-emerald-500 text-white rounded-full mx-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
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
