import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lqoychozoysmxibhcmuf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3ljaG96b3lzbXhpYmhjbXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTc1OTksImV4cCI6MjEwNTI5MzU5OX0.tcdf86elJblU81Y9HvPfImKfsZJxCSDYYoU0kC_O6xk';

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
