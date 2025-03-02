
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResponsiveCashTalkProps {
  onClick: () => void;
  isTransitioning?: boolean;
}

const ResponsiveCashTalk: React.FC<ResponsiveCashTalkProps> = ({ 
  onClick,
  isTransitioning = false
}) => {
  return (
    <motion.div
      whileHover={{ scale: isTransitioning ? 1 : 1.05 }}
      whileTap={{ scale: isTransitioning ? 1 : 0.95 }}
      className="flex items-center justify-between w-full h-full px-3 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
      onClick={!isTransitioning ? onClick : undefined}
    >
      <div className="flex items-center">
        <MessageSquarePlus className="mr-2 h-5 w-5 text-white" />
        <span className="font-medium text-white">Cash Talk</span>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="p-0 h-6 w-6 rounded-full bg-white/20 hover:bg-white/30"
        onClick={(e) => {
          e.stopPropagation();
          if (!isTransitioning) onClick();
        }}
      >
        <span className="sr-only">Open Cash Talk</span>
        <span className="text-white font-bold">+</span>
      </Button>
    </motion.div>
  );
};

export default ResponsiveCashTalk;
