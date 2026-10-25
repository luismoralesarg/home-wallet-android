import { mendozaParts } from './dates';

const pad = (n: number) => String(n).padStart(2, '0');
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate(); // month: 1-12

/** Día de cierre/vencimiento ajustado a meses cortos (cierre el 31 → 28/29/30). */
function clampDay(year: number, month: number, day: number) {
  return Math.min(day, daysIn(year, month));
}

function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/**
 * Vencimiento (YYYY-MM-DD) del resumen en el que cae la primera cuota de una compra.
 * Es una vista previa para el formulario; el valor definitivo lo calcula el backend
 * (`statement_due_date` en la respuesta de POST /cards/{id}/purchases).
 *
 * - Compra hasta el día de cierre inclusive → resumen que cierra ese mes; después → el mes siguiente.
 * - Vence el primer `dueDay` posterior al cierre.
 */
export function previewStatementDueDate(purchasedAt: Date, closingDay: number, dueDay: number): string {
  const p = mendozaParts(purchasedAt);
  let close = { year: p.year, month: p.month };
  if (p.day > clampDay(p.year, p.month, closingDay)) close = nextMonth(close.year, close.month);

  const closeDay = clampDay(close.year, close.month, closingDay);
  // Primer dueDay estrictamente posterior al cierre: este mes si el día de vencimiento es mayor al de cierre, si no el siguiente.
  let due = { year: close.year, month: close.month };
  if (clampDay(due.year, due.month, dueDay) <= closeDay) due = nextMonth(due.year, due.month);
  return `${due.year}-${pad(due.month)}-${pad(clampDay(due.year, due.month, dueDay))}`;
}
