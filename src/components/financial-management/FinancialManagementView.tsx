
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Search, Filter, ArrowUp, ChevronDown, ChevronUp,
  Wallet, CreditCard, PiggyBank
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { fadeIn, slideUp } from '@/lib/animations';
import { ExpenseItem, DepositItem } from '@/hooks/useLifestyleLock';
import { getIconForCategory } from '@/utils/investmentCategorization';

interface FinancialManagementViewProps {
  // Expenses props
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  
  // Investments props
  deposits: DepositItem[];
  totalDeposits: number;
  
  // Shared props
  setActiveModal: (modal: 'income' | 'expense' | 'deposit' | null) => void;
  setEditingExpense: (id: number | null) => void;
  setExpenseCategory: (category: string) => void;
  setExpenseSpent: (spent: string) => void;
  setExpenseBaseline: (baseline: string) => void;
  handleDeleteDeposit: (id: number) => void;
  startEditDeposit: (id: number) => void;
}

const FinancialManagementView = ({
  expenses,
  setExpenses,
  deposits,
  totalDeposits,
  setActiveModal,
  setEditingExpense,
  setExpenseCategory,
  setExpenseSpent,
  setExpenseBaseline,
  handleDeleteDeposit,
  startEditDeposit
}: FinancialManagementViewProps) => {
  // Shared state
  const [activeTab, setActiveTab] = useState<'expenses' | 'investments'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);
  
  // Expenses state
  const [periodFilter, setPeriodFilter] = useState('Questo mese');
  const [categoryFilter, setCategoryFilter] = useState('Tutte');
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Expense related calculations
  const totalBudget = expenses.reduce((sum, expense) => sum + expense.baseline, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.spent, 0);
  const spentPercentage = (totalSpent / totalBudget) * 100;
  
  // Calculate net balance
  const netBalance = totalDeposits - totalSpent;
  const isPositiveBalance = netBalance >= 0;
  
  // Get category icon emoji for expenses
  const getCategoryEmoji = (category: string) => {
    switch(category.toLowerCase()) {
      case 'alloggio':
        return '🏠';
      case 'cibo':
        return '🍽️';
      case 'intrattenimento':
        return '🎬';
      case 'trasporto':
        return '🚗';
      default:
        return '📱';
    }
  };
  
  // Get category background color for expenses
  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
      case 'alloggio':
        return { bg: '#F5F8FF', text: '#4D69FA' };
      case 'cibo':
        return { bg: '#FFF8F5', text: '#FA6E4D' };
      case 'intrattenimento':
        return { bg: '#F5FFFA', text: '#06D6A0' };
      case 'trasporto':
        return { bg: '#F5F8FF', text: '#4D69FA' };
      default:
        return { bg: '#F9F5FF', text: '#9D4DFA' };
    }
  };
  
  // Handle edit expense
  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense.id);
    setExpenseCategory(expense.category);
    setExpenseSpent(expense.spent.toString());
    setExpenseBaseline(expense.baseline.toString());
    setActiveModal('expense');
  };
  
  // Investment PieChart tooltip
  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-800">{`${payload[0].name}`}</p>
          <p className="text-sm text-emerald-600 font-medium">{`Importo: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-sm text-slate-600">{`${Math.round((payload[0].value / totalDeposits) * 100)}% del totale`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Investment chart customizations
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  // Custom tooltip for bar chart
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
  
  // Prepare data for pie chart by category
  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    
    deposits.forEach(deposit => {
      const category = deposit.category || 'Non Categorizzato';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + deposit.amount);
    });
    
    const colors = [
      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
      '#64748b', '#d946ef', '#f97316', '#0ea5e9'
    ];
    
    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };
  
  const categoryData = getCategoryData();
  
  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense => 
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (expense.date && formatDate(expense.date).toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter deposits based on search query
  const filteredDeposits = deposits.filter(deposit => 
    (deposit.description && deposit.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (deposit.category && deposit.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (deposit.date && deposit.date.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle transaction add based on current active tab
  const handleAddTransaction = () => {
    setActiveModal(activeTab === 'expenses' ? 'expense' : 'deposit');
  };
  
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-[#12162B] h-[160px] flex items-end justify-center pb-8">
        <h1 className="text-white text-[22px] font-medium">Gestione Finanziaria</h1>
      </div>

      <div className="px-4 md:px-6 -mt-4 max-w-7xl mx-auto">
        {/* Unified Summary Card with Collapsible Content */}
        <Collapsible 
          open={showSummaryDetails}
          onOpenChange={setShowSummaryDetails}
          className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 mr-3">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-sm text-gray-500 font-medium">Panoramica Finanziaria</h3>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-semibold ${isPositiveBalance ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatCurrency(netBalance)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">saldo netto</span>
                </div>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {showSummaryDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-0 border-t border-gray-100">
              {/* Budget Details */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500 mr-3">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Budget Mensile</div>
                  <div className="flex items-baseline">
                    <span className="text-lg font-semibold text-gray-800">{formatCurrency(totalSpent)}</span>
                    <span className="text-sm text-gray-500 ml-2">/ {formatCurrency(totalBudget)}</span>
                  </div>
                  <Progress value={spentPercentage} className="h-[3px] mt-2 w-full max-w-[200px]" />
                </div>
              </div>

              {/* Investments Details */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-500 mr-3">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Totale Investito</div>
                  <div className="flex items-baseline">
                    <span className="text-lg font-semibold text-gray-800">{formatCurrency(totalDeposits)}</span>
                  </div>
                  <div className="text-sm text-emerald-600 mt-1">
                    {deposits.length} investimenti attivi
                  </div>
                </div>
              </div>

              {/* Net Balance Details */}
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositiveBalance ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'} mr-3`}>
                  <Wallet size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Stato Bilancio</div>
                  <div className="flex items-baseline">
                    <span className={`text-lg font-semibold ${isPositiveBalance ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(Math.abs(netBalance))}
                    </span>
                  </div>
                  <div className={`text-sm mt-1 ${isPositiveBalance ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositiveBalance ? 'Saldo disponibile' : 'Saldo negativo'}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Cerca per categoria, data o descrizione..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-[40px] bg-gray-50 border-gray-200"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-[40px] flex items-center gap-2"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} />
              Filtri
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button 
              onClick={handleAddTransaction}
              className="h-[40px] bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Aggiungi Transazione
            </Button>
          </div>
        </div>
        
        {/* Tabs for toggling between expenses and investments */}
        <Tabs 
          defaultValue="expenses" 
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value as 'expenses' | 'investments')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gray-100">
              <CreditCard size={16} className="mr-2" />
              Spese
            </TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-gray-100">
              <PiggyBank size={16} className="mr-2" />
              Investimenti
            </TabsTrigger>
          </TabsList>
          
          {/* Expenses Content */}
          <TabsContent value="expenses" className="mt-0">
            <motion.div 
              variants={fadeIn}
              className="space-y-3"
            >
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const colors = getCategoryColor(expense.category);
                  return (
                    <motion.div
                      key={expense.id}
                      variants={slideUp}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between h-[72px] shadow-sm"
                      onClick={() => handleEditExpense(expense)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {getCategoryEmoji(expense.category)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{expense.category}</p>
                          <p className="text-sm text-gray-400">
                            {expense.date && formatDate(expense.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-base font-semibold text-gray-800">
                        {formatCurrency(expense.spent)}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {searchQuery ? 'Nessuna spesa trovata con i criteri di ricerca' : 'Nessuna spesa registrata'}
                </div>
              )}
            </motion.div>
            
            {/* Expense Analytics - Hidden for Mobile, Visible on MD and above */}
            <div className="hidden md:block mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Analisi Spese</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Spese per Categoria</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenses.map(e => ({ name: e.category, value: e.spent, color: getCategoryColor(e.category).text }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category).text} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Budget vs Spese</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expenses}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="category" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `€${value}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="baseline" name="Budget" fill="#3b82f6" />
                        <Bar dataKey="spent" name="Speso" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Investments Content */}
          <TabsContent value="investments" className="mt-0">
            {/* Investments Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrizione</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredDeposits.length > 0 ? (
                      filteredDeposits.map((deposit) => (
                        <motion.tr 
                          key={deposit.id}
                          variants={slideUp}
                          className="hover:bg-slate-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {deposit.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {deposit.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {deposit.category ? (
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {getIconForCategory(deposit.category)}
                                </span>
                                {deposit.category}
                              </div>
                            ) : (
                              'Non Categorizzato'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                            {formatCurrency(deposit.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => startEditDeposit(deposit.id)}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                title="Modifica"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteDeposit(deposit.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Elimina"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                          {searchQuery ? 'Nessun investimento trovato con i criteri di ricerca' : 'Nessun investimento registrato'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Investment Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Investment by category */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-medium text-slate-800">Investimenti per Categoria</h3>
                </div>
                <div className="p-5 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-2">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                        <span className="truncate">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Monthly Investment trend */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-medium text-slate-800">Contributi Mensili</h3>
                </div>
                <div className="p-5 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deposits}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(value) => `€${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="amount" name="Deposito" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cash Talk Input (Fixed at bottom) - Only visible on small screens */}
      <div className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[342px] md:hidden">
        <div className="flex items-center w-full bg-white rounded-full border border-gray-200 h-[40px] px-4">
          <input
            type="text"
            placeholder="Registra spesa o investimento..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-gray-800 placeholder-gray-400 h-full"
          />
          <button className="flex items-center justify-center h-8 w-8 bg-[#06D6A0] text-white rounded-full">
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagementView;
