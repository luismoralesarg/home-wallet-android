import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { formatShortDate, monthLabel } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';
import type { StatementSummary } from './hooks';

/** Una línea de resumen: mes de cierre, fechas y total. */
export function StatementRow({ s, highlight, onPress }: { s: StatementSummary; highlight?: 'due'; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.row, highlight === 'due' && styles.rowDue]} onPress={onPress}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>Resumen de {monthLabel(s.month)}</Text>
        <Text style={styles.meta}>
          Cierra {formatShortDate(s.closing_date)} · vence {formatShortDate(s.due_date)}
        </Text>
        {s.paid && (
          <View style={styles.paid}>
            <Text style={styles.paidText}>Pagado</Text>
          </View>
        )}
      </View>
      <MoneyText align="right" amount={s.total_ars} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  rowDue: { borderWidth: 1.5, borderColor: colors.danger },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  meta: { fontSize: 12, color: colors.textMuted },
  paid: { alignSelf: 'flex-start', backgroundColor: colors.black, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  paidText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
});
