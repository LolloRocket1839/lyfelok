
import { motion } from 'framer-motion';
import { DollarSign, Award, TrendingUp } from 'lucide-react';
import { 
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';

interface DashboardViewProps {
  income: number;
  previousIncome: number;
  baselineLifestyle: number;
  restraintScore: number;
  incomeHistory: Array<{ month: string; income: number }>;
  investments: number;
  savings: number;
  allocationData: Array<{ name: string; value: number; color: string }>;
  newIncome: number;
  investmentAllocation: number;
  savingsAllocation: number;
  lifestyleAllocation: number;
}

const DashboardView = ({
  income,
  previousIncome,
  baselineLifestyle,
  restraintScore,
  incomeHistory,
  investments,
  savings,
  allocationData,
  newIncome,
  investmentAllocation,
  savingsAllocation,
  lifestyleAllocation
}: DashboardViewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Translate allocation data names to Italian
  const translatedAllocationData = allocationData.map(item => ({
    ...item,
    name: item.name === 'Investments' ? 'Investimenti' : 
          item.name === 'Savings' ? 'Risparmi' : 
          item.name === 'Lifestyle' ? 'Stile di Vita' : item.name
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-800">{`${label}`}</p>
          <p className="text-sm text-emerald-600 font-medium">{`Reddito: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const AllocationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm text-emerald-600 font-medium">{`Importo: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Income Overview */}
      <motion.div
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-medium flex items-center text-slate-800">
            <DollarSign size={20} className="mr-2 text-emerald-500" /> Panoramica Reddito
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={slideUp} className="rounded-xl p-4 bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500">Reddito Precedente</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(previousIncome)}</p>
            </motion.div>
            <motion.div variants={slideUp} className="rounded-xl p-4 bg-blue-50 border border-blue-100">
              <p className="text-sm text-slate-500">Reddito Attuale</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(income)}</p>
            </motion.div>
            <motion.div variants={slideUp} className="rounded-xl p-4 bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500">Stile di Vita Base</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(baselineLifestyle)}</p>
            </motion.div>
            <motion.div variants={slideUp} className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-slate-500">Potenziale di Crescita</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(income - baselineLifestyle)}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Income Growth Chart */}
      <motion.div
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-medium text-slate-800">Crescita del Reddito</h2>
        </div>
        <div className="p-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(value) => `€${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="stepAfter" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      {/* Lifestyle Restraint */}
      <motion.div
        variants={fadeIn} 
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-medium flex items-center text-slate-800">
            <Award size={20} className="mr-2 text-emerald-500" /> Controllo Stile di Vita
          </h2>
        </div>
        <div className="p-5 flex items-center justify-center">
          <motion.div 
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-40 w-40 flex items-center justify-center"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={restraintScore > 75 ? "#10b981" : restraintScore > 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                strokeDasharray={`${restraintScore * 2.83} ${283 - restraintScore * 2.83}`}
                strokeDashoffset="70"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${restraintScore * 2.83} ${283 - restraintScore * 2.83}` }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute text-center">
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="text-3xl font-bold text-slate-800"
              >
                {restraintScore}
              </motion.p>
              <p className="text-xs text-slate-500">PUNTEGGIO</p>
            </div>
          </motion.div>
          <div className="ml-6">
            <p className="font-medium text-slate-800">Continua così!</p>
            <p className="text-sm text-slate-500">Stai risparmiando il {restraintScore}% dei tuoi aumenti di reddito</p>
            <div className="mt-3 text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-block">
              Top 10% degli utenti
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* New Income Allocation */}
      <motion.div
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-medium flex items-center text-slate-800">
            <TrendingUp size={20} className="mr-2 text-emerald-500" /> Allocazione Nuovo Reddito
          </h2>
        </div>
        <div className="p-5">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={translatedAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  labelLine={false}
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {translatedAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<AllocationTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-xs text-slate-500">Investimenti</p>
              <p className="font-medium text-slate-800">{formatCurrency(investmentAllocation)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-slate-500">Risparmi</p>
              <p className="font-medium text-slate-800">{formatCurrency(savingsAllocation)}</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-slate-500">Stile di Vita</p>
              <p className="font-medium text-slate-800">{formatCurrency(lifestyleAllocation)}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Assets Growth */}
      <motion.div 
        variants={fadeIn}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 md:col-span-2"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-medium flex items-center text-slate-800">
            <TrendingUp size={20} className="mr-2 text-emerald-500" /> Crescita Patrimoniale
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={slideUp} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500">Investimenti</p>
                  <p className="text-2xl font-medium text-slate-800">{formatCurrency(investments)}</p>
                </motion.div>
                <motion.div variants={slideUp} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500">Risparmi</p>
                  <p className="text-2xl font-medium text-slate-800">{formatCurrency(savings)}</p>
                </motion.div>
              </div>
            </div>
            <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-slate-500">Patrimonio Netto</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(investments + savings)}</p>
              <div className="flex items-center mt-2">
                <div className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  +{formatCurrency(newIncome)} questo mese
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardView;
