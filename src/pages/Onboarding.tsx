
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useLifestyleLock } from '@/hooks/useLifestyleLock';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Animazioni
const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [income, setIncome] = useState<number | ''>('');
  const [housingExpense, setHousingExpense] = useState<number | ''>('');
  const [foodExpense, setFoodExpense] = useState<number | ''>('');
  const [transportExpense, setTransportExpense] = useState<number | ''>('');
  const [hasInvestments, setHasInvestments] = useState<boolean | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number | ''>('');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const { setIncome: setAppIncome, setBaselineLifestyle, setInvestments } = useLifestyleLock();

  // Funzione per passare alla domanda successiva
  const nextStep = () => {
    if (currentStep === 1 && (income === '' || income <= 0)) {
      toast({
        title: "Errore",
        description: "Inserisci un valore valido per il tuo reddito mensile",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2 && (housingExpense === '' || foodExpense === '' || transportExpense === '')) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi delle spese essenziali",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && hasInvestments === null) {
      toast({
        title: "Errore",
        description: "Seleziona una risposta per gli investimenti",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && hasInvestments && investmentAmount === '') {
      toast({
        title: "Errore",
        description: "Inserisci l'importo dei tuoi investimenti",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calcola il totale delle spese
      const baseLifestyle = Number(housingExpense) + Number(foodExpense) + Number(transportExpense);
      
      // Aggiorna il contesto dell'applicazione
      if (typeof income === 'number') setAppIncome(income);
      setBaselineLifestyle(baseLifestyle);
      if (hasInvestments && typeof investmentAmount === 'number') {
        setInvestments(investmentAmount);
      }
      
      // Salva le preferenze nel database
      saveUserPreferences();
      
      // Mostra la schermata di completamento
      setTimeout(() => {
        setShowWelcomeScreen(true);
      }, 3000);
    }
  };

  // Salva le preferenze dell'utente nel database
  const saveUserPreferences = async () => {
    if (!user) return;
    
    try {
      const baseLifestyle = Number(housingExpense) + Number(foodExpense) + Number(transportExpense);
      
      // Aggiorna il profilo dell'utente con le preferenze
      const { error } = await supabase
        .from('profiles')
        .update({ 
          income: income || 0,
          housing_expense: housingExpense || 0,
          food_expense: foodExpense || 0,
          transport_expense: transportExpense || 0,
          has_investments: hasInvestments || false,
          investment_amount: hasInvestments ? (investmentAmount || 0) : 0
        })
        .eq('id', user.id);

      if (error) {
        console.error('Errore durante il salvataggio delle preferenze:', error);
        toast({
          title: "Errore",
          description: "Non è stato possibile salvare le tue preferenze",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Eccezione durante il salvataggio delle preferenze:', error);
    }
  };

  // Calcola il totale delle spese di base
  const baseLifestyle = Number(housingExpense || 0) + Number(foodExpense || 0) + Number(transportExpense || 0);

  // Vai alla dashboard e segna l'onboarding come completato
  const goToDashboard = async () => {
    if (user) {
      try {
        // Aggiorna il profilo dell'utente per segnare l'onboarding come completato
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);

        if (error) {
          console.error('Errore durante l\'aggiornamento del profilo:', error);
          toast({
            title: "Errore",
            description: "Non è stato possibile salvare il tuo profilo",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Eccezione durante l\'aggiornamento del profilo:', error);
      }
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-[540px] w-full mx-auto pb-8">
        {/* Intestazione */}
        <header className="py-6 flex justify-between items-center mb-10">
          <div className="font-bold text-2xl text-slate-800">Lifestyle Lock</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-2 h-2 rounded-full transition-all ${
                  step < currentStep 
                    ? 'bg-emerald-200' 
                    : step === currentStep 
                      ? 'bg-emerald-500 transform scale-110' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </header>

        {/* Contenitore domande */}
        <AnimatePresence mode="wait">
          {!showWelcomeScreen ? (
            <motion.div
              key={`question-${currentStep}`}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideUp}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-8"
            >
              {/* Domanda 1: Reddito */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6">Qual è il tuo reddito mensile attuale?</h2>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-slate-500 text-sm mb-8">Inserisci il tuo stipendio netto mensile</p>
                  <button
                    onClick={nextStep}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    Continua
                  </button>
                </div>
              )}

              {/* Domanda 2: Spese base */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6">Quali sono le tue spese mensili essenziali?</h2>
                  <div className="space-y-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block mb-2 font-medium text-slate-800">Alloggio</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={housingExpense}
                          onChange={(e) => setHousingExpense(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block mb-2 font-medium text-slate-800">Cibo</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={foodExpense}
                          onChange={(e) => setFoodExpense(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block mb-2 font-medium text-slate-800">Trasporto</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={transportExpense}
                          onChange={(e) => setTransportExpense(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-8">Questo rappresenterà il tuo stile di vita base</p>
                  <button
                    onClick={nextStep}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    Continua
                  </button>
                </div>
              )}

              {/* Domanda 3: Investimenti */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6">Hai già degli investimenti attivi?</h2>
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={() => setHasInvestments(true)}
                      className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                        hasInvestments === true
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      Sì
                    </button>
                    <button
                      onClick={() => {
                        setHasInvestments(false);
                        setInvestmentAmount('');
                      }}
                      className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                        hasInvestments === false
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  
                  {hasInvestments && (
                    <div className="mb-8 animate-fade-in">
                      <h3 className="text-lg font-medium text-slate-800 mb-4">Inserisci l'importo totale investito:</h3>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={nextStep}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    Completa
                  </button>
                </div>
              )}

              {/* Schermata completamento */}
              {currentStep === 4 && (
                <div className="text-center">
                  <div className="flex justify-center my-8">
                    <svg className="w-20 h-20" viewBox="0 0 52 52">
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="25"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                      />
                      <motion.path
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">Grazie! Abbiamo tutto ciò che ci serve per iniziare.</h2>
                  <p className="text-slate-500 mb-4">Stiamo preparando la tua dashboard personalizzata...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="welcome-screen"
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-slate-800 mb-8">Benvenuto in Lifestyle Lock!</h1>
              
              <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-medium text-slate-800 mb-2">Il tuo stile di vita base:</h3>
                <div className="text-3xl font-bold text-emerald-500 mb-2">€{baseLifestyle.toFixed(0)}/mese</div>
                <p className="text-slate-600">Questo è ciò che ti serve per mantenere il tuo stile di vita attuale.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-100 rounded-xl p-4 h-full">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="text-base font-semibold text-slate-800 mb-2">Mantieni</h4>
                  <p className="text-sm text-slate-600">il tuo stile di vita base e resisti all'inflazione dello stile di vita</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 h-full">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="text-base font-semibold text-slate-800 mb-2">Investi</h4>
                  <p className="text-sm text-slate-600">automaticamente il surplus di reddito anziché aumentare le spese</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 h-full">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="text-base font-semibold text-slate-800 mb-2">Monitora</h4>
                  <p className="text-sm text-slate-600">gli aumenti di stipendio e il loro impatto sulla tua libertà finanziaria</p>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={goToDashboard}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Vai alla Dashboard
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500 font-semibold py-4 px-8 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Modifica Scelte
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
