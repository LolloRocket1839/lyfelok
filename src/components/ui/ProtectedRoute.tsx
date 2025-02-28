
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboardingStatus, setCheckingOnboardingStatus] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboardingStatus(false);
        return;
      }

      try {
        // Verifica se l'utente ha completato l'onboarding
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Errore nel controllo dello stato di onboarding:', error);
          // Imposta a true per evitare un ciclo infinito di reindirizzamenti
          setHasCompletedOnboarding(true);
        } else {
          console.log('Stato onboarding:', data?.onboarding_completed);
          // Assicuriamoci che sia trattato come booleano
          setHasCompletedOnboarding(data?.onboarding_completed !== false);
        }
      } catch (error) {
        console.error('Eccezione durante il controllo dello stato di onboarding:', error);
        // Imposta a true per evitare un ciclo infinito di reindirizzamenti
        setHasCompletedOnboarding(true);
      } finally {
        setCheckingOnboardingStatus(false);
      }
    };

    if (user && !loading) {
      checkOnboardingStatus();
    } else if (!loading) {
      setCheckingOnboardingStatus(false);
    }
  }, [user, loading]);

  if (loading || checkingOnboardingStatus) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Solo se è esplicitamente false, reindirizza all'onboarding
  if (user && hasCompletedOnboarding === false) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
