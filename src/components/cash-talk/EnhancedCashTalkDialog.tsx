import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown, DollarSign, Edit, HelpCircle, PlusCircle, X } from 'lucide-react';
import { cn, getCategory } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useTransactionPersistence } from '@/hooks/useTransactionPersistence';
import { Transaction, TransactionType } from '@/utils/transactionRouter';
import { mainCategories } from '@/utils/transactionStore';
import { useMobile } from '@/hooks/useMobile';
import TransactionInterpretation from '@/components/cash-talk/TransactionInterpretation';

interface EnhancedCashTalkDialogProps {
  onClose: () => void;
  viewSetter: (view: string) => void;
}

const EnhancedCashTalkDialog: React.FC<EnhancedCashTalkDialogProps> = ({ onClose, viewSetter }) => {
  const [inputValue, setInputValue] = useState('');
  const [analysisState, setAnalysisState] = useState<'input' | 'processing' | 'interpretation' | 'confirmed'>('input');
  const [transactionType, setTransactionType] = useState<TransactionType>('USCITA');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [forceModeChange, setForceModeChange] = useState(false);
  const [transactionData, setTransactionData] = useState<Transaction | null>(null);
  const [interpretation, setInterpretation] = useState<any>(null);
  const { toast } = useToast();
  const { saveTransaction } = useTransactionPersistence();
  const isMobile = useMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (analysisState === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [analysisState]);
  
  const resetAnalysisState = () => {
    setAnalysisState('input');
    setForceModeChange(false);
    setTransactionData(null);
    setInterpretation(null);
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date());
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };
  
  const handleSubmit = async () => {
    if (!amount || !description || !category || !date) {
      toast({
        title: "Errore",
        description: "Per favore, compila tutti i campi.",
        variant: "destructive",
      });
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      toast({
        title: "Errore",
        description: "Importo non valido.",
        variant: "destructive",
      });
      return;
    }
    
    const newTransaction: Transaction = {
      type: transactionType,
      amount: parsedAmount,
      description: description,
      category: category,
      date: date.toISOString().split('T')[0],
    };
    
    setTransactionData(newTransaction);
    setAnalysisState('processing');
    
    setTimeout(() => {
      setInterpretation({
        type: transactionType,
        amount: parsedAmount,
        description: description,
        category: category,
        date: date.toISOString().split('T')[0],
        confidence: 0.9
      });
      setAnalysisState('interpretation');
    }, 500);
  };
  
  return (
    <Card className="w-full h-full flex flex-col rounded-none md:rounded-xl shadow-none md:shadow-lg border-none md:border">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Cash Talk</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            {isMobile ? null : <span className="sr-only">Chiudi</span>}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow overflow-y-auto">
        {analysisState === 'input' || forceModeChange ? (
          <div className="flex flex-col space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo di transazione</Label>
              <Select onValueChange={handleTypeChange} defaultValue={transactionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRATA">Entrata</SelectItem>
                  <SelectItem value="USCITA">Spesa</SelectItem>
                  <SelectItem value="INVESTIMENTO">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Importo</Label>
              <Input 
                type="number" 
                id="amount" 
                placeholder="0.00" 
                value={amount}
                onChange={handleAmountChange}
                ref={inputRef}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea 
                id="description" 
                placeholder="Aggiungi una descrizione" 
                value={description}
                onChange={handleDescriptionChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Scegli una data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button onClick={handleSubmit}>
              Analizza transazione
            </Button>
          </div>
        ) : analysisState === 'processing' ? (
          <div className="flex items-center justify-center h-full">
            <HelpCircle className="mr-2 h-6 w-6 animate-spin text-blue-500" />
            <span>Analisi in corso...</span>
          </div>
        ) : analysisState === 'interpretation' && interpretation ? (
          <TransactionInterpretation 
            analysis={interpretation} 
            onConfirm={() => {
              if (transactionData) {
                saveTransaction(transactionData);
                setAnalysisState('confirmed');
                setInterpretation(null);
                setInputValue('');
                resetAnalysisState();
              }
            }}
            onEdit={() => {
              setAnalysisState('input');
              setForceModeChange(true);
              setTransactionData(null);
              setInterpretation(null);
            }}
          />
        ) : analysisState === 'confirmed' ? (
          <div className="flex items-center justify-center h-full">
            <Check className="mr-2 h-6 w-6 text-green-500" />
            <span>Transazione salvata!</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default EnhancedCashTalkDialog;
