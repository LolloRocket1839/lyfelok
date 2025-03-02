
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeaderNav from '@/components/ui/HeaderNav';
import FinancialManagementView from '@/components/financial-management/FinancialManagementView';
import ModalsContainer from '@/components/ui/ModalsContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConversationalInterface from '@/components/cash-talk/ConversationalInterface';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { fadeIn } from '@/lib/animations';

type AppView = 'dashboard' | 'investments' | 'expenses' | 'projections' | 'finances';

const FinancialManagement = () => {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [view, setView] = useState<AppView>('finances');
  
  const {
    income,
    previousIncome,
    baselineLifestyle,
    currentMonth,
    restraintScore,
    investments,
    savings,
    incomeHistory,
    deposits,
    expenses,
    setExpenses,
    totalSpent,
    totalDeposits,
    
    newIncome,
    investmentAllocation,
    savingsAllocation,
    lifestyleAllocation,
    
    handleIncomeIncrease,
    handleAddDeposit,
    handleExpenseSubmit,
    handleDeleteDeposit,
    startEditDeposit,
    
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
    resetDepositForm,
    
    activeModal,
    setActiveModal,
    resetExpenseForm,
    
    allocationData,
    projectionData,
    
    getCurrentDate
  } = useLifestyleLock();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowContent(true), 300);
    }, 1800);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50 pb-20">
        <HeaderNav 
          view={view}
          setView={setView}
          currentMonth={currentMonth}
          setActiveModal={setActiveModal}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          {showContent && (
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-6 p-4 rounded-lg shadow-sm border bg-emerald-50 border-emerald-100 text-emerald-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Gestione Finanziaria Avanzata</p>
                  <p className="text-sm mt-1">Qui puoi analizzare e gestire tutte le tue finanze in modo dettagliato.</p>
                </div>
                <div className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg shadow-sm text-sm border border-emerald-100">
                  Pro
                </div>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            {showContent && (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <FinancialManagementView 
                  income={income}
                  investments={investments}
                  totalSpent={totalSpent}
                  savings={savings}
                  baselineLifestyle={baselineLifestyle}
                  deposits={deposits}
                  expenses={expenses}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {showContent && (
          <ConversationalInterface viewSetter={(newView) => setView(newView as any)} />
        )}
      </div>
      
      <ModalsContainer
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        newIncomeValue={newIncomeValue}
        setNewIncomeValue={setNewIncomeValue}
        incomeDate={incomeDate}
        setIncomeDate={setIncomeDate}
        handleIncomeIncrease={handleIncomeIncrease}
        expenseCategory={expenseCategory}
        setExpenseCategory={setExpenseCategory}
        expenseSpent={expenseSpent}
        setExpenseSpent={setExpenseSpent}
        expenseBaseline={expenseBaseline}
        setExpenseBaseline={setExpenseBaseline}
        expenseDate={expenseDate}
        setExpenseDate={setExpenseDate}
        handleExpenseSubmit={handleExpenseSubmit}
        editingExpense={editingExpense}
        resetExpenseForm={resetExpenseForm}
        depositDate={depositDate}
        setDepositDate={setDepositDate}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        depositAccount={depositAccount}
        setDepositAccount={setDepositAccount}
        depositDescription={depositDescription}
        setDepositDescription={setDepositDescription}
        depositCategory={depositCategory}
        setDepositCategory={setDepositCategory}
        handleAddDeposit={handleAddDeposit}
        editingDeposit={editingDeposit}
        resetDepositForm={resetDepositForm}
        getCurrentDate={getCurrentDate}
        expenses={expenses}
      />
    </>
  );
};

export default FinancialManagement;
