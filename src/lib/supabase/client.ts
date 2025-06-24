
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Anon Key. Check your .env file and environment variables.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
