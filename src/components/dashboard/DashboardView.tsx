
import { useState } from 'react';
import { 
  DollarSign, TrendingUp, Percent, ChevronDown, ChevronUp,
  PieChart, ArrowUpRight, CreditCard, Wallet
} from 'lucide-react';
import { 
  AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  Legend, Line, LineChart
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

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
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcolo della percentuale di risparmio
  const savingsPercentage = Math.round(((income - baselineLifestyle) / income) * 100);
  
  // Ultimi 3 mesi di storia del reddito
  const last3MonthsIncome = incomeHistory.slice(-3);
  
  // Dati combinati di entrate e spese per grafico lineare
  const combinedData = last3MonthsIncome.map(item => ({
    month: item.month,
    entrate: item.income,
    spese: item.income * 0.6 // Stima delle spese per dimostrazione
  }));

  // Dati per il grafico a torta delle spese
  const expensesData = [
    { name: 'Alloggio', value: 1200, color: '#4f46e5' },
    { name: 'Cibo', value: 600, color: '#10b981' },
    { name: 'Trasporto', value: 400, color: '#f59e0b' },
    { name: 'Altro', value: 500, color: '#6b7280' }
  ];

  // Calcolo del patrimonio totale
  const totalAssets = investments + savings;

  return (
    <div className="space-y-6">
      {/* Sezione principale con le metriche chiave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo disponibile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"
        >
          <div className="flex items-start mb-2">
            <DollarSign className="text-blue-500 mr-2" size={20} />
            <h2 className="text-base font-medium text-slate-600">Saldo Disponibile</h2>
          </div>
          <p className="text-3xl font-bold text-slate-800 mb-2">{formatCurrency(income)}</p>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="text-emerald-500 mr-1" size={16} />
            <span className="text-emerald-600 font-medium">{formatCurrency(income - previousIncome)}</span>
            <span className="text-slate-500 ml-1">rispetto al mese scorso</span>
          </div>
        </motion.div>

        {/* Andamento entrate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"
        >
          <div className="flex items-start mb-1">
            <TrendingUp className="text-blue-500 mr-2" size={20} />
            <h2 className="text-base font-medium text-slate-600">Andamento Entrate</h2>
          </div>
          <div className="h-[120px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={last3MonthsIncome}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#94a3b8" 
                  tickFormatter={(value) => `€${Math.round(value / 1000)}K`} 
                  width={45}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Percentuale di risparmio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"
        >
          <div className="flex items-start mb-2">
            <Percent className="text-blue-500 mr-2" size={20} />
            <h2 className="text-base font-medium text-slate-600">Percentuale Risparmio</h2>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-slate-800">{savingsPercentage}%</p>
            <span className="ml-2 text-sm text-slate-500">del reddito totale</span>
          </div>
          <div className="mt-3">
            <Progress value={savingsPercentage} className="h-2" />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Risparmi {formatCurrency(income - baselineLifestyle)} al mese
          </p>
        </motion.div>
      </div>

      {/* Collapsible per mostrare più dettagli */}
      <Collapsible 
        open={showMoreDetails} 
        onOpenChange={setShowMoreDetails}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-800">Dettagli Finanziari</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              {showMoreDetails ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-6">
            {/* Grafico Entrate vs Spese */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700">Entrate vs Spese</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={combinedData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      stroke="#94a3b8" 
                      tickFormatter={(value) => `€${Math.round(value / 1000)}K`} 
                      width={45}
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(Number(value))}`, '']}
                      labelFormatter={(label) => `Mese: ${label}`}
                      contentStyle={{ borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      name="Entrate"
                      dataKey="entrate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      name="Spese"
                      dataKey="spese"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribuzione Spese */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Distribuzione Spese</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(Number(value))}`, '']}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Allocazione Nuovo Reddito</h3>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Investimenti</p>
                    <p className="font-medium text-slate-800">{formatCurrency(investmentAllocation)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-blue-700 mb-1">Risparmi</p>
                    <p className="font-medium text-slate-800">{formatCurrency(savingsAllocation)}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Stile di Vita</p>
                    <p className="font-medium text-slate-800">{formatCurrency(lifestyleAllocation)}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Patrimonio Totale</h3>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalAssets)}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <div>
                      <p className="text-slate-500">Investimenti</p>
                      <p className="font-medium text-slate-800">{formatCurrency(investments)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Risparmi</p>
                      <p className="font-medium text-slate-800">{formatCurrency(savings)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DashboardView;
