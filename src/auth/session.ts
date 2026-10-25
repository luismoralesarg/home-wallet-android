import * as SecureStore from 'expo-secure-store';

import type { components } from '@/api/schema';

type User = components['schemas']['User'];

const TOKEN_KEY = 'hw.token';
const USER_KEY = 'hw.user';

let memoryToken: string | null = null;

export const getToken = () => memoryToken;

export async function loadSession(): Promise<{ token: string; user: User } | null> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !rawUser) return null;
  memoryToken = token;
  return { token, user: JSON.parse(rawUser) as User };
}

export async function saveSession(token: string, user: User) {
  memoryToken = token;
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearSession() {
  memoryToken = null;
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
