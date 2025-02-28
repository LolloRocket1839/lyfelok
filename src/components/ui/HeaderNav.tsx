
import { motion } from 'framer-motion';
import { ArrowUpCircle, LogOut, MessageSquare, Coins } from 'lucide-react';
import { AppView } from '@/hooks/useLifestyleLock';
import { slideInRight } from '@/lib/animations';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import EnhancedCashTalkDialog from '../cash-talk/EnhancedCashTalkDialog';

interface HeaderNavProps {
  view: AppView;
  setView: (view: AppView) => void;
  currentMonth: string;
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
}

const HeaderNav = ({ view, setView, currentMonth, setActiveModal }: HeaderNavProps) => {
  const { signOut, user } = useAuth();
  const [isCashTalkOpen, setIsCashTalkOpen] = useState(false);
  
  // Map English view names to Italian
  const viewLabels = {
    dashboard: 'Dashboard',
    investments: 'Investimenti',
    expenses: 'Spese',
    projections: 'Proiezioni'
  };

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center shadow-md"
      >
        <div className="flex items-center mb-4 sm:mb-0">
          <h1 className="text-xl font-light tracking-tight">Lifestyle Lock</h1>
          <div className="ml-4 px-3 py-1 bg-slate-700/70 backdrop-blur-sm rounded-full text-sm font-light">
            {currentMonth} 2025
          </div>
          {user && (
            <div className="ml-4 text-sm opacity-70">
              {user.email}
            </div>
          )}
        </div>
        
        <nav className="flex flex-wrap justify-center gap-2">
          {(['dashboard', 'investments', 'expenses', 'projections'] as AppView[]).map((navItem) => (
            <button 
              key={navItem}
              onClick={() => setView(navItem)} 
              className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                view === navItem 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'hover:bg-slate-700/50'
              }`}
            >
              {viewLabels[navItem]}
            </button>
          ))}
        </nav>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <motion.button 
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            onClick={() => setActiveModal('income')}
            className="bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300 px-4 py-2 rounded-full flex items-center shadow-sm"
          >
            <ArrowUpCircle size={16} className="mr-2" /> Aumento Reddito
          </motion.button>
          
          <motion.button
            variants={slideInRight}
            initial="hidden"
            animate="visible" 
            onClick={() => setIsCashTalkOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300 px-4 py-2 rounded-full flex items-center shadow-sm"
          >
            <Coins size={16} className="mr-2" /> Cash Talk
          </motion.button>
          
          <button 
            onClick={() => signOut()}
            className="bg-slate-700 hover:bg-slate-600 transition-colors duration-300 px-4 py-2 rounded-full flex items-center shadow-sm"
          >
            <LogOut size={16} className="mr-2" /> Esci
          </button>
        </div>
      </motion.header>
      
      {/* Dialog di Cash Talk */}
      {isCashTalkOpen && (
        <EnhancedCashTalkDialog isOpen={isCashTalkOpen} setIsOpen={setIsCashTalkOpen} />
      )}
    </>
  );
};

export default HeaderNav;
