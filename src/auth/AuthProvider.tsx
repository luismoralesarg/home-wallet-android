import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, setUnauthorizedHandler } from '@/api/client';
import type { components } from '@/api/schema';
import { clearSession, loadSession, saveSession } from './session';

type User = components['schemas']['User'];

type AuthState = {
  loading: boolean;
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async () => {
    await clearSession();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  useEffect(() => {
    loadSession()
      .then((s) => setUser(s?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (username: string, password: string) => {
    const { data, error } = await api.POST('/auth/login', { body: { username, password } });
    if (error || !data) throw new Error(error?.message ?? 'No se pudo iniciar sesión');
    await saveSession(data.token, data.user);
    setUser(data.user);
  }, []);

  const value = useMemo(() => ({ loading, user, signIn, signOut }), [loading, user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
