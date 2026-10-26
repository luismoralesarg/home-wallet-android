// Basado en el diseño de referencia: cabecera negra, acento amarillo-lima,
// cards redondeadas, tab bar flotante negra, botón principal negro.
export const colors = {
  black: '#0B0B0B',
  white: '#FFFFFF',
  background: '#F3F3EF',
  card: '#FFFFFF',
  accent: '#D6F23C',
  text: '#0B0B0B',
  textMuted: '#8A8A85',
  border: '#E4E4DE',
  success: '#1F9D55',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
} as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const font = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '600' as const },
  bold: { fontWeight: '800' as const },
};

export const TAB_BAR_HEIGHT = 64;
