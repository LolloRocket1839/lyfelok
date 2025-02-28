
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animations';
import { 
  Send,
  ShoppingBag, 
  TrendingUp, 
  Wallet,
  Home,
  Car,
  Coffee,
  Briefcase,
  LineChart,
  BarChart,
  Gift,
  Banknote,
  Smartphone 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// Transaction types
export type TransactionType = 'spesa' | 'entrata' | 'investimento';

// Transaction data structure
export type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description?: string;
};

// ML interpretation result
type InterpretationResult = {
  type: TransactionType | null;
  amount: number;
  category: string | null;
  date: string;
  confidence: 'high' | 'medium' | 'low';
  description?: string;
};

// Props for the component
interface LanguageInterpreterProps {
  onTransactionAdd: (transaction: Transaction) => void;
  previousSalary: number;
  onSalaryIncrease?: (oldSalary: number, newSalary: number) => void;
  suggestedTransactions?: string[];
}

export const LanguageInterpreter = ({ 
  onTransactionAdd, 
  previousSalary,
  onSalaryIncrease,
  suggestedTransactions = [
    "Ho speso 35€ al ristorante",
    "Ricevuto stipendio di 5000€",
    "Investito 200€ in ETF"
  ]
}: LanguageInterpreterProps) => {
  // State variables
  const [inputText, setInputText] = useState('');
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [interpretation, setInterpretation] = useState<InterpretationResult>({
    type: null,
    amount: 0,
    category: null,
    date: new Date().toISOString().split('T')[0],
    confidence: 'low'
  });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    type: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Category mappings
  const categories = {
    spesa: ['Cibo', 'Alloggio', 'Trasporto', 'Intrattenimento', 'Altro'],
    entrata: ['Stipendio', 'Bonus', 'Dividendi', 'Altra entrata'],
    investimento: ['ETF', 'Azioni', 'Obbligazioni', 'Crypto', 'Altro']
  };

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    'Cibo': <ShoppingBag size={18} />,
    'Alloggio': <Home size={18} />,
    'Trasporto': <Car size={18} />,
    'Intrattenimento': <Coffee size={18} />,
    'Stipendio': <Briefcase size={18} />,
    'Bonus': <Gift size={18} />,
    'Dividendi': <Banknote size={18} />,
    'ETF': <LineChart size={18} />,
    'Azioni': <BarChart size={18} />,
    'Obbligazioni': <Banknote size={18} />,
    'Crypto': <Wallet size={18} />,
    'Altro': <Smartphone size={18} />,
    'Altra entrata': <Wallet size={18} />
  };

  // Type icons mapping
  const typeIcons: Record<TransactionType, React.ReactNode> = {
    'spesa': <ShoppingBag size={18} />,
    'entrata': <Wallet size={18} />,
    'investimento': <TrendingUp size={18} />
  };

  // Reset interpretation
  const resetInterpretation = () => {
    setShowInterpretation(false);
    setEditMode(false);
    setInputText('');
  };

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputText.trim()) return;

    // Analyze text with ML logic
    const result = analyzeText(inputText);
    setInterpretation(result);
    setEditForm({
      type: result.type || '',
      amount: result.amount,
      category: result.category || '',
      date: result.date
    });
    setShowInterpretation(true);
    
    // Animate the send button
    const sendBtn = document.getElementById('send-button');
    if (sendBtn) {
      sendBtn.classList.add('animate-pulse');
      setTimeout(() => {
        sendBtn.classList.remove('animate-pulse');
      }, 300);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    // Wait a brief moment then submit to create better UX
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  // Confirm interpretation
  const handleConfirm = () => {
    if (!interpretation.type) {
      toast({
        title: "Impossibile processare",
        description: "Tipo di transazione non identificato.",
        variant: "destructive"
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now(),
      type: interpretation.type,
      amount: interpretation.amount,
      category: interpretation.category || 'Altro',
      date: interpretation.date,
      description: inputText
    };

    // Add transaction
    onTransactionAdd(transaction);
    
    // Check for salary increase
    if (transaction.type === 'entrata' && 
        transaction.category === 'Stipendio' && 
        transaction.amount > previousSalary && 
        onSalaryIncrease) {
      onSalaryIncrease(previousSalary, transaction.amount);
    }

    // Reset state
    resetInterpretation();
    
    // Show success toast
    toast({
      title: "Transazione aggiunta",
      description: "La transazione è stata registrata con successo.",
    });
  };

  // Save edited form
  const handleSaveEdit = () => {
    if (!editForm.type || !editForm.category || editForm.amount <= 0) {
      toast({
        title: "Dati incompleti",
        description: "Completa tutti i campi per continuare.",
        variant: "destructive"
      });
      return;
    }

    // Update interpretation with edited values
    setInterpretation({
      type: editForm.type as TransactionType,
      amount: editForm.amount,
      category: editForm.category,
      date: editForm.date,
      confidence: 'high', // User edited, so confidence is high
    });

    setEditMode(false);
  };

  // Analyze text using simulated ML
  const analyzeText = (text: string): InterpretationResult => {
    const lowerText = text.toLowerCase();
    let result: InterpretationResult = {
      type: null,
      amount: 0,
      category: null,
      date: new Date().toISOString().split('T')[0],
      confidence: 'low'
    };
    
    // Determine transaction type
    if (lowerText.includes('spes') || lowerText.includes('pagat') || lowerText.includes('comprat')) {
      result.type = 'spesa';
    } else if (lowerText.includes('investit') || lowerText.includes('comprato azioni') || 
              lowerText.includes('etf') || lowerText.includes('crypto')) {
      result.type = 'investimento';
    } else if (lowerText.includes('ricevut') || lowerText.includes('stipendio') || 
              lowerText.includes('entrat') || lowerText.includes('guadagnat')) {
      result.type = 'entrata';
    }
    
    // Extract amount (look for numbers followed by € or €)
    const amountMatch = lowerText.match(/(\d+[.,]?\d*)[ ]?[€$]/);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1].replace(',', '.'));
    }
    
    // Determine category based on type
    if (result.type === 'spesa') {
      if (lowerText.includes('ristorante') || lowerText.includes('cena') || 
          lowerText.includes('pranzo') || lowerText.includes('caffè') || 
          lowerText.includes('cafe') || lowerText.includes('supermercato') ||
          lowerText.includes('cibo')) {
        result.category = 'Cibo';
      } else if (lowerText.includes('affitto') || lowerText.includes('mutuo') || 
                lowerText.includes('bolletta')) {
        result.category = 'Alloggio';
      } else if (lowerText.includes('benzina') || lowerText.includes('treno') || 
                lowerText.includes('bus') || lowerText.includes('metro') || 
                lowerText.includes('uber') || lowerText.includes('taxi')) {
        result.category = 'Trasporto';
      } else if (lowerText.includes('cinema') || lowerText.includes('concerto') || 
                lowerText.includes('netflix') || lowerText.includes('spotify')) {
        result.category = 'Intrattenimento';
      } else {
        result.category = 'Altro';
      }
    } else if (result.type === 'investimento') {
      if (lowerText.includes('etf') || lowerText.includes('msci')) {
        result.category = 'ETF';
      } else if (lowerText.includes('azioni') || lowerText.includes('azion')) {
        result.category = 'Azioni';
      } else if (lowerText.includes('bond') || lowerText.includes('obbligaz')) {
        result.category = 'Obbligazioni';
      } else if (lowerText.includes('crypto') || lowerText.includes('bitcoin')) {
        result.category = 'Crypto';
      } else {
        result.category = 'Altro';
      }
    } else if (result.type === 'entrata') {
      if (lowerText.includes('stipendio') || lowerText.includes('salario')) {
        result.category = 'Stipendio';
      } else if (lowerText.includes('bonus') || lowerText.includes('premio')) {
        result.category = 'Bonus';
      } else if (lowerText.includes('dividend')) {
        result.category = 'Dividendi';
      } else {
        result.category = 'Altra entrata';
      }
    }
    
    // Evaluate confidence
    let confidenceScore = 0;
    if (result.type) confidenceScore += 1;
    if (result.amount > 0) confidenceScore += 1;
    if (result.category) confidenceScore += 1;
    
    if (confidenceScore >= 3) {
      result.confidence = 'high';
    } else if (confidenceScore >= 2) {
      result.confidence = 'medium';
    } else {
      result.confidence = 'low';
    }
    
    return result;
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta affidabilità';
      case 'medium': return 'Media affidabilità';
      case 'low': return 'Bassa affidabilità';
      default: return 'Affidabilità sconosciuta';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-emerald-50 text-emerald-700';
      case 'medium': return 'bg-amber-50 text-amber-700';
      case 'low': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-4 pr-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
            placeholder="Scrivi qualsiasi transazione... (es. 'Ho speso 25€ per una cena')"
          />
          <Button 
            type="submit"
            id="send-button"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600"
          >
            <Send size={16} className="text-white" />
          </Button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestedTransactions.map((suggestion, index) => (
          <Badge 
            key={index}
            className="cursor-pointer bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>

      {/* Interpretation preview */}
      <AnimatePresence>
        {showInterpretation && !editMode && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideUp}
          >
            <Card className="p-4 mb-4 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Interpretazione automatica</h3>
                <Badge className={getConfidenceColor(interpretation.confidence)}>
                  {getConfidenceLabel(interpretation.confidence)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {interpretation.type ? typeIcons[interpretation.type] : <Smartphone size={18} />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tipo</p>
                    <p className="font-medium">
                      {interpretation.type ? interpretation.type.charAt(0).toUpperCase() + interpretation.type.slice(1) : 'Non identificato'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Importo</p>
                    <p className="font-medium">€{interpretation.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {interpretation.category ? categoryIcons[interpretation.category] : <Smartphone size={18} />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Categoria</p>
                    <p className="font-medium">{interpretation.category || 'Non identificata'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Data</p>
                    <p className="font-medium">{new Date(interpretation.date).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleConfirm}
                >
                  Conferma
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditMode(true)}
                >
                  Modifica
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Edit form */}
        {showInterpretation && editMode && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideUp}
          >
            <Card className="p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Modifica transazione</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(false)}
                >
                  Annulla
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo di transazione</label>
                  <div className="flex gap-4">
                    {['spesa', 'entrata', 'investimento'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transactionType"
                          value={type}
                          checked={editForm.type === type}
                          onChange={() => {
                            setEditForm({
                              ...editForm,
                              type,
                              category: '' // Reset category when type changes
                            });
                          }}
                          className="form-radio"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Importo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      className="w-full p-2 pl-8 border border-gray-200 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded"
                  >
                    <option value="">Seleziona categoria</option>
                    {editForm.type && categories[editForm.type as keyof typeof categories]?.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded"
                  />
                </div>

                <Button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleSaveEdit}
                >
                  Salva
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
