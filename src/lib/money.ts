import Decimal from 'decimal.js';

import type { components } from '@/api/schema';

export type Currency = components['schemas']['Currency'];

// Todas las cuentas de dinero pasan por Decimal; nunca por number.
export const dec = (value: string | number) => new Decimal(value);

const ARS = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: string, currency: Currency = 'ARS'): string {
  const d = dec(amount);
  const body = ARS.format(Number(d.abs().toFixed(2)));
  const sign = d.isNegative() && !d.isZero() ? '-' : '';
  return currency === 'USD' ? `${sign}US$ ${body}` : `${sign}$ ${body}`;
}

/** Limpia un monto tipeado: acepta coma, máximo 2 decimales y (opcional) un "-" inicial. */
export function sanitizeAmount(text: string, allowNegative = false): string {
  const negative = allowNegative && text.trimStart().startsWith('-');
  const t = text.replace(',', '.').replace(/[^0-9.]/g, '');
  const [int, ...rest] = t.split('.');
  const body = rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int;
  return negative ? `-${body}` : body;
}
