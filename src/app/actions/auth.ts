'use server';

import { cookies } from 'next/headers';

export async function loginUser(credentials: { login: string; password: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store any necessary data in cookies if needed
    const cookieStore = cookies();
    cookieStore.set('user_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
