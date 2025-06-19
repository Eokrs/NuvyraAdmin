
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Using anon key for server actions as well, service_role for admin tasks if needed.
                                               // For this app, anon key is fine if RLS is set up correctly or if operations are simple.
                                               // If row-level security is not fully covering admin actions, use SUPABASE_SERVICE_ROLE_KEY.
                                               // However, for user-facing app with admin panel, it is often preferred to use anon key + RLS
                                               // or a dedicated admin role with specific permissions.
                                               // For simplicity and as per user instruction "Supabase API or SDK", anon key is used.
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was calledfrom a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
