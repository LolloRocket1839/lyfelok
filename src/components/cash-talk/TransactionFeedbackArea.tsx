
import React from 'react';
import { Transaction } from '@/utils/transactionRouter';
import TransactionInterpretation from './TransactionInterpretation';
import ElegantFeedbackUI from './ElegantFeedbackUI';

interface TransactionFeedbackAreaProps {
  transaction: Transaction | null;
  onConfirm: (transaction: Transaction) => void;
  onCancel: () => void;
  onCategoryChange: (newCategory: string) => void;
}

const TransactionFeedbackArea: React.FC<TransactionFeedbackAreaProps> = ({
  transaction,
  onConfirm,
  onCancel,
  onCategoryChange
}) => {
  if (!transaction) return null;

  return (
    <div className="mb-4">
      <TransactionInterpretation transaction={transaction} />
      
      <ElegantFeedbackUI 
        transaction={transaction}
        onConfirm={() => onConfirm(transaction)}
        onCancel={onCancel}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};

export default TransactionFeedbackArea;
