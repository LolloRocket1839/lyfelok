import React, { useState } from 'react';
import { Book, CreditCard, Receipt, FileText, Check, Edit, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/utils/transactionRouter';
import TransactionInterpretation from './TransactionInterpretation';
import { NlpAnalysisResult } from '@/utils/adaptiveNlpProcessor';

// Define types for confidence and intent that were missing
type ConfidenceLevel = 'high' | 'medium' | 'low';
type IntentType = 'spesa' | 'entrata' | 'investimento';

interface EnhancedCashTalkDialogProps {
  transaction: Transaction | null;
  analysis?: NlpAnalysisResult;
  onConfirm?: () => void;
  onEdit?: () => void;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const EnhancedCashTalkDialog: React.FC<EnhancedCashTalkDialogProps> = ({ 
  transaction, 
  analysis, 
  onConfirm, 
  onEdit, 
  isOpen, 
  setIsOpen 
}) => {
  // Don't render if there's no transaction
  if (!transaction) return null;
  
  // Convert NlpAnalysisResult to Transaction if needed
  const displayTransaction = transaction;
  
  // Handle confirmation
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };
  
  // Handle edit request
  const handleEdit = () => {
    if (onEdit) onEdit();
  };
  
  const isReceiptTransaction = transaction.metadata?.source === 'receipt_image';
  const confidenceLevel: ConfidenceLevel = (transaction.metadata?.confidence as ConfidenceLevel) || 'medium';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      {transaction && <TransactionInterpretation transaction={transaction} />}
      
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
        >
          <Check size={16} />
          <span>Conferma</span>
        </button>
        
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1"
        >
          <Edit size={16} />
          <span>Modifica</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedCashTalkDialog;
