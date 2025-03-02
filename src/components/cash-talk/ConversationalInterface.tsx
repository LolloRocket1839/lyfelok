import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CashTalkDialog from './CashTalkDialog';
import { useToast } from '@/components/ui/use-toast';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import { transactionStore } from '@/utils/transactionStore';
import { Transaction } from '@/utils/transactionRouter';
import TransactionInterpretation from './TransactionInterpretation';
import ElegantFeedbackUI from './ElegantFeedbackUI';
import ReceiptImageButton from './ReceiptImageButton';
import receiptProcessor from '@/utils/receiptProcessor';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'finances' | 'projections') => void;
}

const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({ viewSetter }) => {
  // Changed this from false to true to make Cash Talk always open
  const [chatExpanded, setChatExpanded] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [interpretation, setInterpretation] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when chat is expanded
  useEffect(() => {
    if (chatExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatExpanded]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;
    
    setIsProcessing(true);
    
    try {
      // Process the user input with NLP
      const result = enhancedNlpProcessor.processText(userInput);
      
      if (result) {
        console.log('NLP result:', result);
        setInterpretation(result);
      } else {
        // If NLP couldn't interpret the message
        toast({
          title: "Non ho capito",
          description: "Prova a essere più specifico sulla transazione.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'elaborazione del messaggio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Confirm and save the transaction
  const confirmTransaction = (transaction: Transaction) => {
    try {
      // Add the transaction to the store
      const result = transactionStore.addTransaction(transaction);
      
      // Show success message
      toast({
        title: "Transazione salvata",
        description: `${transaction.type === 'ENTRATA' ? 'Entrata' : 'Spesa'} di €${transaction.amount.toFixed(2)} registrata.`,
      });
      
      // Reset the interface
      setInterpretation(null);
      setUserInput('');
      
      // Navigate to finances view if it's a significant transaction
      if (transaction.amount > 100) {
        viewSetter('finances');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvare la transazione.",
        variant: "destructive",
      });
    }
  };

  // Handle receipt image processing
  const handleReceiptProcessed = (receiptText: string) => {
    // Process the receipt text using our receipt processor
    const transaction = receiptProcessor.processReceiptText(receiptText);
    
    if (transaction) {
      // Display the processed transaction
      setInterpretation(transaction);
      setChatExpanded(true);
    } else {
      toast({
        title: "Processing failed",
        description: "Unable to extract transaction data from the receipt. Please try again or enter manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
      <div className={`${chatExpanded ? 'bg-white shadow-lg rounded-t-xl p-4 w-full max-w-3xl mx-auto' : 'bg-transparent'}`}>
        {/* Chat Dialog */}
        {chatExpanded && interpretation && (
          <div className="mb-4">
            <TransactionInterpretation transaction={interpretation} />
            
            {/* Feedback UI */}
            <ElegantFeedbackUI 
              transaction={interpretation}
              onConfirm={() => confirmTransaction(interpretation)}
              onCancel={() => {
                setInterpretation(null);
                setUserInput('');
              }}
              onCategoryChange={(newCategory: string) => {
                if (interpretation) {
                  setInterpretation({
                    ...interpretation,
                    category: newCategory
                  });
                }
              }}
            />
          </div>
        )}
        
        {/* Chat Input Area */}
        <div className={`flex items-center ${chatExpanded ? 'space-x-2' : 'justify-center'}`}>
          {chatExpanded && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setChatExpanded(false)}
              >
                <X size={18} />
              </Button>
              
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Descrivi la tua transazione..."
                  className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
                  onClick={handleSendMessage}
                  disabled={userInput.trim() === ''}
                >
                  <SendHorizontal size={18} />
                </Button>
              </div>
              
              {/* Receipt Image Upload Button */}
              <ReceiptImageButton onProcessComplete={handleReceiptProcessed} />
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  toast({
                    title: "Suggerimenti",
                    description: "Prova a scrivere: 'spesa 45 euro al supermercato', 'stipendio 1500 euro', 'investito 500 euro in ETF'",
                  });
                }}
              >
                <HelpCircle size={18} />
              </Button>
            </>
          )}
          
          {!chatExpanded && (
            <Button
              variant="outline"
              onClick={() => setChatExpanded(true)}
              className="bg-white shadow-md rounded-full px-6 py-2 flex items-center gap-2"
            >
              <span>Cash Talk</span>
              <ChevronUp size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationalInterface;
