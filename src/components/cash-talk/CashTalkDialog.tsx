
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { analyzeText } from '@/utils/nlpProcessor';
import TransactionInterpretation from './TransactionInterpretation';

interface CashTalkDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CashTalkDialog({ isOpen, setIsOpen }: CashTalkDialogProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
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
    setActiveModal,
    resetExpenseForm,
    resetDepositForm,
  } = useLifestyleLock();

  // Focus automatico sull'input quando il dialog appare
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    setProcessing(true);
    
    // Simula un breve ritardo per dare la sensazione di elaborazione
    setTimeout(() => {
      try {
        const result = analyzeText(inputText);
        setAnalysis(result);
        setProcessing(false);
      } catch (error) {
        console.error('Errore durante l\'analisi del testo:', error);
        setProcessing(false);
        toast({
          title: "Errore di elaborazione",
          description: "Non è stato possibile analizzare il testo. Riprova con una frase diversa.",
          variant: "destructive",
        });
      }
    }, 500);
  };

  const handleConfirmTransaction = () => {
    if (!analysis) return;

    try {
      const { type, amount, category, baselineAmount } = analysis;

      // In base al tipo di transazione, utilizziamo le funzioni appropriate
      if (type === 'spesa') {
        setExpenseCategory(category);
        setExpenseSpent(amount.toString());
        setExpenseBaseline(baselineAmount.toString());
        handleExpenseSubmit();
        resetExpenseForm();
      } else if (type === 'investimento') {
        setDepositAmount(amount.toString());
        setDepositCategory(category);
        setDepositDescription(inputText);
        handleAddDeposit();
        resetDepositForm();
      } else if (type === 'entrata') {
        if (category === 'Stipendio') {
          setNewIncomeValue(amount.toString());
          handleIncomeIncrease();
        } else {
          // Per altri tipi di entrate, potremmo aggiungere una logica specifica in futuro
          toast({
            title: "Entrata registrata",
            description: `${category}: €${amount}`,
          });
        }
      }

      toast({
        title: "Transazione confermata",
        description: "La tua transazione è stata registrata con successo.",
      });

      // Reset dello stato e chiusura del dialog
      setInputText('');
      setAnalysis(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Errore durante la conferma della transazione:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione della transazione.",
        variant: "destructive",
      });
    }
  };

  const handleManualEdit = () => {
    if (!analysis) return;

    const { type, amount, category } = analysis;

    // Apri il modal appropriato in base al tipo di transazione
    if (type === 'spesa') {
      setExpenseCategory(category);
      setExpenseSpent(amount.toString());
      setActiveModal('expense');
    } else if (type === 'investimento') {
      setDepositAmount(amount.toString());
      setDepositCategory(category);
      setDepositDescription(inputText);
      setActiveModal('deposit');
    } else if (type === 'entrata') {
      setNewIncomeValue(amount.toString());
      setActiveModal('income');
    }

    // Chiudi il dialog
    setIsOpen(false);
  };

  const handleInputKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const suggestions = [
    "Ho speso 25€ per una cena",
    "Ricevuto stipendio di 1500€",
    "Investito 500€ in ETF"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Overlay di sfondo */}
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* Finestra di dialogo */}
      <motion.div
        className="relative bg-white w-full max-w-2xl max-h-[70vh] overflow-auto rounded-t-xl sm:rounded-xl shadow-xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-slate-800">Cash Talk</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenuto */}
        <div className="p-4">
          {/* Messaggio di benvenuto */}
          {!analysis && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg text-slate-700 text-sm">
              <p>Scrivi naturalmente cosa hai fatto. Ad esempio:</p>
              <p className="mt-1 font-medium">"Ho speso 25€ per una cena" oppure "Ho ricevuto lo stipendio di 1.500€"</p>
            </div>
          )}
          
          {/* Input e bottone */}
          <div className="flex items-center gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKeydown}
              placeholder="Scrivi una transazione..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 text-slate-900"
              disabled={processing}
            />
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || processing}
              className={`p-3 rounded-lg bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors`}
            >
              <ArrowUp size={20} />
            </button>
          </div>
          
          {/* Suggerimenti */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Interpretazione */}
          {analysis && (
            <TransactionInterpretation 
              analysis={analysis} 
              onConfirm={handleConfirmTransaction}
              onEdit={handleManualEdit}
            />
          )}
          
          {/* Indicatore di elaborazione */}
          {processing && (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
