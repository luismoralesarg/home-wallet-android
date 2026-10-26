import type { CardPurchase } from '@/features/cards/hooks';
import type { Currency } from '@/lib/money';
import type { Transaction } from './hooks';

/** Fila de la lista de Movimientos: una transacción o una compra con tarjeta. */
export type MovementItem = {
  key: string;
  id: string;
  kind: 'income' | 'expense';
  amount: string;
  currency: Currency;
  amountArs: string;
  description: string;
  categoryId: string;
  createdBy: { id: string; name: string };
  date: string; // ISO
  card?: { id: string; installments: number };
};

export const fromTransaction = (t: Transaction): MovementItem => ({
  key: `tx-${t.id}`,
  id: t.id,
  kind: t.kind,
  amount: t.amount,
  currency: t.currency,
  amountArs: t.amount_ars,
  description: t.description,
  categoryId: t.category_id,
  createdBy: t.created_by,
  date: t.occurred_at,
});

export const fromCardPurchase = (p: CardPurchase): MovementItem => ({
  key: `card-${p.id}`,
  id: p.id,
  kind: 'expense',
  amount: p.amount,
  currency: p.currency,
  amountArs: p.amount_ars,
  description: p.description,
  categoryId: p.category_id,
  createdBy: p.created_by,
  date: p.purchased_at,
  card: { id: p.card_id, installments: p.installments },
});

/**
 * Mezcla dos listas paginadas y ordenadas de más nueva a más vieja.
 * Una fuente que todavía tiene páginas puede traer ítems más viejos que su último cargado,
 * así que solo se muestra lo que es al menos tan nuevo como el último ítem de esas fuentes.
 */
export function mergeStreams(streams: { items: MovementItem[]; hasMore: boolean }[]): MovementItem[] {
  const time = (i: MovementItem) => new Date(i.date).getTime();
  const all = streams.flatMap((s) => s.items).sort((a, b) => time(b) - time(a));
  const cutoffs = streams.filter((s) => s.hasMore && s.items.length).map((s) => time(s.items[s.items.length - 1]));
  if (!cutoffs.length) return all;
  const cutoff = Math.max(...cutoffs);
  return all.filter((i) => time(i) >= cutoff);
}
