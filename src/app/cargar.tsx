import { useLocalSearchParams } from 'expo-router';

import { MovementForm } from '@/features/movements/MovementForm';

// /cargar → alta; /cargar?id=<uuid> → edición.
export default function CargarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <MovementForm id={id} />;
}
