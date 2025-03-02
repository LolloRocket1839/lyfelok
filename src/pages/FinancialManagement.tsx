
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import HeaderNav from '@/components/ui/HeaderNav';
import FinancialManagementView from '@/components/financial-management/FinancialManagementView';
import ModalsContainer from '@/components/ui/ModalsContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ConversationalInterface from '@/components/cash-talk/ConversationalInterface';
import { fadeIn } from '@/lib/animations';

const FinancialManagement = () => {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const {
    view,
    setView,
    currentMonth,
    deposits,
    expenses,
    setExpenses,
    totalDeposits,
    
    handleDeleteDeposit,
    startEditDeposit,
    
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
    
    handleIncomeIncrease,
    handleAddDeposit,
    handleExpenseSubmit,
    
    newIncomeValue,
    setNewIncomeValue,
    incomeDate,
    setIncomeDate,
    
    getCurrentDate
  } = useLifestyleLock();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowContent(true), 300);
    }, 800);
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
        
        <main className="max-w-7xl mx-auto sm:pt-6 pb-20">
          {showContent && (
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <FinancialManagementView
                expenses={expenses}
                setExpenses={setExpenses}
                deposits={deposits}
                totalDeposits={totalDeposits}
                setActiveModal={setActiveModal}
                setEditingExpense={setEditingExpense}
                setExpenseCategory={setExpenseCategory}
                setExpenseSpent={setExpenseSpent}
                setExpenseBaseline={setExpenseBaseline}
                handleDeleteDeposit={handleDeleteDeposit}
                startEditDeposit={startEditDeposit}
              />
            </motion.div>
          )}
        </main>
        
        {showContent && (
          <ConversationalInterface viewSetter={setView} />
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
