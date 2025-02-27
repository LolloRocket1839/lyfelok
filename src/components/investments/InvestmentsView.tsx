
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fadeIn, slideUp } from '@/lib/animations';
import { DepositItem } from '@/hooks/useLifestyleLock';

interface InvestmentsViewProps {
  deposits: DepositItem[];
  totalDeposits: number;
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
}

const InvestmentsView = ({ deposits, totalDeposits, setActiveModal }: InvestmentsViewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getAccountLabel = (account: string) => {
    switch(account) {
      case '401k': return '401(k)';
      default: return account;
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-800">{`Data: ${label}`}</p>
          <p className="text-sm text-emerald-600 font-medium">{`Importo: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <motion.h2 variants={fadeIn} className="text-xl font-medium text-slate-800">Depositi Investimenti</motion.h2>
        <motion.button 
          variants={slideUp}
          onClick={() => setActiveModal('deposit')}
          className="bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300 text-white px-4 py-2 rounded-full flex items-center shadow-sm"
        >
          <Plus size={16} className="mr-2" /> Aggiungi Investimento
        </motion.button>
      </div>
      
      <motion.div 
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-800">
            Totale Investito: <span className="text-emerald-600">{formatCurrency(totalDeposits)}</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {deposits.map((deposit) => (
                <motion.tr 
                  key={deposit.id}
                  variants={slideUp}
                  className="hover:bg-slate-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {deposit.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {getAccountLabel(deposit.account)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                    {formatCurrency(deposit.amount)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Investment contribution chart */}
      <motion.div 
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-800">Contributi Mensili agli Investimenti</h3>
        </div>
        <div className="p-5 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={deposits}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(value) => `€${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="amount" name="Deposito Investimento" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvestmentsView;
