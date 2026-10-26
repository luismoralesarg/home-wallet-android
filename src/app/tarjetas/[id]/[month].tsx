import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { usePayStatement, useSetAdjustment, useStatement, type StatementDetail } from '@/features/cards/hooks';
import { formatDate, formatDateTime, monthLabel } from '@/lib/dates';
import { dec, sanitizeAmount } from '@/lib/money';
import { colors, radius, spacing } from '@/theme';

const validAdjustment = (s: string) => /^-?\d+(\.\d{1,2})?$/.test(s);

function AdjustmentBox({ cardId, month, current }: { cardId: string; month: string; current: string }) {
  const save = useSetAdjustment(cardId, month);
  const [text, setText] = useState(current);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setText(current), [current]);

  const unchanged = validAdjustment(text) && dec(text).eq(dec(current));
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>Saldo previo</Text>
      <Text style={styles.hint}>
        Si ya tenías deuda en esta tarjeta antes de empezar a usar la app, cargá acá lo que arrastraba este resumen. Se suma al total.
        Con un valor negativo registrás un saldo a favor.
      </Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(t) => setText(sanitizeAmount(t, true))}
        keyboardType="numbers-and-punctuation"
        placeholder="0.00"
        placeholderTextColor={colors.textMuted}
      />
      {error && <ErrorBox message={error} />}
      <PrimaryButton
        label="Guardar saldo previo"
        loading={save.isPending}
        disabled={!validAdjustment(text) || unchanged}
        onPress={() => {
          setError(null);
          save.mutate(dec(text).toFixed(2), { onError: (e) => setError(e instanceof Error ? e.message : 'No se pudo guardar') });
        }}
      />
    </View>
  );
}

function Detail({ cardId, month, s, onRefresh, refreshing }: { cardId: string; month: string; s: StatementDetail; onRefresh: () => void; refreshing: boolean }) {
  const pay = usePayStatement(cardId, month);
  const [error, setError] = useState<string | null>(null);

  const confirmPay = () =>
    Alert.alert('Marcar como pagado', `¿Pagaste el resumen de ${monthLabel(month)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, pagado', onPress: () => pay.mutate(undefined, { onError: (e) => setError(e instanceof Error ? e.message : 'No se pudo marcar como pagado') }) },
    ]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total a pagar</Text>
        <MoneyText amount={s.total_ars} style={styles.totalAmount} />
        <Text style={styles.totalMeta}>
          Cierra {formatDate(s.closing_date)} · vence {formatDate(s.due_date)}
        </Text>
        <View style={styles.breakdown}>
          <Text style={styles.breakdownText}>Cuotas</Text>
          <MoneyText amount={s.installments_total_ars} style={styles.breakdownAmount} />
        </View>
        <View style={styles.breakdown}>
          <Text style={styles.breakdownText}>Saldo previo</Text>
          <MoneyText amount={s.adjustment_ars} style={styles.breakdownAmount} />
        </View>
      </View>

      {s.paid ? (
        <View style={styles.paidBox}>
          <Text style={styles.paidText}>Pagado{s.paid_at ? ` el ${formatDateTime(s.paid_at)}` : ''}</Text>
        </View>
      ) : (
        <>
          {error && <ErrorBox message={error} />}
          <PrimaryButton label="Marcar como pagado" onPress={confirmPay} loading={pay.isPending} />
        </>
      )}

      <Text style={styles.sectionLabel}>Compras y cuotas</Text>
      {s.items.length === 0 ? (
        <Text style={styles.empty}>Este resumen no tiene compras.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {s.items.map((it) => (
            <TouchableOpacity
              key={`${it.purchase_id}-${it.installment_number}`}
              style={styles.item}
              onPress={() => router.push({ pathname: '/cargar', params: { id: it.purchase_id, cardId } })}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {it.description || 'Compra con tarjeta'}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {it.installments > 1 ? `Cuota ${it.installment_number}/${it.installments} · ` : ''}
                  {it.created_by.name} · {formatDateTime(it.purchased_at)}
                </Text>
              </View>
              {/* El monto de la cuota ya está en ARS; si la compra fue en USD, la cotización se fijó al comprar. */}
              <MoneyText align="right" amount={it.amount_ars} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <AdjustmentBox cardId={cardId} month={month} current={s.adjustment_ars} />
    </ScrollView>
  );
}

export default function StatementScreen() {
  const { id, month } = useLocalSearchParams<{ id: string; month: string }>();
  const st = useStatement(id, month);
  const data = st.data;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScreenHeader title={`Resumen de ${monthLabel(month)}`} />
      {st.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.black} />
      ) : st.isError || !data ? (
        <View style={{ padding: spacing.lg }}>
          <ErrorBox message={st.error instanceof Error ? st.error.message : 'No se pudo cargar el resumen'} onRetry={() => void st.refetch()} />
        </View>
      ) : (
        <Detail cardId={id} month={month} s={data} onRefresh={() => void st.refetch()} refreshing={st.isRefetching} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  total: { backgroundColor: colors.black, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  totalLabel: { color: colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  totalAmount: { color: colors.white, fontSize: 30, fontWeight: '800' },
  totalMeta: { color: colors.white, opacity: 0.7, fontSize: 12, marginBottom: spacing.sm },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownText: { color: colors.white, opacity: 0.8, fontSize: 13 },
  breakdownAmount: { color: colors.white, fontSize: 14 },
  paidBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1.5, borderColor: colors.success },
  paidText: { color: colors.success, fontWeight: '800', textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  empty: { color: colors.textMuted },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  itemTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted },
  box: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  boxTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  input: { backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: colors.text, borderWidth: 1, borderColor: colors.border },
});
