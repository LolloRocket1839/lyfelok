
import { createClient } from '@supabase/supabase-js';

// Configura i dati di accesso a Supabase
const supabaseUrl = 'https://ypxromfyumbdhxyxarnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweHJvbWZ5dW1iZGh4eXhhcm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDI0ODIsImV4cCI6MjA1NjI3ODQ4Mn0._gsWU88WBUSXFp-MrDBwHmjS6ycK2FyzUGGMUPDUN5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
