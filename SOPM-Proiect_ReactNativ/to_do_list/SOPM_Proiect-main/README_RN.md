# To Do List - React Native

Aplicație React Native pentru gestionarea task-urilor cu autentificare Firebase.

## Cerințe

- Node.js (>= 18)
- npm sau yarn
- React Native CLI
- Android Studio (pentru Android) sau Xcode (pentru iOS)

## Instalare

1. Instalează dependențele:
```bash
npm install
```

sau

```bash
yarn install
```

2. Pentru iOS (doar pe macOS):
```bash
cd ios && pod install && cd ..
```

## Rulare

### Android
```bash
npm run android
```

sau

```bash
yarn android
```

### iOS
```bash
npm run ios
```

sau

```bash
yarn ios
```

## Configurare Firebase

Configurația Firebase este deja setată în `src/firebase-config.js`. Dacă vrei să folosești propriul proiect Firebase:

1. Creează un proiect nou în [Firebase Console](https://console.firebase.google.com/)
2. Activează Authentication (Email/Password)
3. Creează o bază de date Firestore
4. Actualizează `firebase-config.js` cu datele tale

## Structura Proiectului

```
src/
├── App.js                 # Componenta principală cu navigare
├── firebase-config.js     # Configurație Firebase
├── pages/
│   ├── Login.js          # Pagina de login
│   ├── Register.js       # Pagina de înregistrare
│   └── TodoPage.js       # Pagina principală cu task-uri
└── services/
    ├── authService.js    # Servicii de autentificare
    └── todoService.js    # Servicii pentru task-uri
```

## Funcționalități

- ✅ Autentificare cu email și parolă
- ✅ Înregistrare utilizatori noi
- ✅ Adăugare, editare și ștergere task-uri
- ✅ Filtrare și căutare task-uri
- ✅ Prioritate (Scăzută, Mediu, Ridicată)
- ✅ Status (Urmează, Finalizat, Anulat, Restant)
- ✅ Data și ora pentru task-uri
- ✅ Mod întunecat/clar
- ✅ Progres bar pentru task-uri finalizate

## Dependențe Principale

- `react-native`: Framework-ul principal
- `@react-navigation/native`: Navigare între ecrane
- `firebase`: Backend și autentificare
- `@react-native-async-storage/async-storage`: Stocare locală
- `@react-native-picker/picker`: Selectoare pentru prioritate și status

## Note

- Aplicația folosește Firebase pentru autentificare și stocare date
- Modul întunecat este salvat local cu AsyncStorage
- Task-urile sunt sincronizate în timp real cu Firestore

