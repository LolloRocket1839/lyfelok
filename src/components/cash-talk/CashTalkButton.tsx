
import { useState, useEffect } from 'react';
import { Coins, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CashTalkDialog from './CashTalkDialog';

export default function CashTalkButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Funzione per generare una nuova posizione casuale ma limitata alla parte centrale dello schermo
  const generateRandomPosition = () => {
    // Genera valori tra -100 e 100 per mantenere il bottone nella parte centrale
    const x = Math.floor(Math.random() * 150) - 75; // tra -75 e 75
    const y = Math.floor(Math.random() * 80) - 40; // tra -40 e 40
    
    return { x, y };
  };

  // Cambia la posizione ogni minuto
  useEffect(() => {
    // Imposta una posizione iniziale
    setPosition(generateRandomPosition());
    
    // Aggiorna la posizione ogni minuto
    const interval = setInterval(() => {
      setPosition(generateRandomPosition());
    }, 60000); // 60000ms = 1 minuto
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <motion.div
        className="fixed z-50"
        style={{
          bottom: '50%',
          right: '50%',
          transform: 'translate(50%, 50%)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: position.x,
          y: position.y,
          transition: { 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            duration: 1.5
          }
        }}
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.5 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 w-auto h-14 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          aria-label="Cash Talk"
        >
          <span className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
            <Coins size={18} className="text-white" />
          </span>
          <span className="font-bold text-white">Cash Talk</span>
          <span className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
            <DollarSign size={18} className="text-white" />
          </span>
          
          {/* Effetto pulsante con onda */}
          <span className="absolute inset-0 rounded-full animate-pulse bg-white opacity-15"></span>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && <CashTalkDialog isOpen={isOpen} setIsOpen={setIsOpen} />}
      </AnimatePresence>
    </>
  );
}
