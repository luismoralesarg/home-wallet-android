import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyScreen } from '@/components/EmptyScreen';
import { PrimaryButton } from '@/components/ui';
import { spacing, TAB_BAR_HEIGHT } from '@/theme';

export default function InicioScreen() {
  return (
    <View style={{ flex: 1 }}>
      <EmptyScreen title="Inicio" />
      <View style={styles.cta}>
        <PrimaryButton label="Tarjetas" variant="light" onPress={() => router.push('/tarjetas')} />
        <PrimaryButton label="Cargar gasto" onPress={() => router.push('/cargar')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: TAB_BAR_HEIGHT + 32, gap: spacing.sm },
});
