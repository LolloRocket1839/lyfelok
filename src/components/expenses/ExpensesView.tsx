
import { motion } from 'framer-motion';
import { ArrowUp, ChevronDown } from 'lucide-react';
import { 
  Progress,
} from '@/components/ui/progress';
import { fadeIn, slideUp } from '@/lib/animations';
import { ExpenseItem } from '@/hooks/useLifestyleLock';
import { useState } from 'react';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
  setEditingExpense: (id: number | null) => void;
  setExpenseCategory: (category: string) => void;
  setExpenseSpent: (spent: string) => void;
  setExpenseBaseline: (baseline: string) => void;
}

const ExpensesView = ({ 
  expenses, 
  setExpenses, 
  setActiveModal, 
  setEditingExpense,
  setExpenseCategory,
  setExpenseSpent,
  setExpenseBaseline
}: ExpensesViewProps) => {
  const [periodFilter, setPeriodFilter] = useState('Questo mese');
  const [categoryFilter, setCategoryFilter] = useState('Tutte');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Calculate total budget and spent
  const totalBudget = expenses.reduce((sum, expense) => sum + expense.baseline, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.spent, 0);
  const spentPercentage = (totalSpent / totalBudget) * 100;

  // Get category icon emoji
  const getCategoryEmoji = (category: string) => {
    switch(category.toLowerCase()) {
      case 'alloggio':
        return '🏠';
      case 'cibo':
        return '🍽️';
      case 'intrattenimento':
        return '🎬';
      case 'trasporto':
        return '🚗';
      default:
        return '📱';
    }
  };

  // Get category background color
  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
      case 'alloggio':
        return { bg: '#F5F8FF', text: '#4D69FA' };
      case 'cibo':
        return { bg: '#FFF8F5', text: '#FA6E4D' };
      case 'intrattenimento':
        return { bg: '#F5FFFA', text: '#06D6A0' };
      case 'trasporto':
        return { bg: '#F5F8FF', text: '#4D69FA' };
      default:
        return { bg: '#F9F5FF', text: '#9D4DFA' };
    }
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense.id);
    setExpenseCategory(expense.category);
    setExpenseSpent(expense.spent.toString());
    setExpenseBaseline(expense.baseline.toString());
    setActiveModal('expense');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-[#12162B] h-[160px] flex items-end justify-center pb-8">
        <h1 className="text-white text-[22px] font-medium">Spese</h1>
      </div>

      <div className="px-6 -mt-4">
        {/* Budget Summary Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-white rounded-xl shadow-sm p-4 max-w-[342px] mx-auto h-[90px] mb-5"
        >
          <div className="text-sm text-gray-500 font-medium mb-1">Budget Mensile</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-gray-800">{formatCurrency(totalSpent)}</span>
            <span className="text-base text-gray-500 ml-2">/ {formatCurrency(totalBudget)}</span>
          </div>
          <Progress value={spentPercentage} className="h-[3px] mt-2" />
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeIn}
          className="bg-[#F7F9FC] rounded-full max-w-[342px] mx-auto h-[45px] flex items-center justify-between px-4 mb-5"
        >
          <div className="flex items-center">
            <button className="text-sm font-medium text-gray-700">{periodFilter}</button>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
          </div>
          <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <button className="text-sm font-medium text-gray-700">{categoryFilter}</button>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
          </div>
        </motion.div>
        
        {/* Expenses List */}
        <motion.div 
          variants={fadeIn}
          className="space-y-3 max-w-[342px] mx-auto"
        >
          {expenses.map((expense) => {
            const colors = getCategoryColor(expense.category);
            return (
              <motion.div
                key={expense.id}
                variants={slideUp}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between h-[72px] shadow-sm"
                onClick={() => handleEditExpense(expense)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.category}</p>
                    <p className="text-sm text-gray-400">
                      {expense.date && formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="text-base font-semibold text-gray-800">
                  {formatCurrency(expense.spent)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Cash Talk Input (Fixed at bottom) */}
      <div className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[342px]">
        <div className="flex items-center w-full bg-white rounded-full border border-gray-200 h-[40px] px-4">
          <input
            type="text"
            placeholder="Registra spesa..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-400 h-full"
          />
          <button className="flex items-center justify-center h-8 w-8 bg-[#06D6A0] text-white rounded-full">
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
