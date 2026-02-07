import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// We define the client as a variable, but don't call createClient 
// if the strings are empty (which happens during the Vercel build phase).
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : ({} as any); // Provide a "fake" object during build to stop the crash

/**
 * Use this function in your API routes.
 * It checks if we are actually connected before doing work.
 */
export const checkSupabaseConn = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false;
  }
  return true;
};