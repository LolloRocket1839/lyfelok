import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, MessageSquare, X, HelpCircle, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { mainCategories } from '@/utils/transactionStore';
import { useToast } from '@/components/ui/use-toast';
import { ExpenseCategories, categoryEmojis } from '@/utils/categorization/types';
import { getEmojiForCategory } from '@/utils/categorization/icons';
interface TransactionFormData {
  type: 'expense' | 'income' | 'investment';
  amount: string;
  category: string;
  description: string;
  date: string;
}
interface ResponsiveCashTalkProps {
  onSubmit: (input: string) => Promise<void>;
  isProcessing?: boolean;
  categories?: Array<{
    id: string;
    label: string;
    icon: string;
    color: string;
  }>;
  lastTransaction?: {
    description: string;
    amount: number;
    date: string;
  } | null;
  onFormSubmit?: (formData: TransactionFormData) => Promise<void>;
  onClose?: () => void;
}
const ResponsiveCashTalk = ({
  onSubmit,
  isProcessing = false,
  categories = mainCategories,
  lastTransaction = null,
  onFormSubmit,
  onClose
}: ResponsiveCashTalkProps) => {
  const {
    toast
  } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [processing, setProcessing] = useState(isProcessing);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showFormMode, setShowFormMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Form state
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Placeholders that rotate
  const placeholders = ["Registra transazione...", "es: 30 pizza 🍕", "es: affitto 800€ 🏠", "es: stipendio 1500€ 💰", "es: investito 200€ in ETF 📈"];

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Listen for window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle text submission
  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || processing) return;
    setProcessing(true);
    onSubmit(inputValue).then(() => {
      setInputValue('');
      setProcessing(false);
    }).catch(err => {
      console.error("Error submitting transaction:", err);
      setProcessing(false);
      toast({
        title: "Errore",
        description: "Non è stato possibile elaborare la tua richiesta",
        variant: "destructive"
      });
    });
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      toast({
        title: "Campi mancanti",
        description: "Per favore compila almeno importo e categoria",
        variant: "destructive"
      });
      return;
    }
    setProcessing(true);
    if (onFormSubmit) {
      onFormSubmit(formData).then(() => {
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowFormMode(false);
        setProcessing(false);
      }).catch(err => {
        console.error("Error submitting form:", err);
        setProcessing(false);
        toast({
          title: "Errore",
          description: "Non è stato possibile salvare la transazione",
          variant: "destructive"
        });
      });
    }
  };

  // Handle category shortcut click
  const handleCategoryShortcut = (category: string, emoji?: string) => {
    if (showFormMode) {
      setFormData(prev => ({
        ...prev,
        category
      }));
    } else {
      setInputValue(prevValue => {
        const baseValue = prevValue.trim();
        return baseValue ? `${baseValue} ${emoji || ''} (${category})` : `${category} ${emoji || ''}`;
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle emoji shortcut click
  const handleEmojiShortcut = (emoji: string, category: string) => {
    if (showFormMode) {
      setFormData(prev => ({
        ...prev,
        category
      }));
    } else {
      setInputValue(prevValue => {
        const baseValue = prevValue.trim();
        return baseValue ? `${baseValue} ${emoji}` : emoji;
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle input keydown (Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  // Toggle between form and text input modes
  const toggleFormMode = () => {
    setShowFormMode(prev => !prev);
    if (!showFormMode && inputValue) {
      const matches = inputValue.match(/(\d+).*?([a-zA-Z]+)/);
      if (matches) {
        setFormData(prev => ({
          ...prev,
          amount: matches[1],
          description: matches[2] || inputValue
        }));
      }
    }
  };

  // Update form field
  const updateFormField = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle close button click
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setExpanded(false);
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Generate emoji category buttons
  const renderEmojiCategories = () => {
    const quickCategories = [{
      emoji: "🍕",
      category: ExpenseCategories.Food
    }, {
      emoji: "🏠",
      category: ExpenseCategories.Housing
    }, {
      emoji: "🚗",
      category: ExpenseCategories.Transport
    }, {
      emoji: "🎬",
      category: ExpenseCategories.Entertainment
    }, {
      emoji: "🛍️",
      category: ExpenseCategories.Shopping
    }, {
      emoji: "💡",
      category: ExpenseCategories.Utilities
    }, {
      emoji: "⚕️",
      category: ExpenseCategories.Health
    }, {
      emoji: "📚",
      category: ExpenseCategories.Education
    }, {
      emoji: "✈️",
      category: ExpenseCategories.Travel
    }, {
      emoji: "📈",
      category: ExpenseCategories.Investment
    }, {
      emoji: "💰",
      category: ExpenseCategories.Income
    }];
    return <div className="flex overflow-x-auto scrollbar-hide gap-2 py-2">
        {quickCategories.map(item => <button key={item.emoji} onClick={() => handleEmojiShortcut(item.emoji, item.category)} className="flex items-center justify-center h-9 w-9 bg-gray-50 hover:bg-gray-100 rounded-full transition-all" title={item.category}>
            <span className="text-lg">{item.emoji}</span>
          </button>)}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center h-9 w-9 bg-gray-50 hover:bg-gray-100 rounded-full transition-all" title="More categories">
          <Plus size={16} className="text-gray-500" />
        </button>
      </div>;
  };

  // Se è chiuso, mostra solo una barra minima (non un'icona)
  if (!expanded) {
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }} className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[980px] z-10">
        <div onClick={toggleExpanded} className="flex items-center justify-between px-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors mx-0 py-[28px]">
          <div className="flex items-center px-2 text-sm text-gray-500">
            <MessageSquare size={16} className="mr-1 text-green-400" />
            <span className="text-xs font-medium">Cash Talk</span>
          </div>
          <div className="text-xs text-gray-400">Clicca per espandere</div>
        </div>
      </motion.div>;
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[980px] z-10">
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <div className="flex items-center px-2 text-sm text-gray-500">
            <MessageSquare size={16} className="mr-1 text-green-400" />
            <span className="text-xs font-medium">Cash Talk</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleExpanded} className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors" aria-label="Minimize">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button onClick={handleClose} className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {showFormMode ? <motion.form initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} onSubmit={handleFormSubmit} className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex bg-emerald-50 text-emerald-600 p-1.5 rounded-full">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-sm font-medium">Modulo Transazione</span>
                </div>
                <button type="button" onClick={toggleFormMode} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex gap-2">
                    {[{
                  value: 'expense',
                  label: 'Spesa'
                }, {
                  value: 'income',
                  label: 'Entrata'
                }, {
                  value: 'investment',
                  label: 'Investimento'
                }].map(type => <button key={type.value} type="button" className={cn("flex-1 py-2 px-3 text-xs rounded-md border transition-colors", formData.type === type.value ? "bg-green-50 text-green-700 border-green-200 font-medium" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")} onClick={() => updateFormField('type', type.value)}>
                        {type.label}
                      </button>)}
                  </div>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Importo</label>
                  <div className="relative">
                    <input type="number" value={formData.amount} onChange={e => updateFormField('amount', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="0.00" />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      €
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                  <input type="text" value={formData.category} onChange={e => updateFormField('category', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="es. Cibo, Casa, Trasporti" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descrizione</label>
                  <input type="text" value={formData.description} onChange={e => updateFormField('description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="es. Pizza, Affitto, Benzina" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                  <input type="date" value={formData.date} onChange={e => updateFormField('date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button type="submit" disabled={processing} className="px-4 py-2 bg-[#06D6A0] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#05c090] transition-colors flex items-center gap-2">
                  {processing ? <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Elaborazione...</span>
                    </> : <>
                      <span>Salva Transazione</span>
                    </>}
                </button>
              </div>
            </motion.form> : <motion.form initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onSubmit={handleTextSubmit} className="flex items-center px-3 py-2">
              <div className="flex items-center px-2 text-sm text-gray-500">
                <MessageSquare size={16} className="mr-1 text-green-400" />
                <span className="text-xs font-medium hidden sm:inline">Cash Talk</span>
              </div>
              
              <div className="flex-1 px-2">
                <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholders[placeholderIndex]} className="w-full px-3 py-2 bg-transparent border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-500" disabled={processing} />
              </div>
              
              <div className="flex items-center gap-2">
                <button type="button" onClick={toggleFormMode} className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors" aria-label="Apri modulo">
                  <HelpCircle size={16} />
                </button>
                
                <button type="submit" disabled={!inputValue.trim() || processing} className="flex items-center justify-center h-8 w-8 bg-[#06D6A0] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#05c090] transition-colors" aria-label="Invia">
                  {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowUp size={16} />}
                </button>
              </div>
            </motion.form>}
        </AnimatePresence>
        
        <div className="px-3 py-2 border-t border-gray-100">
          {renderEmojiCategories()}
        </div>
        
        <div className="flex overflow-x-auto scrollbar-hide gap-2 py-2 px-3 border-t border-gray-100">
          {categories.slice(0, windowWidth < 640 ? 3 : 5).map(category => <button key={category.id} onClick={() => handleCategoryShortcut(category.label, getEmojiForCategory(category.label))} className={cn("flex items-center gap-1 text-xs whitespace-nowrap px-3 py-1.5 rounded-full transition-all", "hover:-translate-y-0.5 hover:shadow-sm")} style={{
          backgroundColor: `${category.color}20`,
          color: category.color
        }}>
              <span>{getEmojiForCategory(category.label)}</span>
              <span>{category.label}</span>
            </button>)}
        </div>
        
        <AnimatePresence>
          {showEmojiPicker && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="border-t border-gray-100 p-3 bg-gray-50">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                {Object.entries(categoryEmojis).map(([category, emoji]) => <button key={category} onClick={() => {
              handleEmojiShortcut(emoji, category);
              setShowEmojiPicker(false);
            }} className="flex flex-col items-center justify-center p-2 hover:bg-white rounded-md transition-colors" title={category}>
                    <span className="text-lg mb-1">{emoji}</span>
                    <span className="text-xs text-gray-600 truncate w-full text-center">{category}</span>
                  </button>)}
              </div>
            </motion.div>}
        </AnimatePresence>
        
        {windowWidth >= 992 && lastTransaction && <div className="hidden lg:flex items-center justify-between py-1.5 px-3 bg-gray-50 text-xs border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Ultima:</span>
              <span className="font-medium truncate max-w-[180px]">{lastTransaction.description}</span>
            </div>
            <span className={cn("font-medium", lastTransaction.amount < 0 ? "text-red-500" : "text-green-500")}>
              {lastTransaction.amount}€
            </span>
          </div>}
      </div>
    </motion.div>;
};
export default ResponsiveCashTalk;