
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import CashTalkDialog from './CashTalkDialog';
import { Transaction } from '@/utils/transactionRouter';

/**
 * A button component that opens a cash talk dialog
 * when clicked. The dialog displays information about
 * a transaction.
 */
const CashTalkButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Sample transaction for demonstration purposes
  const sampleTransaction: Transaction = {
    type: 'USCITA',
    amount: 42.50,
    description: 'Supermercato',
    date: new Date().toISOString(),
    category: 'Alimentari',
    metadata: {
      source: 'receipt_image',
      rawText: 'Supermercato Esselunga\nEuro 42.50\nAlimentari'
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="rounded-full bg-white hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Cash Talk
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-80">
          <CashTalkDialog 
            transaction={sampleTransaction}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
    </div>
  );
};

export default CashTalkButton;
