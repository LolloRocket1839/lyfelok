
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LanguageInterpreter, Transaction } from './LanguageInterpreter';
import { SalaryIncreaseNotification } from './SalaryIncreaseNotification';
import { RecentTransactions } from './RecentTransactions';
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface NaturalLanguageInputViewProps {
  initialIncome?: number;
  baselineLifestyle?: number;
  onIncomeUpdate?: (newIncome: number) => void;
}

export const NaturalLanguageInputView: React.FC<NaturalLanguageInputViewProps> = ({ 
  initialIncome = 5000,
  baselineLifestyle = 3000,
  onIncomeUpdate
}) => {
  // State for transactions and current income
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentIncome, setCurrentIncome] = useState(initialIncome);
  const [previousIncome, setPreviousIncome] = useState(initialIncome);
  const [showSalaryIncrease, setShowSalaryIncrease] = useState(false);
  const [salaryIncreaseData, setSalaryIncreaseData] = useState({
    oldSalary: 0,
    newSalary: 0
  });

  // Suggested transactions based on current state
  const suggestedTransactions = [
    "Ho speso 35€ al ristorante ieri sera",
    `Ricevuto stipendio di ${(currentIncome + 200).toFixed(0)}€`,
    "Investito 250€ in ETF MSCI World",
    "Pagato 45€ di benzina"
  ];

  // Handle adding a new transaction
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    
    // If it's a salary transaction, update the current income
    if (transaction.type === 'entrata' && transaction.category === 'Stipendio') {
      setPreviousIncome(currentIncome);
      setCurrentIncome(transaction.amount);
      if (onIncomeUpdate) {
        onIncomeUpdate(transaction.amount);
      }
    }
  };

  // Handle salary increase notification
  const handleSalaryIncrease = (oldSalary: number, newSalary: number) => {
    setSalaryIncreaseData({
      oldSalary,
      newSalary
    });
    setShowSalaryIncrease(true);
  };

  // Handle investing the difference
  const handleInvestDifference = (amount: number) => {
    // Create a new investment transaction
    const investmentTransaction: Transaction = {
      id: Date.now(),
      type: 'investimento',
      amount: amount,
      category: 'ETF',
      date: new Date().toISOString().split('T')[0],
      description: `Investimento automatico della differenza di stipendio (€${amount.toFixed(0)})`
    };
    
    // Add the transaction
    setTransactions(prev => [investmentTransaction, ...prev]);
    
    // Hide the notification
    setShowSalaryIncrease(false);
    
    // Show success toast
    toast({
      title: "Investimento effettuato",
      description: `Hai investito €${amount.toFixed(0)} in ETF. Ottima scelta per il tuo futuro finanziario!`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lifestyle Lock</h2>
          <div className="flex gap-3">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              Reddito: €{currentIncome.toFixed(0)}
            </div>
            <div className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm font-medium">
              Base: €{baselineLifestyle.toFixed(0)}
            </div>
          </div>
        </div>
        
        {/* Natural language input */}
        <LanguageInterpreter 
          onTransactionAdd={handleAddTransaction}
          previousSalary={previousIncome}
          onSalaryIncrease={handleSalaryIncrease}
          suggestedTransactions={suggestedTransactions}
        />
      </Card>
      
      {/* Recent transactions */}
      <Card className="p-4">
        <RecentTransactions transactions={transactions} />
      </Card>
      
      {/* Salary increase notification */}
      <AnimatePresence>
        {showSalaryIncrease && (
          <SalaryIncreaseNotification 
            previousSalary={salaryIncreaseData.oldSalary}
            newSalary={salaryIncreaseData.newSalary}
            onInvest={handleInvestDifference}
            onDismiss={() => setShowSalaryIncrease(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
