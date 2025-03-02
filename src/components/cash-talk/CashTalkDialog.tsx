
import React from 'react';
import { Book, CreditCard, Receipt, FileText } from 'lucide-react';
import { Transaction } from '@/utils/transactionRouter';

interface CashTalkDialogProps {
  transaction: Transaction | null;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CashTalkDialog: React.FC<CashTalkDialogProps> = ({ transaction, isOpen, setIsOpen }) => {
  if (!transaction) return null;
  
  const isReceiptTransaction = transaction.metadata?.source === 'receipt_image';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-start space-x-3">
        <div className="bg-green-100 p-2 rounded-full">
          {isReceiptTransaction ? (
            <Receipt size={20} className="text-green-600" />
          ) : (
            <CreditCard size={20} className="text-green-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {isReceiptTransaction ? 'Receipt Processed' : 'Transaction Detected'}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1">
            {isReceiptTransaction 
              ? `I've extracted a ${transaction.type === 'ENTRATA' ? 'deposit' : 'payment'} from your receipt.`
              : `I detected a ${transaction.type === 'ENTRATA' ? 'deposit' : 'payment'} in your message.`}
          </p>
          
          <div className="mt-2 flex flex-col space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">€{transaction.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium">{transaction.category || 'Uncategorized'}</span>
            </div>
            
            {transaction.description && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{transaction.description}</span>
              </div>
            )}
            
            {isReceiptTransaction && transaction.metadata?.rawText && (
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText size={12} />
                  <span>Extracted from receipt:</span>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  {transaction.metadata.rawText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashTalkDialog;
