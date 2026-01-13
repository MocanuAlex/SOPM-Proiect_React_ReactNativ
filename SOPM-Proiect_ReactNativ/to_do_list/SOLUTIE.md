# Soluție pentru eroarea @expo/metro

Problema este că Expo CLI încearcă să acceseze un fișier care nu există în structura `@expo/metro`.

## Soluție 1: Folosește Expo CLI global

1. Instalează Expo CLI global:
```bash
npm install -g expo-cli
```

2. Rulează:
```bash
expo start --clear
```

## Soluție 2: Creează un proiect nou

1. Mergi într-un director părinte:
```bash
cd ..
```

2. Creează un proiect nou:
```bash
npx create-expo-app@latest ToDoListApp --template blank
```

3. Copiază fișierele din `src/` în noul proiect:
```bash
xcopy /E /I SOPM_Proiect-main\src ToDoListApp\src
```

4. Copiază `package.json` și actualizează dependențele:
```bash
cd ToDoListApp
npm install
```

5. Rulează:
```bash
npm start
```

## Soluție 3: Folosește React Native CLI direct

Dacă Expo continuă să dea probleme, poți folosi React Native CLI direct fără Expo Go.

