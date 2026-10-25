import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from './schema';
import { getToken } from '@/auth/session';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

const auth: Middleware = {
  async onRequest({ request }) {
    const token = getToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
  async onResponse({ request, response }) {
    // Un 401 en /auth/login es "credenciales inválidas", no sesión vencida.
    if (response.status === 401 && !new URL(request.url).pathname.endsWith('/auth/login')) {
      unauthorizedHandler?.();
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl });
api.use(auth);
