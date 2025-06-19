
"use server";

// Supabase SSR library handles cookie management automatically
// when using createServerClient and createBrowserClient.
// These custom cookie actions are no longer needed for Firebase tokens.
// This file can be removed if no other auth-related server actions are added.

export async function setAuthCookie(token: string) {
  // No longer needed for Supabase, session handled by @supabase/ssr
  console.warn("setAuthCookie called, but it's deprecated with Supabase auth.");
}

export async function deleteAuthCookie() {
  // No longer needed for Supabase, session handled by @supabase/ssr
  console.warn("deleteAuthCookie called, but it's deprecated with Supabase auth.");
}

export async function getAuthCookie() {
  // No longer needed for Supabase, session handled by @supabase/ssr
  console.warn("getAuthCookie called, but it's deprecated with Supabase auth.");
  return null;
}
