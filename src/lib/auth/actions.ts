
"use server";

import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'firebaseAuthToken';

export async function setAuthCookie(token: string) {
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function deleteAuthCookie() {
  cookies().delete(AUTH_COOKIE_NAME);
}

export async function getAuthCookie() {
  return cookies().get(AUTH_COOKIE_NAME)?.value;
}
