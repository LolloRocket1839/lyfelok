
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowDown, TrendingUp, Calendar, Tag, Receipt, Store, CreditCard, Image } from 'lucide-react';
import { Transaction } from '@/utils/transactionRouter';

interface TransactionInterpretationProps {
  transaction: Transaction;
}

export default function TransactionInterpretation({ transaction }: TransactionInterpretationProps) {
  // Determine transaction type for display - handle all possible transaction types
  let type = 'spesa';
  if (transaction.type === 'ENTRATA') {
    type = 'entrata';
  } else if (transaction.type === 'INVESTIMENTO') {
    type = 'investimento';
  } else if (transaction.type === 'USCITA') {
    type = 'spesa';
  }
  
  // Icons for transaction types
  const getTypeIcon = () => {
    switch(type) {
      case 'spesa':
        return <ShoppingBag className="text-red-500" size={24} />;
      case 'entrata':
        return <ArrowDown className="text-emerald-500" size={24} />;
      case 'investimento':
        return <TrendingUp className="text-blue-500" size={24} />;
      default:
        return <Tag size={24} />;
    }
  };
  
  // Check if transaction came from a receipt
  const isFromReceipt = transaction.metadata?.source === 'receipt_image';
  
  // Get payment method icon if available
  const getPaymentMethodIcon = () => {
    if (transaction.metadata?.paymentMethod) {
      if (transaction.metadata.paymentMethod.toLowerCase().includes('card')) {
        return <CreditCard size={24} />;
      }
    }
    return null;
  };

  // Get receipt quality badge
  const getReceiptQualityBadge = () => {
    if (!isFromReceipt) return null;
    
    const confidence = transaction.metadata?.confidence || '';
    
    if (confidence.toLowerCase().includes('alta')) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <Check size={12} />
          Alta affidabilità
        </span>
      );
    } else if (confidence.toLowerCase().includes('media')) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Image size={12} />
          Media affidabilità
        </span>
      );
    } else {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
          <Receipt size={12} />
          Bassa affidabilità
        </span>
      );
    }
  };

  return (
    <motion.div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-medium text-slate-900">Interpretazione</h3>
        <div className="flex items-center gap-2">
          {isFromReceipt && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
              <Receipt size={12} />
              Scontrino
            </span>
          )}
          {getReceiptQualityBadge()}
        </div>
      </div>
      
      <div className="p-4 grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            {getTypeIcon()}
          </div>
          <div>
            <p className="text-sm text-slate-500">Tipo</p>
            <p className="font-medium text-slate-900 capitalize">{type}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <span className="text-xl font-bold">€</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Importo</p>
            <p className="font-medium text-slate-900">€{Math.abs(transaction.amount).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Categoria</p>
            <p className="font-medium text-slate-900">{transaction.category || 'Non categorizzata'}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Data</p>
            <p className="font-medium text-slate-900">{new Date(transaction.date).toLocaleDateString('it-IT')}</p>
          </div>
        </div>
        
        {isFromReceipt && transaction.metadata?.merchant && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Store size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Esercente</p>
              <p className="font-medium text-slate-900">{transaction.metadata.merchant}</p>
            </div>
          </div>
        )}
        
        {transaction.metadata?.paymentMethod && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Metodo di Pagamento</p>
              <p className="font-medium text-slate-900">{transaction.metadata.paymentMethod}</p>
            </div>
          </div>
        )}
        
        {isFromReceipt && transaction.metadata?.rawText && (
          <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Testo riconosciuto:</p>
            <p className="text-xs font-mono bg-slate-50 p-2 rounded overflow-auto max-h-20">
              {transaction.metadata.rawText}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
