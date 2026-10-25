import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors, radius, TAB_BAR_HEIGHT } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName, focused: IconName) =>
  ({ color, focused: f }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={f ? focused : name} size={22} color={color as string} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#9A9A95',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        // Tab bar flotante negra.
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderRadius: radius.lg,
          backgroundColor: colors.black,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="movimientos" options={{ title: 'Movimientos', tabBarIcon: icon('swap-vertical-outline', 'swap-vertical') }} />
      <Tabs.Screen name="metricas" options={{ title: 'Métricas', tabBarIcon: icon('pie-chart-outline', 'pie-chart') }} />
    </Tabs>
  );
}
