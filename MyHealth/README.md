# MyHealth — Application Mobile
> React Native (Expo) · Frontend · v1.0.0

---

## 🚀 Installation & démarrage

### 1. Prérequis
- Node.js 18+
- Expo CLI : `npm install -g expo-cli`
- Application Expo Go sur ton téléphone (iOS ou Android)

### 2. Installer les dépendances
```bash
cd MyHealth
npm install
```

### 3. Démarrer l'application
```bash
npm start
# ou
npx expo start
```
Scanne le QR code avec Expo Go sur ton téléphone.

---

## 📁 Structure du projet

```
MyHealth/
├── App.tsx                        # Point d'entrée
├── src/
│   ├── theme/
│   │   └── index.ts               # Couleurs, typographie, espacements
│   ├── context/
│   │   └── AuthContext.tsx        # Gestion token JWT + état connexion
│   ├── services/
│   │   └── api.ts                 # Tous les appels API backend (Sindze)
│   ├── navigation/
│   │   ├── types.ts               # Typage TypeScript de tous les écrans
│   │   ├── AuthNavigator.tsx      # Navigation sans connexion
│   │   ├── PatientTabNavigator.tsx # Barre onglets patient
│   │   └── RootNavigator.tsx      # Navigation racine (auth + app)
│   ├── components/
│   │   └── ui/
│   │       └── index.tsx          # Button, Input, Card, Screen, Badge...
│   └── screens/
│       ├── index.ts               # Placeholders (à remplacer étape par étape)
│       ├── auth/                  # SplashScreen, Login, Register...
│       ├── patient/               # Home, Appointments, Medical...
│       └── chat/                  # ChatList, ChatRoom
```

---

## 🔗 Connexion au backend (Sindze)

Le fichier `src/services/api.ts` pointe vers :
```typescript
const BASE_URL = 'http://localhost:5000/api';
```

⚠️ **Avant de tester** : Sindze doit démarrer son serveur avec `npm run dev`  
⚠️ **Sur téléphone physique** : remplacer `localhost` par l'IP locale de la machine de Sindze  
   Exemple : `http://192.168.1.XX:5000/api`

---

## 🎨 Charte graphique

| Élément | Valeur |
|---|---|
| Couleur principale | `#00C896` (Teal) |
| Couleur secondaire | `#0077B6` (Bleu) |
| Couleur urgence | `#E53935` (Rouge) |
| Fond clair | `#f0f6f4` |
| Fond sombre | `#0d2137` |

---

## 📋 Étapes de développement

- [x] **Étape 1** — Setup backend (Sindze) ✅
- [x] **Étape 2** — Setup frontend : navigation + thème + composants ✅ ← ON EST ICI
- [ ] **Étape 3** — Authentification : écrans Login / Register / OTP
- [ ] **Étape 4** — Module Patients : spécialités, médecins, RDV
- [ ] **Étape 5** — Dossier médical + PDF
- [ ] **Étape 6** — Chat & Vidéo (Socket.io + Agora)
- [ ] **Étape 7** — Urgences & Paiements
- [ ] **Étape 8** — Tests & Déploiement

---

## 👥 Équipe

| Rôle | Développeur | Tâches |
|---|---|---|
| Backend | Sindze | Node.js, PostgreSQL, API REST, Socket.io |
| Frontend | Ta femme | React Native, UI/UX, Navigation, Écrans |
