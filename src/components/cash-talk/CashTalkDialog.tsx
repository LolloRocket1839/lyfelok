import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from 'next-themes';
import { TransactionInterpretation } from '@/components/cash-talk/TransactionInterpretation';
import { Transaction, TransactionType } from '@/utils/transactionRouter';
import { transactionStore } from '@/utils/transactionStore';
import { useTransactionPersistence } from '@/hooks/useTransactionPersistence';
import { getCategory } from '@/lib/utils';

interface CashTalkDialogProps {
  onClose: () => void;
  viewSetter: (view: string) => void;
}

const CashTalkDialog: React.FC<CashTalkDialogProps> = ({ onClose, viewSetter }) => {
  const [mode, setMode] = useState<'input' | 'confirm'>('input');
  const [inputValue, setInputValue] = useState('');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>('USCITA');
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const { saveTransaction } = useTransactionPersistence();

  useEffect(() => {
    if (mode === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const handleAnalyze = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Attenzione",
        description: "Inserisci una transazione da analizzare.",
      });
      return;
    }

    // Simulate NLP analysis
    const nlpResult = {
      type: 'spesa',
      amount: 50,
      description: inputValue,
      category: 'Cibo',
      date: new Date().toISOString().split('T')[0],
      confidence: 'high',
    };

    setAnalysis({
      ...nlpResult,
      amount: parseFloat(nlpResult.amount),
    });
    setMode('confirm');
  };

  const handleConfirmTransaction = async () => {
    if (!analysis) return;

    const transaction: Transaction = {
      type: transactionType,
      amount: analysis.amount,
      description: analysis.description,
      category: analysis.category,
      date: analysis.date,
    };

    const savedTransaction = await saveTransaction(transaction);

    if (savedTransaction) {
      toast({
        title: "Transazione salvata",
        description: "La transazione è stata registrata con successo.",
      });
      setInputValue('');
      setAnalysis(null);
      setMode('input');
      viewSetter('financial');
    } else {
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare la transazione.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <CardContent className="flex flex-col space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Cash Talk</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Chiudi
          </Button>
        </div>

        {mode === 'input' && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="cashInput">Descrivi la tua transazione</Label>
              <Input
                id="cashInput"
                placeholder="Es: 50€ spesa al supermercato"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                ref={inputRef}
              />
            </div>

            <Button onClick={handleAnalyze} className="w-full">
              Analizza
            </Button>
          </>
        )}

        {analysis && (
          <TransactionInterpretation 
            analysis={analysis} 
            onConfirm={() => {
              handleConfirmTransaction();
            }}
            onEdit={() => {
              setAnalysis(null);
              setMode('input');
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CashTalkDialog;
