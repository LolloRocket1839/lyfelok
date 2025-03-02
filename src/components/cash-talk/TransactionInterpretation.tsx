
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';

export interface TransactionInterpretationProps {
  data: {
    type: string;
    amount: number;
    category: string;
    description?: string;
    date?: string;
    account?: string;
  };
  onConfirm: () => void;
  onEdit: () => void;
}

export const TransactionInterpretation: React.FC<TransactionInterpretationProps> = ({ 
  data, 
  onConfirm,
  onEdit
}) => {
  const { type, amount, category, description, date, account } = data;
  
  const getTypeColor = () => {
    switch (type) {
      case 'expense':
      case 'USCITA':
      case 'SPESA':
        return 'text-red-600';
      case 'investment':
      case 'INVESTIMENTO':
        return 'text-blue-600';
      case 'income':
      case 'ENTRATA':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case 'expense':
      case 'USCITA':
      case 'SPESA':
        return 'Spesa';
      case 'investment':
      case 'INVESTIMENTO':
        return 'Investimento';
      case 'income':
      case 'ENTRATA':
        return 'Entrata';
      case 'AUMENTO_REDDITO':
        return 'Aumento di Reddito';
      default:
        return 'Transazione';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-lg p-4"
    >
      <h3 className="font-medium text-lg mb-3">Conferma la tua transazione</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Tipo:</span>
          <span className={`font-medium ${getTypeColor()}`}>{getTypeLabel()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Importo:</span>
          <span className="font-medium">{formatCurrency(amount)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Categoria:</span>
          <span className="font-medium">{category}</span>
        </div>
        
        {description && (
          <div className="flex justify-between">
            <span className="text-gray-600">Descrizione:</span>
            <span className="font-medium">{description}</span>
          </div>
        )}
        
        {date && (
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">{date}</span>
          </div>
        )}
        
        {account && (
          <div className="flex justify-between">
            <span className="text-gray-600">Conto:</span>
            <span className="font-medium">{account}</span>
          </div>
        )}
      </div>
      
      <div className="mt-5 flex space-x-3">
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onConfirm}
        >
          <Check className="mr-2 h-4 w-4" />
          Conferma
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifica
        </Button>
      </div>
    </motion.div>
  );
};
