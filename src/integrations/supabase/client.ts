// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ypxromfyumbdhxyxarnx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweHJvbWZ5dW1iZGh4eXhhcm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDI0ODIsImV4cCI6MjA1NjI3ODQ4Mn0._gsWU88WBUSXFp-MrDBwHmjS6ycK2FyzUGGMUPDUN5A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);