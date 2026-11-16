import { StyleSheet, Text, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { formatShortDate } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';
import type { UpcomingPayment } from './hooks';

const LABELS: Record<UpcomingPayment['type'], string> = {
  card_statement: 'Tarjeta',
  loan: 'Préstamo',
  vehicle: 'Vehículo',
  subscription: 'Suscripción',
};

/** Una línea de "Próximos pagos". `today` es YYYY-MM-DD en hora Mendoza, para marcar lo vencido. */
export function UpcomingRow({ p, today }: { p: UpcomingPayment; today: string }) {
  const overdue = p.date < today;
  return (
    <View style={styles.row}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{LABELS[p.type]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={[styles.date, overdue && styles.overdue]}>{overdue ? `Vencido el ${formatShortDate(p.date)}` : `Vence el ${formatShortDate(p.date)}`}</Text>
      </View>
      <MoneyText align="right" amount={p.amount_ars} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  tag: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, minWidth: 78, alignItems: 'center' },
  tagText: { fontSize: 11, fontWeight: '700', color: colors.text },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted },
  overdue: { color: colors.danger, fontWeight: '700' },
});
