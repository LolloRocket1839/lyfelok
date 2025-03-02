
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { mainCategories } from '@/utils/transactionStore';

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
}

const ResponsiveCashTalk = ({
  onSubmit,
  isProcessing = false,
  categories = mainCategories,
  lastTransaction = null,
}: ResponsiveCashTalkProps) => {
  const [inputValue, setInputValue] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [processing, setProcessing] = useState(isProcessing);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Placeholders that rotate
  const placeholders = [
    "Registra transazione...",
    "es: 30 pizza",
    "es: affitto 800€",
    "es: stipendio 1500€",
    "es: investito 200€ in ETF",
  ];
  
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

  // Handle submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || processing) return;
    
    setProcessing(true);
    
    onSubmit(inputValue)
      .then(() => {
        setInputValue('');
        setProcessing(false);
      })
      .catch(err => {
        console.error("Error submitting transaction:", err);
        setProcessing(false);
      });
  };

  // Handle category shortcut click
  const handleCategoryShortcut = (category: string) => {
    setInputValue(prevValue => {
      const baseValue = prevValue.trim();
      return baseValue ? `${baseValue} (${category})` : `${category}`;
    });
    
    // Focus the input after insertion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input keydown (Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[980px] z-10"
    >
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center px-3 py-2">
          <div className="flex items-center px-2 text-sm text-gray-500">
            <MessageSquare size={16} className="mr-1 text-green-400" />
            <span className="text-xs font-medium hidden sm:inline">Cash Talk</span>
          </div>
          
          <div className="flex-1 px-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIndex]}
              className="w-full px-3 py-2 bg-transparent border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-500"
              disabled={processing}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || processing}
            className="flex items-center justify-center h-8 w-8 bg-[#06D6A0] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#05c090] transition-colors"
            aria-label="Invia"
          >
            {processing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </form>
        
        {/* Category shortcuts */}
        {(windowWidth >= 640 || !inputValue) && (
          <div className="flex overflow-x-auto scrollbar-hide gap-2 py-2 px-3 border-t border-gray-100">
            {categories.slice(0, windowWidth < 640 ? 3 : 5).map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryShortcut(category.label)}
                className={cn(
                  "flex items-center gap-1 text-xs whitespace-nowrap px-3 py-1.5 rounded-full transition-all",
                  "hover:-translate-y-0.5 hover:shadow-sm"
                )}
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color 
                }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Last transaction (desktop only) */}
        {windowWidth >= 992 && lastTransaction && (
          <div className="hidden lg:flex items-center justify-between py-1.5 px-3 bg-gray-50 text-xs border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Ultima:</span>
              <span className="font-medium truncate max-w-[180px]">{lastTransaction.description}</span>
            </div>
            <span className={cn(
              "font-medium",
              lastTransaction.amount < 0 ? "text-red-500" : "text-green-500"
            )}>
              {lastTransaction.amount}€
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResponsiveCashTalk;
