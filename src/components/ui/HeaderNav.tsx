
import React from 'react';
import { AppView } from '@/hooks/useLifestyleLock';
import { ModalType } from '@/hooks/useLifestyleLock';
import { 
  Home, 
  PieChart, 
  TimerReset, 
  Wallet,
  PlusCircle,
  CreditCard,
  ArrowUpCircle,
  MessageSquareText,
  LogOut,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HeaderNavProps {
  view: AppView;
  setView: (view: AppView) => void;
  currentMonth: string;
  setActiveModal: (type: ModalType) => void;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ view, setView, currentMonth, setActiveModal }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "Disconnessione effettuata",
        description: "Hai effettuato il logout con successo."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive"
      });
    }
  };
  
  const isActive = (currentView: AppView) => view === currentView ? 'bg-slate-100' : '';
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800 mr-8">Lifestyle Lock</h1>
            
            <nav className="hidden md:flex space-x-2">
              <Button
                variant="ghost"
                className={`flex gap-2 ${isActive('dashboard')}`}
                onClick={() => setView('dashboard')}
              >
                <Home size={16} /> Dashboard
              </Button>
              
              <Button
                variant="ghost"
                className={`flex gap-2 ${isActive('investments')}`}
                onClick={() => setView('investments')}
              >
                <PieChart size={16} /> Investimenti
              </Button>
              
              <Button
                variant="ghost"
                className={`flex gap-2 ${isActive('expenses')}`}
                onClick={() => setView('expenses')}
              >
                <Wallet size={16} /> Spese
              </Button>
              
              <Button
                variant="ghost"
                className={`flex gap-2 ${isActive('projections')}`}
                onClick={() => setView('projections')}
              >
                <TimerReset size={16} /> Proiezioni
              </Button>
              
              <Link to="/natural">
                <Button variant="ghost" className="flex gap-2">
                  <MessageSquareText size={16} /> Input Naturale
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-slate-600">{currentMonth}</div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2">
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Aggiungi</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setActiveModal('income')}
                  >
                    <ArrowUpCircle size={16} className="mr-2 text-emerald-500" />
                    Nuovo Reddito
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setActiveModal('expense')}
                  >
                    <CreditCard size={16} className="mr-2 text-red-500" />
                    Nuova Spesa
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setActiveModal('deposit')}
                  >
                    <PieChart size={16} className="mr-2 text-blue-500" />
                    Nuovo Deposito
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start w-full"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} className="mr-2" />
                  Disconnetti
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
