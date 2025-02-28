
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X, MessageSquare, ChevronDown, ChevronUp, HelpCircle, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import TransactionInterpretation from './TransactionInterpretation';
import nlpProcessor, { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

interface ConversationItem {
  type: 'input' | 'response' | 'analysis' | 'suggestion';
  text: string;
  analysis?: NlpAnalysisResult;
  timestamp: Date;
}

export default function ConversationalInterface({ viewSetter }: ConversationalInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([
    {
      type: 'suggestion',
      text: 'Sono il tuo assistente finanziario principale. Chiedimi qualsiasi cosa sulle tue finanze o registra transazioni in linguaggio naturale.',
      timestamp: new Date()
    }
  ]);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  
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
    baselineLifestyle,
    income,
    view,
  } = useLifestyleLock();

  // Inizializza il processore NLP quando l'utente è disponibile
  useEffect(() => {
    if (user?.id) {
      nlpProcessor.setUserId(user.id);
      nlpProcessor.initialize();
    }
  }, [user]);

  // Scorrimento automatico alla fine della conversazione
  useEffect(() => {
    if (conversationContainerRef.current && isExpanded) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversationHistory, isExpanded]);

  const handleInputKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    // Aggiungi input utente alla storia
    setConversationHistory(prev => [
      ...prev, 
      { 
        type: 'input', 
        text: inputText, 
        timestamp: new Date() 
      }
    ]);

    setProcessing(true);
    
    // Salva il testo inserito e poi svuota l'input
    const textToAnalyze = inputText;
    setInputText('');
    
    // Analizza le query informative per cambiare vista
    const lowerText = textToAnalyze.toLowerCase();
    
    // Gestisci le navigazioni conversazionali
    if (lowerText.includes('dashboard') || lowerText.includes('panoramica') || lowerText.includes('home')) {
      viewSetter('dashboard');
      addSystemResponse('Ho aperto la dashboard per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('investiment') || lowerText.includes('deposit')) {
      viewSetter('investments');
      addSystemResponse('Ho aperto la sezione investimenti per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('spes') || lowerText.includes('budget') || lowerText.includes('cost')) {
      viewSetter('expenses');
      addSystemResponse('Ho aperto la sezione spese per te.');
      setProcessing(false);
      return;
    } else if (lowerText.includes('proiezion') || lowerText.includes('previs') || lowerText.includes('futur')) {
      viewSetter('projections');
      addSystemResponse('Ho aperto la sezione proiezioni per te.');
      setProcessing(false);
      return;
    }
    
    // Gestisci le query informative
    if (lowerText.includes('reddito') || lowerText.includes('guadagn')) {
      addSystemResponse(`Il tuo reddito attuale è di €${income} al mese.`);
      setProcessing(false);
      return;
    } else if (lowerText.includes('stile di vita') || lowerText.includes('lifestyle') || lowerText.includes('baseline')) {
      addSystemResponse(`Il tuo stile di vita base è fissato a €${baselineLifestyle} al mese.`);
      setProcessing(false);
      return;
    } else if (lowerText.includes('aiuto') || lowerText.includes('help') || lowerText.includes('come funziona')) {
      addSystemResponse(`Puoi chiedermi informazioni sulle tue finanze o registrare transazioni in linguaggio naturale. Ad esempio:
      - "Ho speso 25€ per una cena"
      - "Ho ricevuto lo stipendio di 3000€"
      - "Ho investito 500€ in ETF"
      - "Quanto è il mio reddito attuale?"
      - "Mostrami le mie spese"
      `);
      setProcessing(false);
      return;
    }
    
    // Simula un breve ritardo per l'analisi
    setTimeout(() => {
      try {
        // Usa il processore NLP per analizzare il testo
        const result = nlpProcessor.analyzeText(textToAnalyze);
        
        // Aggiungi il risultato dell'analisi alla storia della conversazione
        setConversationHistory(prev => [
          ...prev, 
          { 
            type: 'analysis', 
            text: 'Ecco la mia interpretazione:', 
            analysis: result,
            timestamp: new Date() 
          }
        ]);
        
        setProcessing(false);
      } catch (error) {
        console.error('Errore durante l\'analisi del testo:', error);
        setProcessing(false);
        addSystemResponse("Mi dispiace, non sono riuscito a interpretare correttamente il testo. Potresti riprovare con una frase diversa?");
        toast({
          title: "Errore di elaborazione",
          description: "Non è stato possibile analizzare il testo. Riprova con una frase diversa.",
          variant: "destructive",
        });
      }
    }, 800);
  };

  const addSystemResponse = (text: string) => {
    setConversationHistory(prev => [
      ...prev, 
      { 
        type: 'response', 
        text, 
        timestamp: new Date() 
      }
    ]);
  };

  const handleConfirmTransaction = (analysis: NlpAnalysisResult) => {
    try {
      const { type, amount, category, baselineAmount } = analysis;

      // In base al tipo di transazione, utilizziamo le funzioni appropriate
      if (type === 'spesa') {
        setExpenseCategory(category);
        setExpenseSpent(amount.toString());
        setExpenseBaseline(baselineAmount.toString());
        handleExpenseSubmit();
        resetExpenseForm();
        addSystemResponse(`Ho registrato una spesa di €${amount} nella categoria ${category}.`);
      } else if (type === 'investimento') {
        setDepositAmount(amount.toString());
        setDepositCategory(category);
        setDepositDescription(inputText);
        handleAddDeposit();
        resetDepositForm();
        addSystemResponse(`Ho registrato un investimento di €${amount} nella categoria ${category}.`);
      } else if (type === 'entrata') {
        if (category === 'Stipendio') {
          setNewIncomeValue(amount.toString());
          handleIncomeIncrease();
          addSystemResponse(`Ho aggiornato il tuo stipendio a €${amount}.`);
        } else {
          // Per altri tipi di entrate
          addSystemResponse(`Ho registrato un'entrata di €${amount} come ${category}.`);
          toast({
            title: "Entrata registrata",
            description: `${category}: €${amount}`,
          });
        }
      }

    } catch (error) {
      console.error('Errore durante la conferma della transazione:', error);
      addSystemResponse("Mi dispiace, si è verificato un errore durante la registrazione della transazione.");
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione della transazione.",
        variant: "destructive",
      });
    }
  };

  const handleManualEdit = (analysis: NlpAnalysisResult) => {
    const { type, amount, category } = analysis;

    // Apri il modal appropriato in base al tipo di transazione
    if (type === 'spesa') {
      setExpenseCategory(category);
      setExpenseSpent(amount.toString());
      setActiveModal('expense');
      addSystemResponse("Ho aperto il modulo di modifica per la spesa.");
    } else if (type === 'investimento') {
      setDepositAmount(amount.toString());
      setDepositCategory(category);
      setDepositDescription(inputText);
      setActiveModal('deposit');
      addSystemResponse("Ho aperto il modulo di modifica per l'investimento.");
    } else if (type === 'entrata') {
      setNewIncomeValue(amount.toString());
      setActiveModal('income');
      addSystemResponse("Ho aperto il modulo di modifica per l'entrata.");
    }
  };

  const suggestions = [
    "Ho speso 25€ per una cena",
    "Ricevuto stipendio di 1500€",
    "Investito 500€ in ETF",
    "Mostrami le mie spese"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-md transition-all duration-300 ${isExpanded ? 'h-[380px]' : 'h-14'}`}>
      {/* Header */}
      <div 
        className="flex justify-between items-center p-3 border-b cursor-pointer bg-gradient-to-r from-emerald-50 to-blue-50"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2 text-slate-700">
          <MessageSquare size={18} className="text-emerald-500" />
          <h3 className="font-medium">Cash Talk</h3>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">Principale</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
            title="Aiuto"
            onClick={(e) => {
              e.stopPropagation();
              setInputText("Come posso usare cash talk?");
              handleAnalyze();
            }}
          >
            <HelpCircle size={16} />
          </button>
          <button className="text-slate-500 hover:text-slate-700">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>
      
      {/* Conversazione */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col h-[calc(380px-3.5rem)]"
          >
            {/* Contenitore conversazione */}
            <div 
              ref={conversationContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {conversationHistory.map((item, index) => (
                <div key={index} className="mb-3">
                  {item.type === 'input' && (
                    <div className="flex justify-end">
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg max-w-[80%]">
                        {item.text}
                      </div>
                    </div>
                  )}
                  
                  {item.type === 'response' && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg max-w-[80%]">
                        {item.text}
                      </div>
                    </div>
                  )}
                  
                  {item.type === 'suggestion' && (
                    <div className="flex justify-start">
                      <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg max-w-[90%] border border-blue-100">
                        {item.text}
                      </div>
                    </div>
                  )}
                  
                  {item.type === 'analysis' && item.analysis && (
                    <div className="flex justify-start w-full">
                      <div className="w-full max-w-[90%]">
                        <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-t-lg">
                          {item.text}
                        </div>
                        <div className="mt-1">
                          <TransactionInterpretation 
                            analysis={item.analysis} 
                            onConfirm={() => handleConfirmTransaction(item.analysis!)}
                            onEdit={() => handleManualEdit(item.analysis!)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {processing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Area input */}
            <div className="p-3 border-t">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 whitespace-nowrap transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleInputKeydown}
                  placeholder="Registra una spesa, comunica un aumento di reddito o chiedi informazioni..."
                  className="flex-1 px-4 py-2 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-500"
                  disabled={processing}
                  autoFocus
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || processing}
                  className={`p-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors`}
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
