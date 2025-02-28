
-- Aggiunta campo onboarding_completed alla tabella profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Aggiunta campi per le preferenze di onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS housing_expense DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_expense DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS transport_expense DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_investments BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS investment_amount DECIMAL DEFAULT 0;

-- Aggiorna tutti i profili esistenti come onboarding completato
UPDATE public.profiles SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
