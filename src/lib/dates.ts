// Mendoza es UTC-3 todo el año (Argentina no tiene horario de verano), así que
// alcanza con un offset fijo y no depende de Intl ni de la zona del celular.
const OFFSET_MS = -3 * 3600_000;

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export type DateParts = { year: number; month: number; day: number; hour: number; minute: number };

/** Componentes de calendario de un instante, en hora Mendoza (month: 1-12). */
export function mendozaParts(d: Date): DateParts {
  const s = new Date(d.getTime() + OFFSET_MS);
  return { year: s.getUTCFullYear(), month: s.getUTCMonth() + 1, day: s.getUTCDate(), hour: s.getUTCHours(), minute: s.getUTCMinutes() };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Mes (YYYY-MM) de un instante, en hora Mendoza. */
export function monthOf(d: Date): string {
  const p = mendozaParts(d);
  return `${p.year}-${pad(p.month)}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "25/10 19:25" */
export function formatDateTime(iso: string | Date): string {
  const p = mendozaParts(typeof iso === 'string' ? new Date(iso) : iso);
  return `${pad(p.day)}/${pad(p.month)} ${pad(p.hour)}:${pad(p.minute)}`;
}

/** "25/10/2026" desde una fecha ISO (YYYY-MM-DD) tal cual, sin pasar por zonas horarias. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}
