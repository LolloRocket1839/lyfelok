
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ShoppingBag, TrendingUp, Wallet, MoreVertical } from 'lucide-react';
import type { Transaction } from './LanguageInterpreter';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: number) => void;
}

export const RecentTransactions = ({
  transactions,
  onDeleteTransaction
}: RecentTransactionsProps) => {
  // Get icon based on transaction type
  const getIcon = (type: string) => {
    switch(type) {
      case 'spesa':
        return <ShoppingBag className="h-5 w-5 text-red-500" />;
      case 'entrata':
        return <Wallet className="h-5 w-5 text-emerald-500" />;
      case 'investimento':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <MoreVertical className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format amount with +/- prefix
  const formatAmount = (type: string, amount: number) => {
    if (type === 'spesa' || type === 'investimento') {
      return `-€${amount.toFixed(2)}`;
    }
    return `+€${amount.toFixed(2)}`;
  };

  // Get class for amount based on type
  const getAmountClass = (type: string) => {
    if (type === 'spesa') return 'text-red-600 font-medium';
    if (type === 'entrata') return 'text-emerald-600 font-medium';
    if (type === 'investimento') return 'text-blue-600 font-medium';
    return 'text-gray-600 font-medium';
  };

  // Format date to human readable
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('it-IT', options);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Transazioni Recenti</h3>
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessuna transazione recente</p>
        ) : (
          transactions.slice(0, 5).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-100 p-2 mr-3">
                    {getIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.description || 'Nessuna descrizione'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  
                  <div className={getAmountClass(transaction.type)}>
                    {formatAmount(transaction.type, transaction.amount)}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
