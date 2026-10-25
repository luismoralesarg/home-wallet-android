# CLAUDE.md

Cliente móvil de una app Android de finanzas personales para dos usuarios (Luis y su esposa).
Stack: React Native + Expo + TypeScript, expo-router, TanStack Query. Solo Android.
El backend (Go) está en el repo `home-wallet-api`, clonado como `../home-wallet-api`.

## Reglas

- La API la define `../home-wallet-api/openapi.yaml`. Los tipos y el cliente se generan desde ahí (`npm run api:types` → `src/api/schema.d.ts`, con openapi-typescript + openapi-fetch). **Nunca escribir tipos de API a mano.** Si cambia la spec, regenerar y commitear `schema.d.ts`.
- **Dinero:** siempre string decimal, nunca float. Usar `decimal.js` (`src/lib/money.ts`) para cualquier cuenta.
- **Monedas:** ARS y USD. Todo monto se muestra con `MoneyText` (en USD, el equivalente en ARS va debajo, en gris).
- **Zona horaria:** America/Argentina/Mendoza.
- Las compras con tarjeta no afectan el indicador diario: impactan cuando vence el resumen. La app lo comunica así en el formulario de carga.
- **Diseño:** `docs/design-reference.png` (fondo negro en cabecera, acento amarillo-lima, cards redondeadas, tab bar flotante negra, botón principal negro). Tokens en `src/theme`.
- **Sesión:** JWT en `expo-secure-store`; un 401 (salvo en `/auth/login`) vuelve al login.
- Rutas en `src/app/` (expo-router); el resto del código fuera de esa carpeta. Alias `@/` → `src/`.
- Instalar módulos de Expo con la versión de `node_modules/expo/bundledNativeModules.json` (`npx expo install` necesita `api.expo.dev`).

## Comandos

- `npm run api:types`: regenera los tipos desde la spec.
- `npm run typecheck`: `tsc --noEmit`.
- `npx expo start --android`: correr la app.
