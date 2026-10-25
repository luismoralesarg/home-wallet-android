# home-wallet-android

App Android (React Native + Expo + TypeScript) de finanzas del hogar. Backend: [home-wallet-api](https://github.com/luismoralesarg/home-wallet-api).

Ver `CLAUDE.md` para reglas y convenciones.

## Setup

```sh
npm install
cp .env.example .env          # EXPO_PUBLIC_API_URL
npm run api:types             # requiere ../home-wallet-api clonado al lado
npx expo start --android
```

Falta agregar la imagen del diseño en `docs/design-reference.png`.
