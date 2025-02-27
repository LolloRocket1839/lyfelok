
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fadeIn, slideUp } from '@/lib/animations';
import { ExpenseItem } from '@/hooks/useLifestyleLock';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
  setEditingExpense: (id: number | null) => void;
  setExpenseCategory: (category: string) => void;
  setExpenseSpent: (spent: string) => void;
  setExpenseBaseline: (baseline: string) => void;
}

const ExpensesView = ({ 
  expenses, 
  setExpenses, 
  setActiveModal, 
  setEditingExpense,
  setExpenseCategory,
  setExpenseSpent,
  setExpenseBaseline
}: ExpensesViewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-800">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              className={`text-sm font-medium ${entry.dataKey === 'baseline' ? 'text-indigo-600' : 'text-emerald-600'}`}
            >
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense.id);
    setExpenseCategory(expense.category);
    setExpenseSpent(expense.spent.toString());
    setExpenseBaseline(expense.baseline.toString());
    setActiveModal('expense');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <motion.h2 variants={fadeIn} className="text-xl font-medium text-slate-800">Spese Mensili</motion.h2>
        <motion.button 
          variants={slideUp}
          onClick={() => {
            setEditingExpense(null);
            setActiveModal('expense');
          }}
          className="bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300 text-white px-4 py-2 rounded-full flex items-center shadow-sm"
        >
          <Plus size={16} className="mr-2" /> Aggiungi Spesa
        </motion.button>
      </div>
      
      <motion.div 
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-800">Ripartizione Spese</h3>
        </div>
        <div className="p-5 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expenses}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(value) => `€${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="baseline" name="Budget Base" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={25} />
              <Bar dataKey="spent" name="Spesa Effettiva" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      <motion.div 
        variants={fadeIn}
        className="space-y-3"
      >
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            variants={slideUp}
            className="bg-white border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center">
              <span className="mr-3 bg-slate-100 p-2 rounded-full">{expense.icon}</span>
              <div>
                <p className="font-medium text-slate-800">{expense.category}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-500">
                    <span className={expense.spent > expense.baseline ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'}>
                      {formatCurrency(expense.spent)}
                    </span> 
                    {' / '} 
                    <span className="text-indigo-500 font-medium">{formatCurrency(expense.baseline)}</span>
                  </p>
                  {expense.spent <= expense.baseline && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      Sotto budget
                    </span>
                  )}
                  {expense.spent > expense.baseline && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                      Sopra budget
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {expense.date && formatDate(expense.date)}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleEditExpense(expense)} 
                className="text-slate-500 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-full"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setExpenses(expenses.filter(exp => exp.id !== expense.id))} 
                className="text-slate-500 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-full"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ExpensesView;
