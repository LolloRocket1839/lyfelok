
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowDown, TrendingUp, Calendar, Tag } from 'lucide-react';
import { Transaction } from '@/utils/transactionRouter';

interface TransactionInterpretationProps {
  transaction: Transaction;
}

export default function TransactionInterpretation({ transaction }: TransactionInterpretationProps) {
  // Determine transaction type for display
  const type = transaction.type === 'ENTRATA' ? 'entrata' : 'spesa';
  
  // Icone per i tipi di transazione
  const getTypeIcon = () => {
    switch(type) {
      case 'spesa':
        return <ShoppingBag className="text-red-500" size={24} />;
      case 'entrata':
        return <ArrowDown className="text-emerald-500" size={24} />;
      default:
        return <Tag size={24} />;
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
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
          {transaction.metadata?.confidence || 'Alta affidabilità'}
        </span>
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
            <p className="font-medium text-slate-900">€{transaction.amount.toFixed(2)}</p>
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
      </div>
    </motion.div>
  );
}
