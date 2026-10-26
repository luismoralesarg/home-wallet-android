import { Stack } from 'expo-router';

export default function TarjetasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="formulario" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
