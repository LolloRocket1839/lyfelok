
import { motion } from 'framer-motion';
import { 
  DollarSign, Award, TrendingUp, ChevronUp, Calendar, PieChart, 
  ArrowUpRight, CreditCard, Wallet, Banknote
} from 'lucide-react';
import { 
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { Progress } from '@/components/ui/progress';
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

  // Calculate income-lifestyle differential and percentages
  const differential = income - baselineLifestyle;
  const differentialPercent = Math.round((differential / previousIncome) * 100);
  const differentialIncrease = differential - (previousIncome - baselineLifestyle);

  return (
    <div className="space-y-6">
      {/* Premium Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium opacity-80">Differenziale Reddito-Lifestyle</h1>
            <div className="flex items-baseline mt-2">
              <span className="text-4xl font-bold">{formatCurrency(differential)}</span>
              <div className="ml-4 px-2 py-1 bg-white/20 rounded-lg flex items-center">
                <ChevronUp className="text-emerald-300 mr-1" size={16} />
                <span className="text-emerald-300 font-medium">+{differentialPercent}%</span>
              </div>
              <div className="ml-2 px-2 py-1 bg-white/20 rounded-lg flex items-center">
                <ArrowUpRight className="text-emerald-300 mr-1" size={16} />
                <span className="text-emerald-300 font-medium">+{formatCurrency(differentialIncrease)}</span>
              </div>
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center"
          >
            <Wallet size={30} className="text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Detail Cards with Real-time Updates */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Income Card */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center text-slate-800">
              <DollarSign size={20} className="mr-2 text-blue-500" /> Reddito Attuale
            </h2>
            <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
              Ultimo aggiornamento
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{formatCurrency(income)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="text-emerald-600 font-medium">↑ {formatCurrency(income - previousIncome)}</span> rispetto al periodo precedente
                </p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 rounded-lg px-3 py-2 text-sm font-medium flex items-center">
                <Banknote size={16} className="mr-2" />
                Stipendio +{formatCurrency(1500)}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Lifestyle Card */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center text-slate-800">
              <CreditCard size={20} className="mr-2 text-amber-500" /> Stile di Vita
            </h2>
            <div className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full">
              Ultima spesa
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{formatCurrency(baselineLifestyle)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="text-slate-700 font-medium">{Math.round((baselineLifestyle / income) * 100)}%</span> del reddito totale
                </p>
              </div>
              <div className="bg-red-100 text-red-800 rounded-lg px-3 py-2 text-sm font-medium flex items-center">
                <CreditCard size={16} className="mr-2" />
                Pizza -€30
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Performance Indicator and Allocation */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Performance Gauge */}
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
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gaugeGradient)"
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
              <p className="font-medium text-slate-800">Eccellente!</p>
              <p className="text-sm text-slate-500">Stai risparmiando il {restraintScore}% dei tuoi aumenti di reddito</p>
              <div className="mt-3 text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full inline-block font-medium">
                Top 10% degli utenti
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Allocation Chart */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-medium flex items-center text-slate-800">
              <PieChart size={20} className="mr-2 text-blue-500" /> Allocazione Nuovo Reddito
            </h2>
          </div>
          <div className="p-5">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={translatedAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={500}
                    animationDuration={1500}
                  >
                    {translatedAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xs font-medium text-emerald-700">Investimenti</span>
                  <div className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    +€200
                  </div>
                </div>
                <p className="font-medium text-slate-800">{formatCurrency(investmentAllocation)}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xs font-medium text-blue-700">Risparmi</span>
                </div>
                <p className="font-medium text-slate-800">{formatCurrency(savingsAllocation)}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xs font-medium text-amber-700">Stile di Vita</span>
                  <div className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    +€30
                  </div>
                </div>
                <p className="font-medium text-slate-800">{formatCurrency(lifestyleAllocation)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Assets Growth Timeline */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm overflow-hidden border border-blue-100"
      >
        <div className="p-5 border-b border-blue-100 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center text-slate-800">
            <TrendingUp size={20} className="mr-2 text-blue-500" /> Crescita Patrimoniale
          </h2>
          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
            <Calendar size={14} className="mr-1" />
            Sintesi Annuale
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="h-full flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-sm text-slate-500">Patrimonio Attuale</p>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(investments + savings)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-slate-500">Crescita Annuale</p>
                  <div className="flex items-center">
                    <p className="text-xl font-bold text-emerald-600">+42%</p>
                    <span className="ml-2 text-slate-500 text-sm">/ anno</span>
                  </div>
                </div>
                <div>
                  <div className="bg-emerald-100 text-emerald-800 rounded-lg px-3 py-2 text-sm font-medium flex items-center inline-block">
                    <TrendingUp size={16} className="mr-2" />
                    +{formatCurrency(newIncome)} questo mese
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { year: 'Anno 1', assets: investments + savings },
                    { year: 'Anno 3', assets: (investments + savings) * 1.8 },
                    { year: 'Anno 5', assets: (investments + savings) * 3 },
                    { year: 'Anno 10', assets: (investments + savings) * 6 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `€${Math.round(value / 1000)}K`} />
                  <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Patrimonio']} labelFormatter={(label) => `${label}`} />
                  <defs>
                    <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="assets" 
                    stroke="#3b82f6" 
                    fill="url(#assetGradient)"
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardView;
