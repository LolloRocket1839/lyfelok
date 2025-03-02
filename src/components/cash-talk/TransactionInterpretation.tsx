
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface TransactionInterpretationProps {
  analysis: any;
  expanded?: boolean;
}

// Color mapping for different transaction types
const transactionColors = {
  'USCITA': { bg: '#FEE2E2', text: '#EF4444', icon: '💸' },
  'ENTRATA': { bg: '#DCFCE7', text: '#22C55E', icon: '💰' },
  'INVESTIMENTO': { bg: '#E0F2FE', text: '#3B82F6', icon: '📈' },
  'AUMENTO_REDDITO': { bg: '#FEF9C3', text: '#EAB308', icon: '🚀' },
};

// Category icon mapping
const categoryIcons: Record<string, string> = {
  'Cibo': '🍽️',
  'Casa': '🏠',
  'Alloggio': '🏠',
  'Trasporti': '🚗',
  'Trasporto': '🚗',
  'Svago': '🎭',
  'Intrattenimento': '🎭',
  'Salute': '⚕️',
  'Farmacia': '💊',
  'Istruzione': '📚',
  'Educazione': '📚',
  'Bollette': '📝',
  'Utenze': '📝',
  'Shopping': '🛍️',
  'Vestiti': '👕',
  'Elettronica': '📱',
  'Altro': '📦',
  'Stipendio': '💼',
  'Bonus': '🎁',
  'Regali': '🎁',
  'Investimenti': '📊',
  'Azioni': '📈',
  'ETF': '📊',
  'Criptovalute': '₿',
  'Obbligazioni': '📜',
  'Immobili': '🏢'
};

// Fallback icon
const defaultIcon = '📋';

const TransactionInterpretation: React.FC<TransactionInterpretationProps> = ({ analysis, expanded = false }) => {
  // Safety check for null or undefined analysis
  if (!analysis) {
    return null;
  }
  
  const { type, amount, category, description, date, confidence } = analysis;
  
  // Get style based on transaction type or use default
  const style = transactionColors[type] || { bg: '#F3F4F6', text: '#6B7280', icon: '❓' };
  
  // Get category icon or default
  const getIcon = (cat: string) => {
    if (!cat) return defaultIcon;
    
    // Check for exact match
    if (categoryIcons[cat]) return categoryIcons[cat];
    
    // Check for partial match
    const partialMatch = Object.keys(categoryIcons).find(key => 
      cat.toLowerCase().includes(key.toLowerCase())
    );
    
    return partialMatch ? categoryIcons[partialMatch] : defaultIcon;
  };
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr.toString();
    }
  };
  
  // Return different layouts based on expanded state
  return expanded ? (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg mb-4"
      style={{ backgroundColor: style.bg }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg"
            style={{ backgroundColor: 'white', color: style.text }}
          >
            {style.icon}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: style.text }}>
              {type === 'USCITA' ? 'Spesa' : 
               type === 'ENTRATA' ? 'Entrata' : 
               type === 'INVESTIMENTO' ? 'Investimento' : 
               'Transazione'}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(date)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: style.text }}>
            {formatCurrency(Math.abs(amount), 'EUR')}
          </p>
          {confidence && (
            <div className="flex items-center justify-end mt-1">
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${confidence * 100}%`,
                    backgroundColor: confidence > 0.7 ? '#22C55E' : confidence > 0.4 ? '#EAB308' : '#EF4444'
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 ml-1">{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>
      </div>
      
      {(category || description) && (
        <div className="mt-2 border-t border-white/20 pt-2">
          {category && (
            <div className="flex items-center text-sm mb-1">
              <span className="mr-2">{getIcon(category)}</span>
              <span className="font-medium text-gray-700">{category}</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-700">{description}</p>
          )}
        </div>
      )}
    </motion.div>
  ) : (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-3 rounded-lg mb-2"
      style={{ backgroundColor: style.bg }}
    >
      <div className="flex items-center">
        <span className="text-lg mr-2">{style.icon}</span>
        <span className="font-medium" style={{ color: style.text }}>
          {category || (
            type === 'USCITA' ? 'Spesa' : 
            type === 'ENTRATA' ? 'Entrata' : 
            type === 'INVESTIMENTO' ? 'Investimento' : 
            'Transazione'
          )}
        </span>
      </div>
      <span className="font-bold" style={{ color: style.text }}>
        {formatCurrency(Math.abs(amount), 'EUR')}
      </span>
    </motion.div>
  );
};

export default TransactionInterpretation;
