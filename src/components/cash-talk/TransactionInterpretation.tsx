
import React from 'react';
import { 
  DollarSign, 
  EuroSign, 
  PlusCircle, 
  MinusCircle,
  Wallet,
  PiggyBank,
  TrendingUp,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Interfaces for component props and transaction data
interface TransactionInterpretationProps {
  analysis: any;
  className?: string;
}

// Map transaction types to icons and colors for better maintainability
const transactionTypeMap = {
  'ENTRATA': { 
    icon: PlusCircle, 
    color: 'text-emerald-600 bg-emerald-50', 
    label: 'Entrata'
  },
  'USCITA': { 
    icon: MinusCircle, 
    color: 'text-rose-600 bg-rose-50', 
    label: 'Spesa'
  },
  'INVESTIMENTO': { 
    icon: PiggyBank, 
    color: 'text-blue-600 bg-blue-50', 
    label: 'Investimento'
  },
  'AUMENTO_REDDITO': { 
    icon: TrendingUp, 
    color: 'text-violet-600 bg-violet-50', 
    label: 'Aumento Reddito'
  }
};

// Default fallback for unknown transaction types
const defaultTypeData = { 
  icon: AlertCircle, 
  color: 'text-gray-600 bg-gray-50', 
  label: 'Transazione'
};

// Currency formatter with multi-currency support
const formatCurrency = (amount: number, currency = 'EUR') => {
  const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'EUR',
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
};

// Check if analysis object has valid data
const hasValidData = (analysis: any): boolean => {
  return analysis && 
         typeof analysis === 'object' && 
         'type' in analysis &&
         'amount' in analysis;
};

const TransactionInterpretation: React.FC<TransactionInterpretationProps> = ({ 
  analysis, 
  className 
}) => {
  // Safely handle null or incomplete data
  if (!hasValidData(analysis)) {
    return (
      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={16} />
          <span>Dati della transazione incompleti</span>
        </div>
      </div>
    );
  }

  // Get transaction type data from map or use default
  const typeData = transactionTypeMap[analysis.type as keyof typeof transactionTypeMap] || defaultTypeData;
  const TypeIcon = typeData.icon;
  
  // Determine the appropriate currency icon based on metadata or default to EUR
  const currency = analysis.currency === 'USD' ? 'USD' : 'EUR';
  const CurrencyIcon = currency === 'USD' ? DollarSign : EuroSign;
  
  // Format amount with correct currency
  const formattedAmount = formatCurrency(analysis.amount, currency);
  
  // Determine if amount is positive or negative for color styling
  const isPositive = analysis.amount >= 0;
  const amountColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-lg border border-gray-200 shadow-sm",
        className
      )}
    >
      {/* Header with transaction type */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium",
          typeData.color
        )}>
          <TypeIcon size={16} aria-hidden="true" />
          <span>{typeData.label}</span>
        </div>
        
        {analysis.confidence && (
          <div className="text-xs text-gray-500">
            Confidenza: {Math.round(analysis.confidence * 100)}%
          </div>
        )}
      </div>
      
      {/* Main transaction details */}
      <div className="space-y-3">
        {/* Amount with currency icon */}
        <div className="flex items-baseline gap-1.5">
          <div className="text-gray-600 flex items-center">
            <CurrencyIcon size={16} className="mr-1" aria-hidden="true" />
            <span className="text-sm">Importo:</span>
          </div>
          <div className={cn("text-lg font-semibold", amountColor)}>
            {formattedAmount}
          </div>
        </div>
        
        {/* Category if available */}
        {analysis.category && (
          <div className="flex items-center gap-1.5">
            <div className="text-gray-600 flex items-center">
              <Tag size={16} className="mr-1" aria-hidden="true" />
              <span className="text-sm">Categoria:</span>
            </div>
            <div className="text-gray-800 font-medium">
              {analysis.category}
            </div>
          </div>
        )}
        
        {/* Description if available */}
        {analysis.description && (
          <div className="flex items-start gap-1.5">
            <div className="text-gray-600 flex items-center mt-0.5">
              <Wallet size={16} className="mr-1" aria-hidden="true" />
              <span className="text-sm">Descrizione:</span>
            </div>
            <div className="text-gray-800">
              {analysis.description}
            </div>
          </div>
        )}
        
        {/* Date if available */}
        {analysis.date && (
          <div className="flex items-center gap-1.5">
            <div className="text-gray-600 flex items-center">
              <Calendar size={16} className="mr-1" aria-hidden="true" />
              <span className="text-sm">Data:</span>
            </div>
            <div className="text-gray-800">
              {typeof analysis.date === 'string' ? analysis.date : new Date(analysis.date).toLocaleDateString('it-IT')}
            </div>
          </div>
        )}
      </div>
      
      {/* Alternative categories if available */}
      {analysis.alternativeCategories && analysis.alternativeCategories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">Categorie alternative:</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.alternativeCategories.slice(0, 3).map((cat: string, idx: number) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionInterpretation;
