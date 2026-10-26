import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

/** Abre el selector de fecha y después el de hora (Android). Devuelve null si se cancela. */
export function pickDateTime(initial: Date): Promise<Date | null> {
  return new Promise((resolve) => {
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      maximumDate: new Date(Date.now() + 366 * 86400_000),
      onValueChange: (_e, date) => {
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: true,
          onValueChange: (_e2, picked) => resolve(picked),
          onDismiss: () => resolve(null),
        });
      },
      onDismiss: () => resolve(null),
    });
  });
}
