
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and public anon key
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
