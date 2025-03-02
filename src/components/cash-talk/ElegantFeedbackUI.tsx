
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface ElegantFeedbackUIProps {
  suggestedCategories: Category[];
  transactionDescription: string;
  onSelectCategory: (category: string) => void;
  onSkip: () => void;
}

const ElegantFeedbackUI: React.FC<ElegantFeedbackUIProps> = ({
  suggestedCategories,
  transactionDescription,
  onSelectCategory,
  onSkip
}) => {
  return (
    <Card className="p-4 animate-in fade-in slide-in-from-bottom-5 duration-300 mb-4 bg-white border shadow-md">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-sm text-gray-500">Confermi la categoria per:</h3>
          <p className="font-semibold truncate">{transactionDescription}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className="px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors border-2"
              style={{ borderColor: category.color || 'transparent' }}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.label}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Salta <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ElegantFeedbackUI;
