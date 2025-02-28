
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, TrendingUp, X } from 'lucide-react';

interface SalaryIncreaseNotificationProps {
  previousSalary: number;
  newSalary: number;
  onInvest: (amount: number) => void;
  onDismiss: () => void;
}

export const SalaryIncreaseNotification = ({
  previousSalary,
  newSalary,
  onInvest,
  onDismiss
}: SalaryIncreaseNotificationProps) => {
  const increase = newSalary - previousSalary;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
    >
      <Card className="bg-white p-4 shadow-lg border-l-4 border-l-emerald-400">
        <div className="flex items-start">
          <div className="mr-4 bg-emerald-100 p-2 rounded-full">
            <PartyPopper className="h-6 w-6 text-emerald-500" />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">Aumento di stipendio!</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0" 
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              Abbiamo rilevato un aumento di <span className="font-semibold text-emerald-600">€{increase.toFixed(0)}</span> rispetto 
              al tuo stipendio precedente di €{previousSalary.toFixed(0)}.
            </p>
            
            <p className="text-sm text-gray-600 mt-2 mb-3">
              Vuoi mantenere il tuo stile di vita attuale e investire la differenza?
            </p>
            
            <div className="flex space-x-2">
              <Button 
                className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => onInvest(increase)}
              >
                <TrendingUp className="h-4 w-4" />
                Investi differenza
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onDismiss}
              >
                Più tardi
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
