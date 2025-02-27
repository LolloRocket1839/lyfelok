import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimation, overlayAnimation } from '@/lib/animations';
import { ModalType } from '@/hooks/useLifestyleLock';
import { useState, useEffect } from 'react';
import { autoCategorize } from '@/utils/autoCategorization';

interface ModalsContainerProps {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  
  // Income modal props
  newIncomeValue: string;
  setNewIncomeValue: (value: string) => void;
  incomeDate: string;
  setIncomeDate: (value: string) => void;
  handleIncomeIncrease: () => void;
  
  // Expense modal props
  expenseCategory: string;
  setExpenseCategory: (value: string) => void;
  expenseSpent: string;
  setExpenseSpent: (value: string) => void;
  expenseBaseline: string;
  setExpenseBaseline: (value: string) => void;
  expenseDate: string;
  setExpenseDate: (value: string) => void;
  handleExpenseSubmit: () => void;
  editingExpense: number | null;
  resetExpenseForm: () => void;
  
  // Deposit modal props
  depositDate: string;
  setDepositDate: (value: string) => void;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  depositAccount: string;
  setDepositAccount: (value: string) => void;
  handleAddDeposit: () => void;
  
  // Utility
  getCurrentDate: () => string;
}

const ModalsContainer = ({
  activeModal,
  setActiveModal,
  newIncomeValue,
  setNewIncomeValue,
  incomeDate,
  setIncomeDate,
  handleIncomeIncrease,
  expenseCategory,
  setExpenseCategory,
  expenseSpent,
  setExpenseSpent,
  expenseBaseline,
  setExpenseBaseline,
  expenseDate,
  setExpenseDate,
  handleExpenseSubmit,
  editingExpense,
  resetExpenseForm,
  depositDate,
  setDepositDate,
  depositAmount,
  setDepositAmount,
  depositAccount,
  setDepositAccount,
  handleAddDeposit,
  getCurrentDate
}: ModalsContainerProps) => {
  const [merchantName, setMerchantName] = useState('');
  const [baselineModified, setBaselineModified] = useState(false);

  const closeActiveModal = () => {
    if (activeModal === 'expense') {
      resetExpenseForm();
      setMerchantName('');
      setBaselineModified(false);
    }
    setActiveModal(null);
  };

  // Find the most recent baseline for a category from existing expenses
  const findCategoryBaseline = (category: string) => {
    // Get all expenses with this category
    const categoryExpenses = window.__lifestyleLock.expenses.filter(
      exp => exp.category.toLowerCase() === category.toLowerCase()
    );

    if (categoryExpenses.length > 0) {
      // Sort by date descending and get the most recent baseline
      const sortedExpenses = categoryExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sortedExpenses[0].baseline;
    }
    return null;
  };

  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setMerchantName(name);
    
    // Only auto-categorize if there's no editing happening and the field has content
    if (!editingExpense && name.trim() !== '') {
      console.log(`Attempting to categorize merchant: ${name}`);
      const result = autoCategorize(name);
      console.log(`Categorization result:`, result);
      
      // Set the category
      setExpenseCategory(result.category);
      
      // Find and set the baseline for this category if it exists
      const existingBaseline = findCategoryBaseline(result.category);
      if (existingBaseline && !baselineModified) {
        setExpenseBaseline(existingBaseline.toString());
      }
    }
  };

  // Handle category change to update baseline
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const category = e.target.value;
    setExpenseCategory(category);
    
    // Only update baseline if it hasn't been manually modified
    if (!baselineModified && !editingExpense) {
      const existingBaseline = findCategoryBaseline(category);
      if (existingBaseline) {
        setExpenseBaseline(existingBaseline.toString());
      }
    }
  };

  // Handle expense amount change - auto-set baseline if not modified and no category baseline exists
  const handleExpenseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setExpenseSpent(amount);
    
    // Only set baseline to match spent if:
    // 1. Baseline hasn't been manually modified
    // 2. We're not editing an existing expense
    // 3. There's no existing baseline for this category
    if (!baselineModified && !editingExpense && !findCategoryBaseline(expenseCategory)) {
      setExpenseBaseline(amount);
    }
  };

  // Mark baseline as modified when user changes it
  const handleBaselineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpenseBaseline(e.target.value);
    setBaselineModified(true);
  };

  // Reset baselineModified flag when editing expense changes
  useEffect(() => {
    setBaselineModified(false);
  }, [editingExpense]);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'income':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Income Increase</h2>
            <p className="mb-4 text-slate-600">Enter your new monthly income:</p>
            <div className="space-y-4">
              <input
                type="number"
                value={newIncomeValue}
                onChange={(e) => setNewIncomeValue(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="New monthly income"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Income Change</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Default is today's date</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeActiveModal} 
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleIncomeIncrease} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Update Income
              </button>
            </div>
          </div>
        );
      
      case 'expense':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <div className="space-y-4">
              {!editingExpense && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Merchant Name</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={handleMerchantChange}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., Uber, Starbucks, Amazon"
                  />
                  {merchantName && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {expenseCategory ? `Auto-categorized as: ${expenseCategory}` : "No category detected"}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={expenseCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Housing, Food, Entertainment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Spent</label>
                <input
                  type="number"
                  value={expenseSpent}
                  onChange={handleExpenseAmountChange}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Baseline Budget
                  {!baselineModified && !editingExpense && (
                    <span className="ml-2 text-xs text-slate-500">
                      {findCategoryBaseline(expenseCategory) 
                        ? "(Auto-set from category history)" 
                        : "(Auto-set to match amount spent)"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={expenseBaseline}
                  onChange={handleBaselineChange}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Expense</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Default is today's date</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeActiveModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExpenseSubmit} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </div>
        );
      
      case 'deposit':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Add Investment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Default is today's date</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                <select
                  value={depositAccount}
                  onChange={(e) => setDepositAccount(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="401k">401(k)</option>
                  <option value="IRA">IRA</option>
                  <option value="Roth IRA">Roth IRA</option>
                  <option value="Brokerage">Brokerage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeActiveModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddDeposit} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Add Investment
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div 
            variants={overlayAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeActiveModal}
          />
          
          <motion.div 
            variants={modalAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {renderModalContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalsContainer;
