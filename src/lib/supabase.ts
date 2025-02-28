
import { createClient } from '@supabase/supabase-js';

// Configura i dati di accesso a Supabase
const supabaseUrl = 'https://wjymsfmddwedcxtahpfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeW1zZm1kZHdlZGN4dGFocGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1OTc2OTMsImV4cCI6MjAyNTE3MzY5M30.rBNQYm4cU3EElVl-X06T4LvJ7YWjRtKQmYg8Ac2kxuI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
