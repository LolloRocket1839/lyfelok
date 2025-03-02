
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, CreditCard, Wallet, DollarSign, 
  Euro, Building, Coffee, Home, Calendar, ArrowRight 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface TransactionInterpretationProps {
  analysis: any;
  onConfirm?: () => void;
  onEdit?: () => void;
}

// Map for transaction type icons
const typeIconMap = {
  'ENTRATA': <Wallet className="h-5 w-5 text-emerald-500" />,
  'USCITA': <ShoppingCart className="h-5 w-5 text-red-500" />,
  'INVESTIMENTO': <Building className="h-5 w-5 text-blue-500" />,
  'AUMENTO_REDDITO': <CreditCard className="h-5 w-5 text-purple-500" />
};

// Map for transaction type display names (Italian)
const typeDisplayMap = {
  'ENTRATA': 'Entrata',
  'USCITA': 'Spesa',
  'INVESTIMENTO': 'Investimento',
  'AUMENTO_REDDITO': 'Aumento di Reddito'
};

// Map for category icons
const categoryIconMap: Record<string, JSX.Element> = {
  'Cibo': <Coffee className="h-5 w-5" />,
  'Alloggio': <Home className="h-5 w-5" />,
  'Casa': <Home className="h-5 w-5" />,
  'Altro': <ShoppingCart className="h-5 w-5" />
  // Add more categories as needed
};

// Map for transaction type colors
const typeColorMap = {
  'ENTRATA': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'USCITA': 'bg-red-100 text-red-800 border-red-200',
  'INVESTIMENTO': 'bg-blue-100 text-blue-800 border-blue-200',
  'AUMENTO_REDDITO': 'bg-purple-100 text-purple-800 border-purple-200'
};

// Currency icons map
const currencyIconMap = {
  'EUR': <Euro className="h-4 w-4" />,
  'USD': <DollarSign className="h-4 w-4" />,
  'default': <Euro className="h-4 w-4" />
};

const TransactionInterpretation: React.FC<TransactionInterpretationProps> = ({ 
  analysis, 
  onConfirm,
  onEdit 
}) => {
  // Error handling if analysis is null or incomplete
  if (!analysis || typeof analysis !== 'object') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Analisi della transazione non disponibile</p>
      </div>
    );
  }

  // Extract data from analysis with fallbacks for missing data
  const {
    type = 'USCITA',
    amount = 0,
    description = 'Transazione',
    category = 'Altro',
    date = new Date().toISOString().split('T')[0],
    confidence = 0.5,
    currency = 'EUR'
  } = analysis;

  // Get display value for transaction type
  const typeDisplay = typeDisplayMap[type] || 'Transazione';
  
  // Get color class for transaction type
  const colorClass = typeColorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  // Get icon for transaction type
  const typeIcon = typeIconMap[type] || <ShoppingCart className="h-5 w-5 text-gray-500" />;
  
  // Get icon for category
  const categoryIcon = categoryIconMap[category] || categoryIconMap['Altro'];
  
  // Get currency icon
  const currencyIcon = currencyIconMap[currency] || currencyIconMap['default'];

  // Format amount based on transaction type
  let formattedAmount = formatCurrency(Math.abs(amount), currency === 'USD' ? 'en-US' : 'it-IT', currency);
  
  // Format amount with + or - prefix
  const amountPrefix = type === 'ENTRATA' || type === 'AUMENTO_REDDITO' ? '+' : '-';
  
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Confidence indicator class 
  const confidenceClass = confidence > 0.8 
    ? 'bg-green-500' 
    : confidence > 0.5 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden shadow-md border"
    >
      {/* Transaction type header */}
      <div className={`p-3 ${colorClass} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {typeIcon}
          <span className="font-medium">{typeDisplay}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm opacity-80">Confidenza:</span>
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${confidenceClass}`} 
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Transaction details */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-2 gap-3">
          {/* Amount */}
          <div className="col-span-2 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 font-medium text-sm">Importo:</span>
            <div className="flex items-center">
              {currencyIcon}
              <span className={`ml-1 font-bold ${type === 'USCITA' ? 'text-red-600' : 'text-emerald-600'}`}>
                {amountPrefix}{formattedAmount}
              </span>
            </div>
          </div>
          
          {/* Description */}
          <div className="col-span-2">
            <p className="font-medium break-words text-gray-800">{description}</p>
          </div>
          
          {/* Category */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Categoria:</span>
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
              {categoryIcon}
              <span className="text-sm font-medium text-gray-700">{category}</span>
            </div>
          </div>
          
          {/* Date */}
          <div className="flex items-center space-x-2 justify-end">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formattedDate}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        {(onConfirm || onEdit) && (
          <div className="mt-4 flex justify-end space-x-2 border-t pt-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
              >
                Modifica
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 text-sm bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors text-emerald-700 flex items-center"
              >
                Conferma <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionInterpretation;
