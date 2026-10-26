import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/unwrap';
import { ErrorBox, Field, PrimaryButton } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { useCard, useCreateCard, useDeleteCard, useUpdateCard } from './hooks';

const digits = (t: string) => t.replace(/[^0-9]/g, '');
const validDay = (s: string) => /^\d{1,2}$/.test(s) && Number(s) >= 1 && Number(s) <= 31;

/** Alta y edición de tarjeta. */
export function CardForm({ id }: { id?: string }) {
  const editing = !!id;
  const insets = useSafeAreaInsets();
  const existing = useCard(id);
  const create = useCreateCard();
  const update = useUpdateCard(id ?? '');
  const remove = useDeleteCard();

  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hydrated = useRef(false);
  useEffect(() => {
    const c = existing.data;
    if (!editing || !c || hydrated.current) return;
    hydrated.current = true;
    setName(c.name);
    setLast4(c.last4);
    setClosingDay(String(c.closing_day));
    setDueDay(String(c.due_day));
  }, [editing, existing.data]);

  const canSave = name.trim().length > 0 && (last4 === '' || last4.length === 4) && validDay(closingDay) && validDay(dueDay);
  const busy = create.isPending || update.isPending || remove.isPending;

  const save = async () => {
    setError(null);
    const body = { name: name.trim(), last4, closing_day: Number(closingDay), due_day: Number(dueDay) };
    try {
      if (editing) await update.mutateAsync(body);
      else await create.mutateAsync(body);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert('Borrar tarjeta', '¿Seguro? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () =>
          remove.mutate(id, {
            // Con compras cargadas el backend responde 409.
            onSuccess: () => router.dismissTo('/tarjetas'),
            onError: (e) =>
              setError(
                e instanceof ApiError && e.code === 'conflict'
                  ? 'Esta tarjeta tiene compras. Borralas primero para poder borrar la tarjeta.'
                  : e instanceof Error
                    ? e.message
                    : 'No se pudo borrar',
              ),
          }),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>{editing ? 'Editar tarjeta' : 'Nueva tarjeta'}</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled">
        {editing && existing.isError && <ErrorBox message="No se pudo cargar la tarjeta" onRetry={() => void existing.refetch()} />}

        <Field label="Nombre">
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Visa Galicia" placeholderTextColor={colors.textMuted} autoFocus={!editing} />
        </Field>
        <Field label="Últimos 4 dígitos">
          <TextInput
            style={styles.input}
            value={last4}
            onChangeText={(t) => setLast4(digits(t).slice(0, 4))}
            placeholder="Opcional"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </Field>
        <View style={styles.days}>
          <View style={{ flex: 1 }}>
            <Field label="Día de cierre">
              <TextInput style={styles.input} value={closingDay} onChangeText={(t) => setClosingDay(digits(t).slice(0, 2))} placeholder="1-31" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Día de vencimiento">
              <TextInput style={styles.input} value={dueDay} onChangeText={(t) => setDueDay(digits(t).slice(0, 2))} placeholder="1-31" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
            </Field>
          </View>
        </View>
        <Text style={styles.hint}>
          Las compras hasta el día de cierre (inclusive) van al resumen de ese mes; las posteriores, al siguiente. El resumen vence el primer día de vencimiento posterior al cierre.
          {editing ? ' Si cambiás estos días, aplican a las compras nuevas; los resúmenes ya generados conservan sus fechas.' : ''}
        </Text>

        {error && <ErrorBox message={error} />}

        <PrimaryButton label={editing ? 'Guardar cambios' : 'Crear tarjeta'} onPress={save} loading={busy} disabled={!canSave || (editing && !existing.data)} />
        {editing && <PrimaryButton label="Borrar tarjeta" variant="danger" onPress={confirmDelete} disabled={busy} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.black, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
  close: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  content: { padding: spacing.lg, gap: spacing.lg },
  input: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  days: { flexDirection: 'row', gap: spacing.md },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
});
