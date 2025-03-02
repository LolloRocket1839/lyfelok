import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { motion, AnimatePresence } from 'framer-motion';
import { convertAnalysisToTransaction } from '@/utils/transactionRouter';
import { transactionStore } from '@/utils/transactionStore';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';
import ElegantFeedbackUI from './ElegantFeedbackUI';
import ResponsiveCashTalk from './ResponsiveCashTalk';
import { supabase } from '@/lib/supabase';
import { useTransactionPersistence } from '@/hooks/useTransactionPersistence';
import { useMobile } from '@/hooks/useMobile';
import { useAnimationControls } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ConversationalInterfaceProps {
  viewSetter: (view: 'dashboard' | 'investments' | 'expenses' | 'projections') => void;
}

const ConversationalInterface = ({ viewSetter }: { viewSetter: (view: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const isMobile = useMobile();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const controls = useAnimationControls();
  
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        minimizeDialog();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, isMinimized]);
  
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsOpen(true);
        controls.start({
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 500, damping: 30 }
        });
      }, 1000);
    }
  }, []);
  
  const openDialog = () => {
    setIsTransitioning(true);
    setIsMinimized(false);
    controls.start({
      scale: 1,
      width: isMobile ? '100%' : '450px',
      height: 'auto',
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        onComplete: () => setIsTransitioning(false)
      }
    });
  };
  
  const minimizeDialog = () => {
    setIsTransitioning(true);
    controls.start({
      scale: 0.95,
      width: isMobile ? '180px' : '180px',
      height: '60px',
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        onComplete: () => {
          setIsMinimized(true);
          setIsTransitioning(false);
        }
      }
    });
  };
  
  return (
    <motion.div 
      ref={dialogRef}
      initial={{ y: 100, opacity: 0 }}
      animate={controls}
      className={cn(
        "fixed bottom-4 right-4 overflow-hidden shadow-xl rounded-xl bg-white border border-gray-200 z-50",
        isMinimized ? "w-[180px] h-[60px]" : "w-full md:w-[450px]",
        isMobile && !isMinimized ? "w-full bottom-0 right-0 left-0 rounded-t-xl rounded-b-none" : ""
      )}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      {isMinimized ? (
        <ResponsiveCashTalk onClick={openDialog} isTransitioning={isTransitioning} />
      ) : (
        <EnhancedCashTalkDialog onClose={minimizeDialog} viewSetter={viewSetter} />
      )}
    </motion.div>
  );
};

export default ConversationalInterface;
