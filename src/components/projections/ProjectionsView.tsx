
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fadeIn, slideUp } from '@/lib/animations';

interface ProjectionsViewProps {
  projectionData: Array<{
    name: string;
    withRestraint: number;
    withoutRestraint: number;
  }>;
}

const ProjectionsView = ({ projectionData }: ProjectionsViewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Translate the projection data names to Italian
  const translatedProjectionData = projectionData.map(item => ({
    ...item,
    name: item.name.replace('Year', 'Anno')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-800">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              className={`text-sm font-medium ${entry.dataKey === 'withRestraint' ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
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
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
    >
      <div className="p-5 border-b border-slate-100">
        <motion.h2 variants={fadeIn} className="text-lg font-medium text-slate-800">Proiezione Patrimoniale</motion.h2>
        <motion.p variants={fadeIn} className="text-sm text-slate-500 mt-1">
          Vedi come mantenere il tuo stile di vita attuale nonostante gli aumenti di reddito influisce sulla tua ricchezza nel tempo.
        </motion.p>
      </div>
      
      <motion.div variants={fadeIn} className="p-5 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={translatedProjectionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={(value) => `€${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="withRestraint" name="Con Lifestyle Lock" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
            <Bar dataKey="withoutRestraint" name="Senza Lifestyle Lock" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
      
      <motion.div variants={slideUp} className="mx-5 mb-5 p-5 bg-slate-50 rounded-xl border border-slate-100">
        <h3 className="font-medium mb-3 text-slate-800">Entro l'Anno 10:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-slate-700">Con Lifestyle Lock:</p> 
            <p className="font-bold text-emerald-600 text-xl">{formatCurrency(projectionData[3].withRestraint)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-slate-700">Senza Lifestyle Lock:</p> 
            <p className="font-bold text-red-500 text-xl">{formatCurrency(projectionData[3].withoutRestraint)}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium">
            Differenza: {formatCurrency(projectionData[3].withRestraint - projectionData[3].withoutRestraint)}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            È {Math.round((projectionData[3].withRestraint / projectionData[3].withoutRestraint) * 100) / 100}x più ricchezza mantenendo la disciplina nello stile di vita!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectionsView;
