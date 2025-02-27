
import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimation, overlayAnimation } from '@/lib/animations';
import { ModalType } from '@/hooks/useLifestyleLock';

interface ModalsContainerProps {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  
  // Income modal props
  newIncomeValue: string;
  setNewIncomeValue: (value: string) => void;
  handleIncomeIncrease: () => void;
  
  // Expense modal props
  expenseCategory: string;
  setExpenseCategory: (value: string) => void;
  expenseSpent: string;
  setExpenseSpent: (value: string) => void;
  expenseBaseline: string;
  setExpenseBaseline: (value: string) => void;
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
}

const ModalsContainer = ({
  activeModal,
  setActiveModal,
  newIncomeValue,
  setNewIncomeValue,
  handleIncomeIncrease,
  expenseCategory,
  setExpenseCategory,
  expenseSpent,
  setExpenseSpent,
  expenseBaseline,
  setExpenseBaseline,
  handleExpenseSubmit,
  editingExpense,
  resetExpenseForm,
  depositDate,
  setDepositDate,
  depositAmount,
  setDepositAmount,
  depositAccount,
  setDepositAccount,
  handleAddDeposit
}: ModalsContainerProps) => {
  const closeActiveModal = () => {
    if (activeModal === 'expense') {
      resetExpenseForm();
    }
    setActiveModal(null);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'income':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Income Increase</h2>
            <p className="mb-4 text-slate-600">Enter your new monthly income:</p>
            <input
              type="number"
              value={newIncomeValue}
              onChange={(e) => setNewIncomeValue(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="New monthly income"
            />
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Housing, Food, Entertainment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Spent</label>
                <input
                  type="number"
                  value={expenseSpent}
                  onChange={(e) => setExpenseSpent(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Baseline Budget</label>
                <input
                  type="number"
                  value={expenseBaseline}
                  onChange={(e) => setExpenseBaseline(e.target.value)}
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
