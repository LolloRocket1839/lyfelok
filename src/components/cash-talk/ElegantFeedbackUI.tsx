import React from 'react';
import { motion } from 'framer-motion';

export interface ElegantFeedbackUIProps {
  transaction: any;
  suggestedCategories: any[];
  onSubmit: (selectedCategory: string) => Promise<void>;
  onCancel: () => Promise<void>;
}

const ElegantFeedbackUI: React.FC<ElegantFeedbackUIProps> = ({
  transaction,
  suggestedCategories,
  onSubmit,
  onCancel
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-16 inset-x-0 mx-auto p-4 bg-white rounded-lg shadow-lg max-w-md z-50 border border-gray-200"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Conferma Categoria</h3>
          <button
            onClick={() => onCancel()}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          {transaction.type === 'USCITA' 
            ? `Hai speso ${Math.abs(transaction.amount)}€` 
            : transaction.type === 'ENTRATA' 
            ? `Hai ricevuto ${Math.abs(transaction.amount)}€`
            : `Hai investito ${Math.abs(transaction.amount)}€`}
          {transaction.description ? ` per ${transaction.description}` : ''}. In quale categoria?
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {suggestedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSubmit(category.label)}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ 
                backgroundColor: `${category.color}10`,
                borderColor: `${category.color}30`
              }}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onCancel()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Non specificare
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ElegantFeedbackUI;
