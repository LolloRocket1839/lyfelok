
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModalsContainer } from '@/components/ui/ModalsContainer';
import { HeaderNav } from '@/components/ui/HeaderNav';
import DashboardView from '@/components/dashboard/DashboardView';
import InvestmentsView from '@/components/investments/InvestmentsView';
import ExpensesView from '@/components/expenses/ExpensesView';
import ProjectionsView from '@/components/projections/ProjectionsView';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { Dumbbell, LineChart, Target, PiggyBank } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type ViewType = 'dashboard' | 'investments' | 'expenses' | 'projections';

const Index = () => {
  const { toast } = useToast();
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const { 
    setIncome, 
    setBaselineLifestyle, 
    setInvestments, 
    view, 
    setView, 
    activeModal, 
    setActiveModal 
  } = useLifestyleLock();
  
  useEffect(() => {
    // Carica i dati dell'utente da Supabase
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('income, housing_expense, food_expense, transport_expense, investment_amount')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Errore nel caricamento dei dati utente:', error);
          return;
        }
        
        if (data) {
          // Imposta i valori nel contesto
          setIncome(data.income || 5000);
          
          // Calcola il lifestyle di base
          const baseLifestyle = (data.housing_expense || 0) + 
                               (data.food_expense || 0) + 
                               (data.transport_expense || 0);
          setBaselineLifestyle(baseLifestyle || 3000);
          
          // Imposta gli investimenti
          setInvestments(data.investment_amount || 10000);
          
          console.log('Dati utente caricati con successo');
        }
      } catch (error) {
        console.error('Eccezione durante il caricamento dei dati utente:', error);
      }
    };
    
    loadUserData();
  }, [user, setIncome, setBaselineLifestyle, setInvestments]);

  const handleChangeView = (newView: ViewType) => {
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderNav />
      
      <main className="container px-4 py-6 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Lifestyle Lock</h1>
        
        <Tabs 
          value={view} 
          onValueChange={(value) => handleChangeView(value as ViewType)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              {!isMobile && <Target size={18} />}
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              {!isMobile && <PiggyBank size={18} />}
              Investimenti
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              {!isMobile && <Dumbbell size={18} />}
              Spese
            </TabsTrigger>
            <TabsTrigger value="projections" className="flex items-center gap-2">
              {!isMobile && <LineChart size={18} />}
              Proiezioni
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardView />
          </TabsContent>
          
          <TabsContent value="investments">
            <InvestmentsView />
          </TabsContent>
          
          <TabsContent value="expenses">
            <ExpensesView />
          </TabsContent>
          
          <TabsContent value="projections">
            <ProjectionsView />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Modali per aggiungere/modificare dati */}
      <ModalsContainer />
    </div>
  );
};

export default Index;
