import { useLocalSearchParams } from 'expo-router';

import { CardForm } from '@/features/cards/CardForm';

// /tarjetas/formulario → alta; /tarjetas/formulario?id=<uuid> → edición.
export default function CardFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <CardForm id={id} />;
}
