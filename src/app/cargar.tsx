import { useLocalSearchParams } from 'expo-router';

import { MovementForm } from '@/features/movements/MovementForm';

// /cargar → alta; /cargar?id=<uuid> → edición de una transacción;
// /cargar?id=<uuid>&cardId=<uuid> → edición de una compra con tarjeta.
export default function CargarScreen() {
  const { id, cardId } = useLocalSearchParams<{ id?: string; cardId?: string }>();
  return <MovementForm id={id} cardId={cardId} />;
}
