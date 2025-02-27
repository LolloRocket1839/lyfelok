
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import HeaderNav from '@/components/ui/HeaderNav';
import DashboardView from '@/components/dashboard/DashboardView';
import InvestmentsView from '@/components/investments/InvestmentsView';
import ExpensesView from '@/components/expenses/ExpensesView';
import ProjectionsView from '@/components/projections/ProjectionsView';
import ModalsContainer from '@/components/ui/ModalsContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { fadeIn } from '@/lib/animations';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  const {
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
    
    activeModal,
    setActiveModal,
    resetExpenseForm,
    
    allocationData,
    projectionData,
    
    getCurrentDate
  } = useLifestyleLock();

  // Simulate loading effect
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowContent(true), 300);
    }, 1800);
  }, []);

  // Render each view based on state
  const renderActiveView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <DashboardView
            income={income}
            previousIncome={previousIncome}
            baselineLifestyle={baselineLifestyle}
            restraintScore={restraintScore}
            incomeHistory={incomeHistory}
            investments={investments}
            savings={savings}
            allocationData={allocationData}
            newIncome={newIncome}
            investmentAllocation={investmentAllocation}
            savingsAllocation={savingsAllocation}
            lifestyleAllocation={lifestyleAllocation}
          />
        );
      case 'investments':
        return (
          <InvestmentsView
            deposits={deposits}
            totalDeposits={totalDeposits}
            setActiveModal={setActiveModal}
          />
        );
      case 'expenses':
        return (
          <ExpensesView
            expenses={expenses}
            setExpenses={setExpenses}
            setActiveModal={setActiveModal}
            setEditingExpense={setEditingExpense}
            setExpenseCategory={setExpenseCategory}
            setExpenseSpent={setExpenseSpent}
            setExpenseBaseline={setExpenseBaseline}
          />
        );
      case 'projections':
        return (
          <ProjectionsView
            projectionData={projectionData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50">
        <HeaderNav 
          view={view}
          setView={setView}
          currentMonth={currentMonth}
          setActiveModal={setActiveModal}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Status banner */}
          {showContent && (
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className={`mb-6 p-4 rounded-lg shadow-sm border ${
                totalSpent > baselineLifestyle 
                  ? 'bg-red-50 border-red-100 text-red-900' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-900'
              }`}
            >
              {totalSpent > baselineLifestyle 
                ? (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Warning: Your spending is over your baseline budget!</p>
                      <p className="text-sm mt-1">You're spending ${totalSpent - baselineLifestyle} more than your baseline budget.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-white text-red-600 rounded-lg shadow-sm text-sm border border-red-100">
                      Review Budget
                    </button>
                  </div>
                ) 
                : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Great job! All expenses are within your baseline lifestyle.</p>
                      <p className="text-sm mt-1">You're under budget by ${baselineLifestyle - totalSpent}.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg shadow-sm text-sm border border-emerald-100">
                      On Track
                    </div>
                  </div>
                )
              }
            </motion.div>
          )}
          
          {/* Main content */}
          <AnimatePresence mode="wait">
            {showContent && (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {renderActiveView()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Modals */}
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
        handleAddDeposit={handleAddDeposit}
        getCurrentDate={getCurrentDate}
      />
    </>
  );
};

export default Index;
