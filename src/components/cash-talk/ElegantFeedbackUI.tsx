
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mainCategories } from '@/utils/transactionStore';
import { Transaction } from '@/utils/transactionRouter';

interface ElegantFeedbackUIProps {
  transaction: Transaction;
  suggestedCategories: typeof mainCategories;
  onSelectCategory: (categoryId: string) => void;
  onDismiss: () => void;
}

const ElegantFeedbackUI = ({ transaction, suggestedCategories, onSelectCategory, onDismiss }: ElegantFeedbackUIProps) => {
  // Visibility state
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  // Auto-dismiss timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (visible) {
        handleDismiss();
      }
    }, 15000); // Disappears after 15 seconds if the user doesn't interact
    
    return () => clearTimeout(timer);
  }, [visible]);
  
  // Handle category selection
  const handleSelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    setVisible(false);
  };
  
  // Handle dismissal
  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };
  
  // Don't render if not visible
  if (!visible) return null;
  
  // Categories to display
  const displayCategories = expanded ? 
    suggestedCategories : 
    suggestedCategories.slice(0, 4); // Show only the first 4 if not expanded
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-20 left-0 right-0 mx-auto flex justify-center z-50 px-4"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <p className="m-0 text-sm font-medium text-gray-800">
            Categoria per "{transaction.description}"?
          </p>
          <button 
            className="bg-transparent border-none text-gray-400 text-lg p-1"
            onClick={handleDismiss}
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 p-4">
          {displayCategories.map(category => (
            <button
              key={category.id}
              className="flex items-center gap-1.5 bg-opacity-10 rounded-full px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: `${category.color}20` }}
              onClick={() => handleSelect(category.id)}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
          
          {!expanded && suggestedCategories.length > 4 && (
            <button 
              className="text-emerald-500 bg-transparent border-none text-xs px-2 py-1.5"
              onClick={() => setExpanded(true)}
            >
              Più opzioni
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ElegantFeedbackUI;
