
import { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Coffee, 
  Car, 
  Smartphone 
} from 'lucide-react';

export type ExpenseItem = {
  id: number;
  category: string;
  spent: number;
  baseline: number;
  icon: JSX.Element;
};

export type DepositItem = {
  id: number;
  date: string;
  amount: number;
  account: string;
};

export type IncomeHistoryItem = {
  month: string;
  income: number;
};

export type AppView = 'dashboard' | 'investments' | 'expenses' | 'projections';

export type ModalType = 'income' | 'expense' | 'deposit' | null;

export function useLifestyleLock() {
  // Basic financial states
  const [income, setIncome] = useState(5000);
  const [previousIncome, setPreviousIncome] = useState(4000);
  const [baselineLifestyle, setBaselineLifestyle] = useState(3000);
  const [currentMonth, setCurrentMonth] = useState('January');
  const [restraintScore, setRestraintScore] = useState(85);
  const [investments, setInvestments] = useState(10000);
  const [savings, setSavings] = useState(5000);
  const [view, setView] = useState<AppView>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Tracking states
  const [incomeHistory] = useState<IncomeHistoryItem[]>([
    { month: 'Jan', income: 4000 },
    { month: 'Feb', income: 4000 },
    { month: 'Mar', income: 4000 },
    { month: 'Apr', income: 4500 },
    { month: 'May', income: 4500 },
    { month: 'Jun', income: 4500 },
    { month: 'Jul', income: 5000 },
    { month: 'Aug', income: 5000 },
    { month: 'Sep', income: 5000 }
  ]);
  
  const [deposits, setDeposits] = useState<DepositItem[]>([
    { id: 1, date: '2025-01-15', amount: 700, account: '401k' },
    { id: 2, date: '2025-02-15', amount: 700, account: '401k' },
    { id: 3, date: '2025-03-15', amount: 500, account: 'Brokerage' }
  ]);

  // Expense tracking
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 1, category: 'Housing', spent: 1200, baseline: 1200, icon: <Home size={18} /> },
    { id: 2, category: 'Food', spent: 600, baseline: 800, icon: <ShoppingBag size={18} /> },
    { id: 3, category: 'Entertainment', spent: 300, baseline: 400, icon: <Coffee size={18} /> },
    { id: 4, category: 'Transport', spent: 400, baseline: 400, icon: <Car size={18} /> },
    { id: 5, category: 'Other', spent: 200, baseline: 200, icon: <Smartphone size={18} /> }
  ]);
  
  // Form states
  const [newIncomeValue, setNewIncomeValue] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseSpent, setExpenseSpent] = useState('');
  const [expenseBaseline, setExpenseBaseline] = useState('');
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [depositDate, setDepositDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccount, setDepositAccount] = useState('401k');

  // Calculate totals
  const totalSpent = expenses.reduce((sum, item) => sum + item.spent, 0);
  const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  // New income allocations
  const newIncome = income - previousIncome;
  const investmentAllocation = Math.round(newIncome * 0.7);
  const savingsAllocation = Math.round(newIncome * 0.2);
  const lifestyleAllocation = Math.round(newIncome * 0.1);

  // Handle income update
  const handleIncomeIncrease = () => {
    if (newIncomeValue && !isNaN(Number(newIncomeValue))) {
      setPreviousIncome(income);
      setIncome(Number(newIncomeValue));
      setNewIncomeValue('');
      setActiveModal(null);
    }
  };

  // Handle deposit add
  const handleAddDeposit = () => {
    if (!depositDate || !depositAmount || !depositAccount) return;
    
    const newDeposit = {
      id: Date.now(),
      date: depositDate,
      amount: Number(depositAmount),
      account: depositAccount
    };
    
    setDeposits([...deposits, newDeposit]);
    setDepositDate('');
    setDepositAmount('');
    setDepositAccount('401k');
    setActiveModal(null);
  };

  // Handle expense add/edit
  const handleExpenseSubmit = () => {
    if (!expenseCategory || isNaN(Number(expenseSpent)) || isNaN(Number(expenseBaseline))) return;
    
    if (editingExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense 
          ? { ...exp, category: expenseCategory, spent: Number(expenseSpent), baseline: Number(expenseBaseline) } 
          : exp
      ));
      setEditingExpense(null);
    } else {
      const newExpense = {
        id: Date.now(),
        category: expenseCategory,
        spent: Number(expenseSpent),
        baseline: Number(expenseBaseline),
        icon: <Coffee size={18} />
      };
      setExpenses([...expenses, newExpense]);
    }
    
    setExpenseCategory('');
    setExpenseSpent('');
    setExpenseBaseline('');
    setActiveModal(null);
  };

  // Data for allocation chart
  const allocationData = [
    { name: 'Investments', value: investmentAllocation, color: '#34D399' },
    { name: 'Savings', value: savingsAllocation, color: '#60A5FA' },
    { name: 'Lifestyle', value: lifestyleAllocation, color: '#FBBF24' }
  ];

  // Data for projection chart
  const projectionData = [
    { name: 'Year 1', withRestraint: investments + savings, withoutRestraint: (investments + savings) * 0.4 },
    { name: 'Year 3', withRestraint: (investments + savings) * 1.8, withoutRestraint: (investments + savings) * 0.8 },
    { name: 'Year 5', withRestraint: (investments + savings) * 3, withoutRestraint: (investments + savings) * 1.2 },
    { name: 'Year 10', withRestraint: (investments + savings) * 6, withoutRestraint: (investments + savings) * 2 }
  ];

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setExpenseCategory('');
    setExpenseSpent('');
    setExpenseBaseline('');
  };

  return {
    // Financial data
    income,
    previousIncome,
    baselineLifestyle,
    currentMonth,
    restraintScore,
    investments,
    savings,
    view,
    setView,
    incomeHistory,
    deposits,
    setDeposits,
    expenses,
    setExpenses,
    totalSpent,
    totalDeposits,
    
    // New income data
    newIncome,
    investmentAllocation,
    savingsAllocation,
    lifestyleAllocation,
    
    // Actions
    handleIncomeIncrease,
    handleAddDeposit,
    handleExpenseSubmit,
    
    // Form data
    newIncomeValue,
    setNewIncomeValue,
    expenseCategory,
    setExpenseCategory,
    expenseSpent, 
    setExpenseSpent,
    expenseBaseline,
    setExpenseBaseline,
    editingExpense,
    setEditingExpense,
    depositDate,
    setDepositDate,
    depositAmount,
    setDepositAmount,
    depositAccount,
    setDepositAccount,
    
    // Modal control
    activeModal,
    setActiveModal,
    resetExpenseForm,
    
    // Chart data
    allocationData,
    projectionData
  };
}
