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
