
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import { transactionStore } from '@/utils/transactionStore';
import { Transaction } from '@/utils/transactionRouter';
import ChatControls from './ChatControls';
import TransactionFeedbackArea from './TransactionFeedbackArea';
import receiptProcessor from '@/utils/receiptProcessor';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'finances' | 'projections') => void;
}

const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({ viewSetter }) => {
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

  // Confirm and save the transaction
  const confirmTransaction = (transaction: Transaction) => {
    try {
      // Add the transaction to the store
      transactionStore.addTransaction(transaction);
      
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
        {/* Transaction Feedback Area */}
        {chatExpanded && (
          <TransactionFeedbackArea
            transaction={interpretation}
            onConfirm={confirmTransaction}
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
        )}
        
        {/* Chat Controls */}
        <ChatControls
          expanded={chatExpanded}
          onToggleExpanded={() => setChatExpanded(!chatExpanded)}
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          onReceiptProcessed={handleReceiptProcessed}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};

export default ConversationalInterface;
