
import { createClient } from '@supabase/supabase-js';

// Access environment variables directly since user provided them
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vrysvkupmgsyuomqijnu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Ru8AYrcwHG7CQrttfnPvHg_lTBnQ1l6";

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
