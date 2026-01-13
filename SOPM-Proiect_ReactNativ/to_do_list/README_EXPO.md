# To Do List - Expo Go

Aplicație React Native pentru gestionarea task-urilor cu autentificare Firebase, configurată pentru Expo Go.

## Instalare

1. Instalează dependențele:
```bash
npm install
```

2. Instalează Expo CLI global (opțional):
```bash
npm install -g expo-cli
```

## Rulare cu Expo Go

1. Instalează aplicația **Expo Go** pe telefonul tău:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Pornește serverul de dezvoltare:
```bash
npm start
```

3. Scanează codul QR:
   - **Android**: Deschide Expo Go și scanează codul QR din terminal
   - **iOS**: Deschide Camera app și scanează codul QR, apoi apasă pe notificare

## Comenzi Disponibile

- `npm start` - Pornește serverul Expo
- `npm run android` - Deschide pe Android (necesită emulator)
- `npm run ios` - Deschide pe iOS (doar macOS, necesită Xcode)
- `npm run web` - Deschide în browser

## Configurare Firebase

Configurația Firebase este deja setată în `src/firebase-config.js`. Dacă vrei să folosești propriul proiect Firebase, actualizează datele din acel fișier.

## Note

- Aplicația funcționează perfect cu Expo Go
- Toate dependențele sunt compatibile cu Expo
- Nu este necesar să construiești aplicația pentru testare - Expo Go rulează direct codul

