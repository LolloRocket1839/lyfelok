
-- Aggiungi il campo onboarding_completed alla tabella profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Aggiorna tutti i profili esistenti come onboarding completato
UPDATE public.profiles SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
