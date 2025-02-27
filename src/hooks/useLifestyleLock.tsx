
import { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Coffee, 
  Car, 
  Smartphone 
} from 'lucide-react';
import { autoCategorize, addCustomRule, createMerchantPattern } from '@/utils/autoCategorization';

export type ExpenseItem = {
  id: number;
  category: string;
  spent: number;
  baseline: number;
  icon: JSX.Element;
  date: string; // Added date field
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
  date?: string; // Optional date field
};

export type AppView = 'dashboard' | 'investments' | 'expenses' | 'projections';

export type ModalType = 'income' | 'expense' | 'deposit' | null;

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Helper function to get current month name
const getCurrentMonth = (): string => {
  const today = new Date();
  return today.toLocaleString('default', { month: 'long' });
};

export function useLifestyleLock() {
  // Basic financial states
  const [income, setIncome] = useState(5000);
  const [previousIncome, setPreviousIncome] = useState(4000);
  const [baselineLifestyle, setBaselineLifestyle] = useState(3000);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [restraintScore, setRestraintScore] = useState(85);
  const [investments, setInvestments] = useState(10000);
  const [savings, setSavings] = useState(5000);
  const [view, setView] = useState<AppView>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Tracking states
  const [incomeHistory] = useState<IncomeHistoryItem[]>([
    { month: 'Jan', income: 4000, date: '2025-01-01' },
    { month: 'Feb', income: 4000, date: '2025-02-01' },
    { month: 'Mar', income: 4000, date: '2025-03-01' },
    { month: 'Apr', income: 4500, date: '2025-04-01' },
    { month: 'May', income: 4500, date: '2025-05-01' },
    { month: 'Jun', income: 4500, date: '2025-06-01' },
    { month: 'Jul', income: 5000, date: '2025-07-01' },
    { month: 'Aug', income: 5000, date: '2025-08-01' },
    { month: 'Sep', income: 5000, date: '2025-09-01' }
  ]);
  
  const [deposits, setDeposits] = useState<DepositItem[]>([
    { id: 1, date: '2025-01-15', amount: 700, account: '401k' },
    { id: 2, date: '2025-02-15', amount: 700, account: '401k' },
    { id: 3, date: '2025-03-15', amount: 500, account: 'Brokerage' }
  ]);

  // Expense tracking
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 1, category: 'Housing', spent: 1200, baseline: 1200, icon: <Home size={18} />, date: '2025-09-01' },
    { id: 2, category: 'Food', spent: 600, baseline: 800, icon: <ShoppingBag size={18} />, date: '2025-09-05' },
    { id: 3, category: 'Entertainment', spent: 300, baseline: 400, icon: <Coffee size={18} />, date: '2025-09-10' },
    { id: 4, category: 'Transport', spent: 400, baseline: 400, icon: <Car size={18} />, date: '2025-09-15' },
    { id: 5, category: 'Other', spent: 200, baseline: 200, icon: <Smartphone size={18} />, date: '2025-09-20' }
  ]);
  
  // Form states
  const [newIncomeValue, setNewIncomeValue] = useState('');
  const [incomeDate, setIncomeDate] = useState(getCurrentDate());
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseSpent, setExpenseSpent] = useState('');
  const [expenseBaseline, setExpenseBaseline] = useState('');
  const [expenseDate, setExpenseDate] = useState(getCurrentDate());
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [depositDate, setDepositDate] = useState(getCurrentDate());
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccount, setDepositAccount] = useState('401k');

  // Update current month on component mount and when date changes
  useEffect(() => {
    const updateCurrentMonth = () => {
      setCurrentMonth(getCurrentMonth());
    };
    
    // Set initial month
    updateCurrentMonth();
    
    // Update month every day at midnight
    const timer = setInterval(updateCurrentMonth, 86400000); // 24 hours in milliseconds
    
    return () => clearInterval(timer);
  }, []);

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
      
      // Add to income history with the selected date
      const date = new Date(incomeDate);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Could extend incomeHistory to add new entry
      console.log(`Income updated to ${newIncomeValue} on ${incomeDate} (${month})`);
      
      setNewIncomeValue('');
      setIncomeDate(getCurrentDate());
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
    setDepositDate(getCurrentDate());
    setDepositAmount('');
    setDepositAccount('401k');
    setActiveModal(null);
  };

  // Handle expense add/edit
  const handleExpenseSubmit = () => {
    if (!expenseCategory || isNaN(Number(expenseSpent)) || isNaN(Number(expenseBaseline))) return;
    
    // Get the appropriate icon based on the category
    const result = autoCategorize(expenseCategory);
    
    if (editingExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense 
          ? { 
              ...exp, 
              category: expenseCategory, 
              spent: Number(expenseSpent), 
              baseline: Number(expenseBaseline),
              icon: result.icon,
              date: expenseDate
            } 
          : exp
      ));
      
      // If this is a user correction, add a custom rule for future categorizations
      if (result.category !== expenseCategory) {
        // Determine icon type based on category
        let iconType = "smartphone";
        if (expenseCategory.toLowerCase().includes("transport")) iconType = "car";
        else if (expenseCategory.toLowerCase().includes("food")) iconType = "shopping-bag";
        else if (expenseCategory.toLowerCase().includes("entertainment")) iconType = "coffee";
        else if (expenseCategory.toLowerCase().includes("home") || expenseCategory.toLowerCase().includes("house")) iconType = "home";
        
        // Add a custom rule with the exact category name
        addCustomRule(expenseCategory, iconType, [createMerchantPattern(expenseCategory)]);
      }
      
      setEditingExpense(null);
    } else {
      const newExpense = {
        id: Date.now(),
        category: expenseCategory,
        spent: Number(expenseSpent),
        baseline: Number(expenseBaseline),
        icon: result.icon,
        date: expenseDate
      };
      setExpenses([...expenses, newExpense]);
    }
    
    setExpenseCategory('');
    setExpenseSpent('');
    setExpenseBaseline('');
    setExpenseDate(getCurrentDate());
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
    setExpenseDate(getCurrentDate());
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
    incomeDate,
    setIncomeDate,
    expenseCategory,
    setExpenseCategory,
    expenseSpent, 
    setExpenseSpent,
    expenseBaseline,
    setExpenseBaseline,
    expenseDate,
    setExpenseDate,
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
    projectionData,
    
    // Utility functions
    getCurrentDate
  };
}
