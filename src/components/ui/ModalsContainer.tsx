
import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimation, overlayAnimation } from '@/lib/animations';
import { ModalType, ExpenseItem } from '@/hooks/useLifestyleLock';
import { useState, useEffect } from 'react';
import { autoCategorize } from '@/utils/autoCategorization';
import { categorizeInvestment, getAllCategories } from '@/utils/investmentCategorization';

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
  
  // Added prop for expenses
  expenses: ExpenseItem[];
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
  getCurrentDate,
  expenses
}: ModalsContainerProps) => {
  const [merchantName, setMerchantName] = useState('');
  const [baselineModified, setBaselineModified] = useState(false);
  const [investmentDescription, setInvestmentDescription] = useState('');
  const [investmentCategory, setInvestmentCategory] = useState('');

  const closeActiveModal = () => {
    if (activeModal === 'expense') {
      resetExpenseForm();
      setMerchantName('');
      setBaselineModified(false);
    } else if (activeModal === 'deposit') {
      setInvestmentDescription('');
      setInvestmentCategory('');
    }
    setActiveModal(null);
  };

  // Find the most recent baseline for a category from existing expenses
  const findCategoryBaseline = (category: string) => {
    // Get all expenses with this category
    const categoryExpenses = expenses.filter(
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

  // Handle investment description change - auto-categorize
  const handleInvestmentDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target.value;
    setInvestmentDescription(description);
    
    if (description.trim() !== '') {
      const result = categorizeInvestment({ 
        name: description, 
        description: description 
      });
      
      if (result.category !== 'Non Categorizzato') {
        setInvestmentCategory(result.category);
      }
    }
  };

  // Handle investment category change
  const handleInvestmentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setInvestmentCategory(category);
    
    // Se la categoria è "Liquidità", ripuliamo la descrizione poiché non è necessaria
    if (category === 'Liquidità') {
      setInvestmentDescription('');
    }
  };

  // Reset baselineModified flag when editing expense changes
  useEffect(() => {
    setBaselineModified(false);
  }, [editingExpense]);
  
  // Get all investment categories
  const investmentCategories = getAllCategories();

  const renderModalContent = () => {
    switch (activeModal) {
      case 'income':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Aumento Reddito</h2>
            <p className="mb-4 text-slate-600">Inserisci il tuo nuovo reddito mensile:</p>
            <div className="space-y-4">
              <input
                type="number"
                value={newIncomeValue}
                onChange={(e) => setNewIncomeValue(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nuovo reddito mensile"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data di Variazione Reddito</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Predefinito è la data odierna</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeActiveModal} 
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annulla
              </button>
              <button 
                onClick={handleIncomeIncrease} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Aggiorna Reddito
              </button>
            </div>
          </div>
        );
      
      case 'expense':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingExpense ? 'Modifica Spesa' : 'Aggiungi Nuova Spesa'}
            </h2>
            <div className="space-y-4">
              {!editingExpense && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Esercente</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={handleMerchantChange}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="es., Uber, Starbucks, Amazon"
                  />
                  {merchantName && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {expenseCategory ? `Auto-categorizzato come: ${expenseCategory}` : "Nessuna categoria rilevata"}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={expenseCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="es. Alloggio, Cibo, Intrattenimento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Importo Speso</label>
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
                  Budget Base
                  {!baselineModified && !editingExpense && (
                    <span className="ml-2 text-xs text-slate-500">
                      {findCategoryBaseline(expenseCategory) 
                        ? "(Auto-impostato dalla cronologia categoria)" 
                        : "(Auto-impostato per corrispondere all'importo speso)"}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Data della Spesa</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Predefinito è la data odierna</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeActiveModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annulla
              </button>
              <button 
                onClick={handleExpenseSubmit} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                {editingExpense ? 'Aggiorna Spesa' : 'Aggiungi Spesa'}
              </button>
            </div>
          </div>
        );
      
      case 'deposit':
        return (
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Aggiungi Investimento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Predefinito è la data odierna</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select
                  value={investmentCategory}
                  onChange={handleInvestmentCategoryChange}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">Seleziona una categoria</option>
                  {investmentCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Mostra il campo descrizione solo se la categoria non è Liquidità */}
              {investmentCategory !== 'Liquidità' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione/Nome</label>
                  <input
                    type="text"
                    value={investmentDescription}
                    onChange={handleInvestmentDescriptionChange}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="es. ETF MSCI World, BTP 10 anni, Azioni Enel"
                  />
                  {investmentDescription && investmentCategory && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Auto-categorizzato come: {investmentCategory}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Importo</label>
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
                Annulla
              </button>
              <button 
                onClick={handleAddDeposit} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Aggiungi Investimento
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
