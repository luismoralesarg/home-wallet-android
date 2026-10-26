import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, ErrorBox, Field, PrimaryButton, Segmented } from '@/components/ui';
import { MoneyText } from '@/components/MoneyText';
import { previewStatementDueDate } from '@/lib/cards';
import { formatDate, formatDateTime } from '@/lib/dates';
import { dec, sanitizeAmount, type Currency } from '@/lib/money';
import { pickDateTime } from '@/lib/pickDateTime';
import { colors, radius, spacing } from '@/theme';
import { useCardPurchase, useCards, useDeleteCardPurchase, useUpdateCardPurchase } from '@/features/cards/hooks';
import {
  useCategories,
  useCreateCardPurchase,
  useCreateTransaction,
  useDeleteTransaction,
  useExchangeRate,
  useTransaction,
  useUpdateTransaction,
} from './hooks';

type Kind = 'income' | 'expense';

const isValidAmount = (s: string) => /^\d+(\.\d{1,2})?$/.test(s) && dec(s).gt(0);

/**
 * Alta de movimiento (efectivo/cuenta o tarjeta) y edición/borrado de uno existente.
 * Con `id` edita una transacción; con `id` + `cardId`, una compra con tarjeta.
 */
export function MovementForm({ id, cardId }: { id?: string; cardId?: string }) {
  const editing = !!id;
  const editingPurchase = editing && !!cardId;
  const insets = useSafeAreaInsets();

  const categories = useCategories();
  const cards = useCards();
  const rate = useExchangeRate();
  const existingTx = useTransaction(editingPurchase ? undefined : id);
  const existingPurchase = useCardPurchase(cardId, editingPurchase ? id : undefined);
  const existing = editingPurchase ? existingPurchase : existingTx;

  const [kind, setKind] = useState<Kind>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [payment, setPayment] = useState<'cash' | string>('cash'); // 'cash' o id de tarjeta
  const [installments, setInstallments] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const createTx = useCreateTransaction();
  const createPurchase = useCreateCardPurchase();
  const updatePurchase = useUpdateCardPurchase();
  const deletePurchase = useDeleteCardPurchase();
  const updateTx = useUpdateTransaction(id ?? '');
  const deleteTx = useDeleteTransaction();

  // Edición: cargar los valores una sola vez.
  const hydrated = useRef(false);
  useEffect(() => {
    const t = existing.data;
    if (!editing || !t || hydrated.current) return;
    hydrated.current = true;
    setKind('kind' in t ? t.kind : 'expense');
    setAmount(t.amount);
    setCurrency(t.currency);
    setCategoryId(t.category_id);
    setDescription(t.description);
    setDate(new Date('purchased_at' in t ? t.purchased_at : t.occurred_at));
    if ('installments' in t) setInstallments(String(t.installments));
  }, [editing, existing.data]);

  const kindCategories = useMemo(() => (categories.data ?? []).filter((c) => c.kind === kind), [categories.data, kind]);
  useEffect(() => {
    if (kindCategories.length && !kindCategories.some((c) => c.id === categoryId)) {
      // En edición se espera a tener la categoría original antes de pisarla.
      if (!editing || hydrated.current) setCategoryId(kindCategories[0].id);
    }
  }, [kindCategories, categoryId, editing]);

  const purchaseCardId = editingPurchase ? cardId : payment === 'cash' ? undefined : payment;
  const card = purchaseCardId ? cards.data?.find((c) => c.id === purchaseCardId) : undefined;
  const usingCard = !!card && kind === 'expense' && (!editing || editingPurchase);
  const installmentsNum = Number(installments);
  const installmentsValid = Number.isInteger(installmentsNum) && installmentsNum >= 1 && installmentsNum <= 60;

  const amountValid = isValidAmount(amount);
  const canSave = amountValid && !!categoryId && (!usingCard || installmentsValid);
  const busy =
    createTx.isPending || createPurchase.isPending || updateTx.isPending || deleteTx.isPending || updatePurchase.isPending || deletePurchase.isPending;

  const usdPreview =
    currency === 'USD' && amountValid && rate.data
      ? dec(amount).mul(rate.data.official_sell).toFixed(2)
      : undefined;

  const onPickDate = async () => {
    const picked = await pickDateTime(date);
    if (picked) setDate(picked);
  };

  const done = (message?: string) => {
    if (message) ToastAndroid.show(message, ToastAndroid.LONG);
    router.back();
  };

  const save = async () => {
    setError(null);
    if (!canSave || !categoryId) return;
    const base = { amount: dec(amount).toFixed(2), currency, category_id: categoryId, description: description.trim() };
    try {
      if (editingPurchase && id && cardId) {
        await updatePurchase.mutateAsync({
          cardId,
          id,
          body: { ...base, installments: installmentsNum, purchased_at: date.toISOString() },
        });
        done();
      } else if (editing) {
        await updateTx.mutateAsync({ ...base, occurred_at: date.toISOString() });
        done();
      } else if (usingCard && card) {
        const p = await createPurchase.mutateAsync({
          cardId: card.id,
          body: { ...base, installments: installmentsNum, purchased_at: date.toISOString() },
        });
        done(`Impacta en el resumen que vence el ${formatDate(p.statement_due_date)}`);
      } else {
        await createTx.mutateAsync({ ...base, kind, occurred_at: date.toISOString() });
        done();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert('Borrar movimiento', '¿Seguro? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          const opts = {
            onSuccess: () => done(),
            onError: (e: unknown) => setError(e instanceof Error ? e.message : 'No se pudo borrar'),
          };
          if (editingPurchase && cardId) deletePurchase.mutate({ cardId, id }, opts);
          else deleteTx.mutate(id, opts);
        },
      },
    ]);
  };

  const title = editing ? 'Editar movimiento' : kind === 'expense' ? 'Cargar gasto' : 'Cargar ingreso';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled">
        {editing && existing.isError && <ErrorBox message="No se pudo cargar el movimiento" onRetry={() => void existing.refetch()} />}

        <Segmented
          disabled={editing}
          value={kind}
          onChange={(k) => {
            setKind(k);
            if (k === 'income') setPayment('cash');
          }}
          options={[
            { value: 'expense', label: 'Gasto' },
            { value: 'income', label: 'Ingreso' },
          ]}
        />

        <Field label="Monto">
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={amount}
              onChangeText={(t) => setAmount(sanitizeAmount(t))}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              autoFocus={!editing}
            />
            <View style={{ width: 130 }}>
              <Segmented
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: 'ARS', label: 'ARS' },
                  { value: 'USD', label: 'USD' },
                ]}
              />
            </View>
          </View>
          {usdPreview !== undefined && <MoneyText amount={dec(amount).toFixed(2)} currency="USD" amountArs={usdPreview} style={styles.previewMain} />}
          {currency === 'USD' && rate.data && <Text style={styles.hint}>Cotización de hoy: venta {rate.data.official_sell}</Text>}
          {currency === 'USD' && rate.isError && <Text style={styles.hint}>No se pudo traer la cotización; igual se calcula al guardar.</Text>}
        </Field>

        <Field label="Categoría">
          {categories.isError ? (
            <ErrorBox message="No se pudieron cargar las categorías" onRetry={() => categories.refetch()} />
          ) : (
            <View style={styles.wrap}>
              {kindCategories.map((c) => (
                <Chip key={c.id} label={c.name} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
              ))}
            </View>
          )}
        </Field>

        <Field label="Descripción">
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Opcional"
            placeholderTextColor={colors.textMuted}
          />
        </Field>

        <Field label="Fecha y hora">
          <TouchableOpacity style={styles.input} onPress={onPickDate}>
            <Text style={styles.inputText}>{formatDateTime(date)}</Text>
          </TouchableOpacity>
        </Field>

        {kind === 'expense' && !editing && (cards.data?.length ?? 0) > 0 && (
          <Field label="Medio de pago">
            <View style={styles.wrap}>
              <Chip label="Efectivo/cuenta" selected={payment === 'cash'} onPress={() => setPayment('cash')} />
              {cards.data!.map((c) => (
                <Chip key={c.id} label={c.last4 ? `${c.name} ••${c.last4}` : c.name} selected={payment === c.id} onPress={() => setPayment(c.id)} />
              ))}
            </View>
          </Field>
        )}

        {usingCard && card && (
          <View style={styles.cardBox}>
            <Field label="Cuotas">
              <TextInput
                style={styles.input}
                value={installments}
                onChangeText={(t) => setInstallments(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </Field>
            <Text style={styles.notice}>
              Impacta en el resumen que vence el {formatDate(previewStatementDueDate(date, card.closing_day, card.due_day))}. No cambia lo que podés gastar hoy.
            </Text>
          </View>
        )}

        {editing && (
          <Text style={styles.hint}>
            {editingPurchase
              ? 'Cambiar monto, cuotas o fecha recalcula los resúmenes de la tarjeta.'
              : 'El tipo de movimiento no se puede cambiar.'}
          </Text>
        )}

        {error && <ErrorBox message={error} />}

        <PrimaryButton label={editing ? 'Guardar cambios' : 'Guardar'} onPress={save} loading={busy} disabled={!canSave || (editing && !existing.data)} />
        {editing && <PrimaryButton label="Borrar" variant="danger" onPress={confirmDelete} disabled={busy} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
  close: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  content: { padding: spacing.lg, gap: spacing.lg },
  amountRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: { fontSize: 16, color: colors.text },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '800' },
  previewMain: { fontSize: 14 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { color: colors.textMuted, fontSize: 12 },
  cardBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  notice: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
