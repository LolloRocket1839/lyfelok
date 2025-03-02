
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useTransactionPersistence } from '@/hooks/useTransactionPersistence';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import { TransactionInterpretation } from './TransactionInterpretation';
import { useMobile } from '@/hooks/useMobile';

interface EnhancedCashTalkDialogProps {
  onClose: () => void;
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

const EnhancedCashTalkDialog: React.FC<EnhancedCashTalkDialogProps> = ({ onClose, viewSetter }) => {
  const [inputValue, setInputValue] = useState('');
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [interpretationData, setInterpretationData] = useState<any>(null);
  const { toast } = useToast();
  const { saveTransaction } = useTransactionPersistence();
  const isMobile = useMobile();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    try {
      const nlpResult = await enhancedNlpProcessor(inputValue);
      
      if (nlpResult) {
        // Transform the nlpResult into the format expected by TransactionInterpretation
        const interpretationData = {
          type: nlpResult.type, 
          amount: nlpResult.amount,
          category: nlpResult.category || 'Altro',
          description: nlpResult.description,
          date: nlpResult.date
        };
        
        setInterpretationData({...nlpResult, ...interpretationData});
        setShowInterpretation(true);
      } else {
        toast({
          title: "Non ho capito",
          description: "Prova a riformulare la tua richiesta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing NLP:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'elaborazione della richiesta.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmTransaction = async () => {
    if (!interpretationData) return;
    
    try {
      await saveTransaction(interpretationData);
      
      toast({
        title: "Transazione salvata",
        description: "La transazione è stata registrata con successo."
      });
      
      // Reset the input and interpretation
      setInputValue('');
      setShowInterpretation(false);
      setInterpretationData(null);
      
      // Redirect to the appropriate view based on transaction type
      if (interpretationData.type === 'INVESTIMENTO') {
        viewSetter('investments');
      } else if (interpretationData.type === 'USCITA' || interpretationData.type === 'SPESA') {
        viewSetter('expenses');
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvataggio della transazione.",
        variant: "destructive"
      });
    }
  };

  const handleEditTransaction = () => {
    setShowInterpretation(false);
    // Keep the input value for editing
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Cash Talk</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
        {showInterpretation ? (
          <TransactionInterpretation 
            data={interpretationData} 
            onConfirm={handleConfirmTransaction}
            onEdit={handleEditTransaction}
          />
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Descrivi la tua transazione finanziaria in linguaggio naturale. Ad esempio:
            </p>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <ul className="space-y-2">
                <li>• "Ho speso 20€ per la pizza ieri"</li>
                <li>• "Investito 500€ in azioni Apple ieri"</li>
                <li>• "Pagato 60€ di bolletta della luce"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {!showInterpretation && (
        <div className="p-4 border-t">
          <div className="relative">
            <textarea
              className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Descrivi la tua transazione..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 bottom-3 bg-blue-600 text-white rounded-full p-1.5"
              onClick={handleSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCashTalkDialog;
