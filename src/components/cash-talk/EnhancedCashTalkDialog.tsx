
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from '@/hooks/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import TransactionInterpretation from './TransactionInterpretation';
import nlpProcessor, { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';

interface EnhancedCashTalkDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function EnhancedCashTalkDialog({ isOpen, setIsOpen }: EnhancedCashTalkDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<NlpAnalysisResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [pendingFeedbackWords, setPendingFeedbackWords] = useState<any[]>([]);
  
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

  // Inizializza il processore NLP quando l'utente è disponibile
  useEffect(() => {
    if (user?.id) {
      nlpProcessor.setUserId(user.id);
      nlpProcessor.initialize();
    }
  }, [user]);

  // Focus automatico sull'input quando il dialog appare
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
    
    // Carica le parole in attesa di feedback
    if (isOpen) {
      const pendingWords = nlpProcessor.getPendingFeedbackWords();
      setPendingFeedbackWords(pendingWords);
    }
  }, [isOpen]);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    setProcessing(true);
    setAnalysis(null);
    
    // Simula un breve ritardo per dare la sensazione di elaborazione
    setTimeout(() => {
      try {
        // Usa il processore NLP avanzato
        const result = nlpProcessor.analyzeText(inputText);
        setAnalysis(result);
        setProcessing(false);
        
        // Controlla se ci sono parole che necessitano di feedback
        if (result.needsFeedback) {
          const pendingWords = nlpProcessor.getPendingFeedbackWords();
          setPendingFeedbackWords(pendingWords);
        }
      } catch (error) {
        console.error('Errore durante l\'analisi del testo:', error);
        setProcessing(false);
        toast({
          title: "Errore di elaborazione",
          description: "Non è stato possibile analizzare il testo. Riprova con una frase diversa.",
          variant: "destructive",
        });
      }
    }, 800); // Delay leggermente più lungo per simulare l'elaborazione avanzata
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

  // Gestisce feedback positivo per una parola
  const handlePositiveFeedback = (word: string, category: string) => {
    nlpProcessor.processFeedback(word, category, true);
    toast({
      title: "Grazie per il feedback!",
      description: `Hai confermato che "${word}" appartiene alla categoria "${category}".`,
    });
    
    // Aggiorna la lista di parole pending
    const updatedPendingWords = pendingFeedbackWords.filter(item => item.word !== word);
    setPendingFeedbackWords(updatedPendingWords);
  };

  // Gestisce feedback negativo per una parola
  const handleNegativeFeedback = (word: string, suggestedCategory: string, correctCategory: string) => {
    nlpProcessor.processFeedback(word, suggestedCategory, false, correctCategory);
    toast({
      title: "Grazie per il feedback!",
      description: `Hai corretto la categoria per "${word}" da "${suggestedCategory}" a "${correctCategory}".`,
    });
    
    // Aggiorna la lista di parole pending
    const updatedPendingWords = pendingFeedbackWords.filter(item => item.word !== word);
    setPendingFeedbackWords(updatedPendingWords);
  };

  const suggestions = [
    "Ho speso 25€ per una cena",
    "Ricevuto stipendio di 1500€",
    "Investito 500€ in ETF"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  // Cambia tra modalità input e feedback
  const toggleFeedbackMode = () => {
    setFeedbackMode(!feedbackMode);
    // Aggiorna la lista di parole pending quando si entra in modalità feedback
    if (!feedbackMode) {
      const pendingWords = nlpProcessor.getPendingFeedbackWords();
      setPendingFeedbackWords(pendingWords);
    }
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
        className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-auto rounded-t-xl sm:rounded-xl shadow-xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-800">Cash Talk</h2>
            {pendingFeedbackWords.length > 0 && (
              <button
                onClick={toggleFeedbackMode}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  feedbackMode 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {feedbackMode ? 'Torna all\'input' : `Feedback (${pendingFeedbackWords.length})`}
              </button>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenuto */}
        <div className="p-4">
          {!feedbackMode ? (
            // Modalità Input
            <>
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
            </>
          ) : (
            // Modalità Feedback
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                <p className="font-medium">Aiutaci a migliorare Cash Talk</p>
                <p className="mt-1">Il tuo feedback ci aiuterà a capire meglio il linguaggio finanziario.</p>
              </div>
              
              {pendingFeedbackWords.length > 0 ? (
                <div className="space-y-4">
                  {pendingFeedbackWords.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <p className="font-medium text-slate-800 mb-2">
                        La parola <span className="text-emerald-600">"{item.word}"</span> è della categoria <span className="text-blue-600">"{item.guessedCategory}"</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePositiveFeedback(item.word, item.guessedCategory)}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          <ThumbsUp size={16} /> Sì, corretto
                        </button>
                        <select
                          className="flex-1 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleNegativeFeedback(item.word, item.guessedCategory, e.target.value);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>No, è un'altra categoria...</option>
                          <option value="Cibo">Cibo</option>
                          <option value="Alloggio">Alloggio</option>
                          <option value="Trasporto">Trasporto</option>
                          <option value="Salute">Salute</option>
                          <option value="Intrattenimento">Intrattenimento</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Tecnologia">Tecnologia</option>
                          <option value="Fitness">Fitness</option>
                          <option value="Stipendio">Stipendio</option>
                          <option value="Bonus">Bonus</option>
                          <option value="Dividendi">Dividendi</option>
                          <option value="Entrata">Altra entrata</option>
                          <option value="ETF">ETF</option>
                          <option value="Azioni">Azioni</option>
                          <option value="Obbligazioni">Obbligazioni</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Immobiliare">Immobiliare</option>
                          <option value="Fondi">Fondi</option>
                          <option value="Altro">Altro</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <MessageSquare className="mx-auto mb-3 text-slate-400" size={40} />
                  <p>Non ci sono feedback in attesa al momento.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
