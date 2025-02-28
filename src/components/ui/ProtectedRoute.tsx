
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import { supabase } from '@/integrations/supabase/client'; // Utilizza il client centralizzato

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
          setHasCompletedOnboarding(false);
        } else {
          // Aggiunto log per debug
          console.log('Stato onboarding:', data?.onboarding_completed);
          setHasCompletedOnboarding(data?.onboarding_completed === true);
        }
      } catch (error) {
        console.error('Eccezione durante il controllo dello stato di onboarding:', error);
        setHasCompletedOnboarding(false);
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

  if (user && hasCompletedOnboarding === false) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
