
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customRedirectUrl, setCustomRedirectUrl] = useState('');
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Gestione degli errori di validazione
  const [errors, setErrors] = useState({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    customRedirectUrl: ''
  });

  // Verificare se l'utente arriva da un link di conferma
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Ottieni i parametri dalla URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Cerca token in diversi posti
        const token_hash = 
          hashParams.get('token_hash') || 
          queryParams.get('token_hash');
        
        const type = 
          hashParams.get('type') || 
          queryParams.get('type');
        
        console.log('Confirmation params:', { token_hash, type });
        
        if (token_hash && type) {
          try {
            // Per Supabase, il tipo corretto per la verifica email è 'signup'
            const { error } = await supabase.auth.verifyOtp({
              token_hash,
              type: 'signup',
            });
            
            if (error) {
              console.error('Verification error:', error);
              toast({
                title: "Errore di verifica",
                description: "Non è stato possibile verificare la tua email: " + error.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Email verificata",
                description: "La tua email è stata verificata con successo. Ora puoi accedere.",
              });
              
              // Pulisci i parametri URL dopo la verifica
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (error: any) {
            console.error("Error during email verification:", error);
            toast({
              title: "Errore di verifica",
              description: "Si è verificato un errore durante la verifica dell'email: " + (error.message || error),
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Exception in confirmation handler:", error);
      }
    };

    handleEmailConfirmation();
  }, [toast]);

  // Funzione per validare il form
  const validateForm = () => {
    const newErrors = {
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
      customRedirectUrl: ''
    };
    let isValid = true;

    // Validazione email
    if (!email) {
      newErrors.email = 'L\'email è obbligatoria';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'L\'email non è valida';
      isValid = false;
    }

    // Validazione conferma email (solo in registrazione)
    if (!isLogin) {
      if (!confirmEmail) {
        newErrors.confirmEmail = 'La conferma dell\'email è obbligatoria';
        isValid = false;
      } else if (email !== confirmEmail) {
        newErrors.confirmEmail = 'Le email non coincidono';
        isValid = false;
      }
    }

    // Validazione password
    if (!password) {
      newErrors.password = 'La password è obbligatoria';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La password deve essere di almeno 6 caratteri';
      isValid = false;
    }

    // Validazione conferma password (solo in registrazione)
    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'La conferma della password è obbligatoria';
        isValid = false;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Le password non coincidono';
        isValid = false;
      }
      
      // Validazione URL personalizzato (se fornito)
      if (customRedirectUrl && !customRedirectUrl.startsWith('http')) {
        newErrors.customRedirectUrl = 'L\'URL deve iniziare con http:// o https://';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, customRedirectUrl || undefined);
      // Dopo la registrazione, mostra un toast e passa alla schermata di login
      setTimeout(() => {
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setCustomRedirectUrl('');
      }, 2000);
    }
  };

  // Cambio modalità (login/registrazione)
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset errori e campi quando si cambia modalità
    setErrors({
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
      customRedirectUrl: ''
    });
    
    if (isLogin) {
      setConfirmEmail('');
      setConfirmPassword('');
      setCustomRedirectUrl('');
    }
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Lifestyle Lock</h1>
            <p className="text-slate-500 mt-2">
              {isLogin ? "Accedi al tuo account" : "Crea un nuovo account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Campo Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.email}
                  </p>
                )}
              </div>
              
              {/* Campo Conferma Email (solo in registrazione) */}
              {!isLogin && (
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      required
                      placeholder="Conferma Email"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.confirmEmail ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.confirmEmail && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" /> {errors.confirmEmail}
                    </p>
                  )}
                </div>
              )}

              {/* Campo Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.password}
                  </p>
                )}
              </div>
              
              {/* Campo Conferma Password (solo in registrazione) */}
              {!isLogin && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Conferma Password"
                      className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
              
              {/* Campo URL personalizzato (solo in registrazione) */}
              {!isLogin && (
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      value={customRedirectUrl}
                      onChange={(e) => setCustomRedirectUrl(e.target.value)}
                      placeholder="URL di reindirizzamento personalizzato (opzionale)"
                      className={`w-full px-4 py-3 border ${errors.customRedirectUrl ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.customRedirectUrl && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" /> {errors.customRedirectUrl}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">
                    Inserisci un URL completo se desideri reindirizzare la conferma a un indirizzo specifico.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isLogin ? (
                <>
                  <LogIn size={18} className="mr-2" />
                  Accedi
                </>
              ) : (
                <>
                  <User size={18} className="mr-2" />
                  Registrati
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-500 hover:underline focus:outline-none"
            >
              {isLogin
                ? "Non hai un account? Registrati"
                : "Hai già un account? Accedi"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
