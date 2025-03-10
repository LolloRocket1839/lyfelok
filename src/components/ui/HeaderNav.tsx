
import { motion } from 'framer-motion';
import { ArrowUpCircle, LogOut, LayoutDashboard, Wallet, TrendingUp } from 'lucide-react';
import { AppView } from '@/hooks/useLifestyleLock';
import { slideInRight } from '@/lib/animations';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderNavProps {
  view: AppView;
  setView: (view: AppView) => void;
  currentMonth: string;
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
}

const HeaderNav = ({ view, setView, currentMonth, setActiveModal }: HeaderNavProps) => {
  const { signOut, user } = useAuth();
  
  // Map English view names to Italian
  const viewLabels = {
    dashboard: 'Dashboard',
    finances: 'Gestione Finanziaria',
    projections: 'Proiezioni'
  };

  // Icon mapping
  const viewIcons = {
    dashboard: <LayoutDashboard size={16} className="mr-2" />,
    finances: <Wallet size={16} className="mr-2" />,
    projections: <TrendingUp size={16} className="mr-2" />
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center shadow-md"
    >
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <h1 className="text-xl font-light tracking-tight mr-4">Lifestyle Lock</h1>
          <div className="mt-2 sm:mt-0 px-3 py-1 bg-slate-700/70 backdrop-blur-sm rounded-full text-sm font-light">
            {currentMonth} 2025
          </div>
        </div>
        {user && (
          <div className="hidden sm:block ml-4 text-sm opacity-70">
            {user.email}
          </div>
        )}
      </div>
      
      <nav className="flex flex-wrap justify-center gap-2">
        {(['dashboard', 'finances', 'projections'] as AppView[]).map((navItem) => (
          <button 
            key={navItem}
            onClick={() => setView(navItem)} 
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 flex items-center ${
              view === navItem 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'hover:bg-slate-700/50'
            }`}
          >
            {viewIcons[navItem]}
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
        
        <button 
          onClick={() => signOut()}
          className="bg-slate-700 hover:bg-slate-600 transition-colors duration-300 px-4 py-2 rounded-full flex items-center shadow-sm"
        >
          <LogOut size={16} className="mr-2" /> Esci
        </button>
      </div>
    </motion.header>
  );
};

export default HeaderNav;
