
import { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Coffee, 
  Car, 
  Smartphone 
} from 'lucide-react';
import { autoCategorize, addCustomRule, createMerchantPattern } from '@/utils/categorization';
import { categorizeInvestment } from '@/utils/investmentCategorization';
import { transactionStore } from '@/utils/transactionStore';
import { Transaction } from '@/utils/transactionRouter';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';

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
  description?: string;
  category?: string;
};

export type IncomeHistoryItem = {
  month: string;
  income: number;
  date?: string; // Optional date field
};

export type AppView = 'dashboard' | 'finances' | 'projections';

export type ModalType = 'income' | 'expense' | 'deposit' | null;

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Helper function to get current month name
const getCurrentMonth = (): string => {
  const today = new Date();
  return today.toLocaleString('it-IT', { month: 'long' });
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
    { month: 'Gen', income: 4000, date: '2025-01-01' },
    { month: 'Feb', income: 4000, date: '2025-02-01' },
    { month: 'Mar', income: 4000, date: '2025-03-01' },
    { month: 'Apr', income: 4500, date: '2025-04-01' },
    { month: 'Mag', income: 4500, date: '2025-05-01' },
    { month: 'Giu', income: 4500, date: '2025-06-01' },
    { month: 'Lug', income: 5000, date: '2025-07-01' },
    { month: 'Ago', income: 5000, date: '2025-08-01' },
    { month: 'Set', income: 5000, date: '2025-09-01' }
  ]);
  
  const [deposits, setDeposits] = useState<DepositItem[]>([
    { id: 1, date: '2025-01-15', amount: 700, description: 'ETF MSCI World', category: 'ETF' },
    { id: 2, date: '2025-02-15', amount: 700, description: 'Bond Governativo', category: 'Obbligazioni' },
    { id: 3, date: '2025-03-15', amount: 500, description: 'Azioni Enel', category: 'Azioni' }
  ]);

  // Expense tracking with Italian categories
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 1, category: 'Alloggio', spent: 1200, baseline: 1200, icon: <Home size={18} />, date: '2025-09-01' },
    { id: 2, category: 'Cibo', spent: 600, baseline: 800, icon: <ShoppingBag size={18} />, date: '2025-09-05' },
    { id: 3, category: 'Intrattenimento', spent: 300, baseline: 400, icon: <Coffee size={18} />, date: '2025-09-10' },
    { id: 4, category: 'Trasporto', spent: 400, baseline: 400, icon: <Car size={18} />, date: '2025-09-15' },
    { id: 5, category: 'Altro', spent: 200, baseline: 200, icon: <Smartphone size={18} />, date: '2025-09-20' }
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
  const [depositAccount, setDepositAccount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [depositCategory, setDepositCategory] = useState('');
  const [editingDeposit, setEditingDeposit] = useState<number | null>(null);

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

  // Add a transaction store subscriber to keep state in sync
  useEffect(() => {
    // Function to handle different transaction types
    const handleTransaction = (transaction: Transaction) => {
      console.log('useLifestyleLock received transaction:', transaction);
      
      // Processing logic is now handled in ConversationalInterface component
      // This subscription is just for debugging and future extensibility
    };
    
    // Initialize the NLP processor
    try {
      if (typeof enhancedNlpProcessor.initialize === 'function') {
        enhancedNlpProcessor.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize NLP processor:', error);
    }
    
    // Subscribe to ALL transaction types
    const unsubscribe = transactionStore.subscribe('ALL', handleTransaction);
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
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
      const month = date.toLocaleString('it-IT', { month: 'short' });
      
      // Could extend incomeHistory to add new entry
      console.log(`Reddito aggiornato a ${newIncomeValue} il ${incomeDate} (${month})`);
      
      setNewIncomeValue('');
      setIncomeDate(getCurrentDate());
      setActiveModal(null);
    }
  };

  // Handle deposit add/edit
  const handleAddDeposit = () => {
    console.log("handleAddDeposit called with:", {
      depositDate,
      depositAmount,
      depositDescription,
      depositCategory,
      editingDeposit
    });

    if (!depositDate || !depositAmount || !depositCategory) {
      console.error("Missing required deposit fields", {
        date: depositDate,
        amount: depositAmount,
        category: depositCategory
      });
      return;
    }
    
    if (editingDeposit) {
      // Update existing deposit
      setDeposits(prevDeposits => prevDeposits.map(dep => 
        dep.id === editingDeposit 
          ? { 
              ...dep, 
              date: depositDate,
              amount: Number(depositAmount),
              description: depositDescription || undefined,
              category: depositCategory
            } 
          : dep
      ));
      
      setEditingDeposit(null);
    } else {
      // Add new deposit
      const newDeposit = {
        id: Date.now(),
        date: depositDate,
        amount: Number(depositAmount),
        description: depositDescription || undefined,
        category: depositCategory
      };
      
      console.log("Adding new deposit:", newDeposit);
      setDeposits(prevDeposits => [...prevDeposits, newDeposit]);
    }
    
    // Reset form fields
    resetDepositForm();
    setActiveModal(null);
  };

  // Delete deposit
  const handleDeleteDeposit = (id: number) => {
    setDeposits(deposits.filter(dep => dep.id !== id));
  };

  // Start editing a deposit
  const startEditDeposit = (id: number) => {
    const depositToEdit = deposits.find(dep => dep.id === id);
    
    if (depositToEdit) {
      setDepositDate(depositToEdit.date);
      setDepositAmount(depositToEdit.amount.toString());
      setDepositDescription(depositToEdit.description || '');
      setDepositCategory(depositToEdit.category || '');
      setEditingDeposit(id);
      setActiveModal('deposit');
    }
  };

  // Reset deposit form
  const resetDepositForm = () => {
    setEditingDeposit(null);
    setDepositDate(getCurrentDate());
    setDepositAmount('');
    setDepositDescription('');
    setDepositCategory('');
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
        else if (expenseCategory.toLowerCase().includes("food") || expenseCategory.toLowerCase().includes("cibo")) iconType = "shopping-bag";
        else if (expenseCategory.toLowerCase().includes("entertainment") || expenseCategory.toLowerCase().includes("intrattenimento")) iconType = "coffee";
        else if (expenseCategory.toLowerCase().includes("home") || expenseCategory.toLowerCase().includes("house") || expenseCategory.toLowerCase().includes("alloggio")) iconType = "home";
        
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

  // Data for allocation chart (translated to Italian)
  const allocationData = [
    { name: 'Investimenti', value: investmentAllocation, color: '#34D399' },
    { name: 'Risparmi', value: savingsAllocation, color: '#60A5FA' },
    { name: 'Stile di Vita', value: lifestyleAllocation, color: '#FBBF24' }
  ];

  // Data for projection chart (translated to Italian)
  const projectionData = [
    { name: 'Anno 1', withRestraint: investments + savings, withoutRestraint: (investments + savings) * 0.4 },
    { name: 'Anno 3', withRestraint: (investments + savings) * 1.8, withoutRestraint: (investments + savings) * 0.8 },
    { name: 'Anno 5', withRestraint: (investments + savings) * 3, withoutRestraint: (investments + savings) * 1.2 },
    { name: 'Anno 10', withRestraint: (investments + savings) * 6, withoutRestraint: (investments + savings) * 2 }
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
    handleDeleteDeposit,
    startEditDeposit,
    
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
    depositDescription,
    setDepositDescription,
    depositCategory,
    setDepositCategory,
    editingDeposit,
    setEditingDeposit,
    
    // Modal control
    activeModal,
    setActiveModal,
    resetExpenseForm,
    resetDepositForm,
    
    // Chart data
    allocationData,
    projectionData,
    
    // Utility functions
    getCurrentDate
  };
}
