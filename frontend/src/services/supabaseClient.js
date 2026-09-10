import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eizzzlnlcdfuylnojijn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Frontend Supabase initialization notice:', err.message);
  }
}

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
export default supabase;
