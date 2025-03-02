
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Check, Edit, AlertCircle } from 'lucide-react';
import { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';

export interface TransactionInterpretationProps {
  analysis: NlpAnalysisResult | any;
  onConfirm?: () => void;
  onEdit?: () => void;
}

const TransactionInterpretation: React.FC<TransactionInterpretationProps> = ({ 
  analysis, 
  onConfirm, 
  onEdit 
}) => {
  // Determine transaction type label
  const getTransactionTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'entrata': return 'Entrata';
      case 'uscita': return 'Spesa';
      case 'investimento': return 'Investimento';
      default: return 'Transazione';
    }
  };

  // Format amount with sign based on transaction type
  const getFormattedAmount = () => {
    const amount = Math.abs(analysis.amount || 0);
    const type = analysis.type?.toLowerCase();
    
    if (type === 'uscita') {
      return `-${formatCurrency(amount)}`;
    } else if (type === 'entrata') {
      return `+${formatCurrency(amount)}`;
    } else {
      return formatCurrency(amount);
    }
  };

  // Get confidence indicator
  const getConfidenceIndicator = () => {
    const confidence = analysis.confidence || 0;
    
    if (confidence > 0.8) {
      return <span className="text-green-500 flex items-center"><Check size={16} className="mr-1" /> Alta affidabilità</span>;
    } else if (confidence > 0.5) {
      return <span className="text-yellow-500 flex items-center"><AlertCircle size={16} className="mr-1" /> Media affidabilità</span>;
    } else {
      return <span className="text-red-500 flex items-center"><AlertCircle size={16} className="mr-1" /> Bassa affidabilità</span>;
    }
  };

  return (
    <Card className="p-4 animate-in fade-in slide-in-from-bottom-5 duration-300 mb-4 bg-white border shadow-md">
      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{getTransactionTypeLabel(analysis.type)}</h3>
            <p className="text-sm text-gray-500">{analysis.description || 'Nessuna descrizione'}</p>
          </div>
          <div className="text-xl font-bold">
            {getFormattedAmount()}
          </div>
        </div>
        
        <div className="flex flex-col space-y-1 mt-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Categoria:</span>
            <span className="font-medium">{analysis.category || 'Non classificata'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data:</span>
            <span>{analysis.date || new Date().toLocaleDateString()}</span>
          </div>
          {analysis.confidence !== undefined && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Affidabilità:</span>
              {getConfidenceIndicator()}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Modifica
            </Button>
          )}
          
          {onConfirm && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onConfirm}
              className="flex items-center"
            >
              <Check size={16} className="mr-1" />
              Conferma
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TransactionInterpretation;
