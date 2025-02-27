
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <motion.div 
      className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <TrendingUp size={50} className="text-emerald-400" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-light text-white tracking-wider"
      >
        Lifestyle Lock
      </motion.h1>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 180 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="h-0.5 bg-emerald-400 mt-4"
      />
    </motion.div>
  );
};

export default LoadingScreen;
