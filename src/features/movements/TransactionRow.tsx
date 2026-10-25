import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { formatDateTime } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';
import type { Transaction } from './hooks';

export function TransactionRow({ tx, categoryName, onPress }: { tx: Transaction; categoryName?: string; onPress: () => void }) {
  const isIncome = tx.kind === 'income';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.description || categoryName || (isIncome ? 'Ingreso' : 'Gasto')}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[categoryName, tx.created_by.name, formatDateTime(tx.occurred_at)].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <MoneyText
        align="right"
        amount={tx.amount}
        currency={tx.currency}
        amountArs={tx.amount_ars}
        style={isIncome ? { color: colors.success } : undefined}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  left: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
});
