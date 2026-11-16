import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { MoneyText } from '@/components/MoneyText';
import { Section } from '@/components/Section';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { CardCarousel } from '@/features/cards/CardCarousel';
import { useCards } from '@/features/cards/hooks';
import { DailyHero } from '@/features/dashboard/DailyHero';
import { useDaily, useUpcomingPayments } from '@/features/dashboard/hooks';
import { UpcomingRow } from '@/features/dashboard/UpcomingRow';
import { useLoans } from '@/features/loans/hooks';
import { useSubscriptions } from '@/features/subscriptions/hooks';
import { formatShortDate, monthLabel, todayIso } from '@/lib/dates';
import { colors, radius, spacing, TAB_BAR_HEIGHT } from '@/theme';

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function InicioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const daily = useDaily();
  const cards = useCards();
  const upcoming = useUpcomingPayments(4);
  const loans = useLoans();
  const subs = useSubscriptions();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([daily.refetch(), cards.refetch(), upcoming.refetch(), loans.refetch(), subs.refetch()]);
    setRefreshing(false);
  }, [daily, cards, upcoming, loans, subs]);

  const today = todayIso();
  const activeSubs = subs.data?.items.filter((s) => s.active) ?? [];
  const nextSub = [...activeSubs].sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date))[0];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.greeting}>Bienvenido, {capitalize(user?.username ?? '')}</Text>
          {daily.isLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.xl }} />
          ) : daily.isError || !daily.data ? (
            <ErrorBox message={daily.error instanceof Error ? daily.error.message : 'No se pudo calcular cuánto podés gastar hoy'} onRetry={() => void daily.refetch()} />
          ) : (
            <DailyHero daily={daily.data} />
          )}
        </View>

        <View style={styles.body}>
          <Section title="Tarjetas" action={{ label: 'Ver todas', onPress: () => router.push('/tarjetas') }}>
            {cards.isLoading ? (
              <ActivityIndicator color={colors.black} />
            ) : cards.isError || !cards.data ? (
              <View style={{ paddingHorizontal: spacing.lg }}>
                <ErrorBox message="No se pudieron cargar las tarjetas" onRetry={() => void cards.refetch()} />
              </View>
            ) : (
              <View style={{ marginHorizontal: -spacing.lg }}>
                <CardCarousel cards={cards.data} />
              </View>
            )}
          </Section>

          <Section title="Próximos pagos" action={{ label: 'Ver todo', onPress: () => router.push('/proximos-pagos') }}>
            {upcoming.isLoading ? (
              <ActivityIndicator color={colors.black} />
            ) : upcoming.isError || !upcoming.data ? (
              <ErrorBox message="No se pudieron cargar los próximos pagos" onRetry={() => void upcoming.refetch()} />
            ) : upcoming.data.length === 0 ? (
              <Text style={styles.empty}>No tenés pagos pendientes en los próximos días.</Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {upcoming.data.map((p) => (
                  <UpcomingRow key={`${p.type}-${p.ref_id}-${p.month ?? ''}-${p.date}`} p={p} today={today} />
                ))}
              </View>
            )}
          </Section>

          <Section title="Préstamos y suscripciones">
            {loans.isLoading || subs.isLoading ? (
              <ActivityIndicator color={colors.black} />
            ) : loans.isError || subs.isError ? (
              <ErrorBox
                message="No se pudieron cargar los préstamos y suscripciones"
                onRetry={() => {
                  void loans.refetch();
                  void subs.refetch();
                }}
              />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {(loans.data ?? []).map((l) => (
                  <View key={l.id} style={styles.tile}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.tileTitle}>{l.name}</Text>
                      <Text style={styles.tileMeta}>
                        {l.kind === 'vehicle' ? 'Vehículo · ' : ''}
                        {l.remaining_installments} {l.remaining_installments === 1 ? 'cuota restante' : 'cuotas restantes'} · hasta {monthLabel(l.end_month)}
                      </Text>
                    </View>
                    {l.current_installment ? (
                      <MoneyText align="right" amount={l.current_installment.amount} currency={l.currency} amountArs={l.current_installment.amount_ars} />
                    ) : (
                      <Text style={styles.tileMeta}>Sin cuota este mes</Text>
                    )}
                  </View>
                ))}
                <View style={styles.tile}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.tileTitle}>Suscripciones</Text>
                    <Text style={styles.tileMeta}>
                      {activeSubs.length} {activeSubs.length === 1 ? 'activa' : 'activas'}
                      {nextSub ? ` · próximo cobro ${formatShortDate(nextSub.next_charge_date)} (${nextSub.name})` : ''}
                    </Text>
                  </View>
                  <MoneyText align="right" amount={subs.data?.monthly_total_ars ?? '0.00'} />
                </View>
                {(loans.data ?? []).length === 0 && <Text style={styles.empty}>Todavía no cargaste préstamos.</Text>}
              </View>
            )}
          </Section>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <PrimaryButton label="Cargar gasto" onPress={() => router.push('/cargar')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.black, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, gap: spacing.md },
  greeting: { color: colors.white, fontSize: 20, fontWeight: '800' },
  body: { padding: spacing.lg, gap: spacing.lg },
  empty: { color: colors.textMuted, fontSize: 13 },
  tile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  tileTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  tileMeta: { fontSize: 12, color: colors.textMuted },
  cta: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: TAB_BAR_HEIGHT + 32 },
});
