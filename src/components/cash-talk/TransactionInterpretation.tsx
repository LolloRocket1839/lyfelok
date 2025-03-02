
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowDown, TrendingUp, Calendar, Tag } from 'lucide-react';

interface TransactionInterpretationProps {
  analysis: {
    type: string;
    amount: number;
    category: string;
    date: string;
    baselineAmount: number;
    confidence: 'high' | 'medium' | 'low';
  };
  onConfirm: () => void;
  onEdit: () => void;
}

export default function TransactionInterpretation({ 
  analysis, 
  onConfirm, 
  onEdit 
}: TransactionInterpretationProps) {
  const { type, amount, category, date, confidence } = analysis;
  
  // Icone per i tipi di transazione
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
  
  // Colore del badge di confidenza
  const getConfidenceColor = () => {
    switch(confidence) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  
  // Testo della confidenza
  const getConfidenceText = () => {
    switch(confidence) {
      case 'high':
        return 'Alta affidabilità';
      case 'medium':
        return 'Media affidabilità';
      case 'low':
        return 'Bassa affidabilità';
      default:
        return 'Affidabilità non determinata';
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
        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor()}`}>
          {getConfidenceText()}
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
            <p className="font-medium text-slate-900">€{amount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Categoria</p>
            <p className="font-medium text-slate-900">{category}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Data</p>
            <p className="font-medium text-slate-900">{new Date(date).toLocaleDateString('it-IT')}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Check size={18} /> Conferma
        </button>
        <button
          onClick={onEdit}
          className="py-2.5 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors"
        >
          Modifica
        </button>
      </div>
    </motion.div>
  );
}
