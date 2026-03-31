# RetroBreaker

Application mobile-first pour aider les equipes agiles a trouver la retrospective ou l'icebreaker ideal via un quiz de recommandation.

## Pre-requis

- **Node.js** >= 18
- **npm** >= 9 (ou **pnpm** >= 8)
- **Windows** : Visual Studio Build Tools (pour compiler `better-sqlite3` sur Node >= 24)

## Installation

```bash
# Backend
cd backend
npm install
# ou : pnpm install

# Frontend
cd ../frontend
npm install
# ou : pnpm install
```

### Probleme avec better-sqlite3 sur Node >= 24

Si vous obtenez une erreur `Could not locate the bindings file` avec `node-v137`, il faut recompiler le module natif :

```bash
cd backend
npx node-gyp rebuild --directory=node_modules/better-sqlite3
# ou avec pnpm :
npx node-gyp rebuild --directory=node_modules/.pnpm/better-sqlite3@12.8.0/node_modules/better-sqlite3
```

Necessite Python 3 et Visual Studio Build Tools (C++ desktop workload).

## Lancer le backend

```bash
cd backend

# Seeder la base de donnees (12 activites)
npm run seed

# Demarrer le serveur (port 3000)
npm run dev
```

Le backend tourne sur `http://localhost:3000`. Verifier avec :

```bash
curl http://localhost:3000/api/health
```

## Lancer le frontend

Dans un **second terminal** :

```bash
cd frontend

# Lancer Expo (web)
npx expo start --web
```

Cela ouvre l'app dans le navigateur sur `http://localhost:8081`.

### Autres plateformes

```bash
# iOS (necessite Xcode / macOS)
npx expo start --ios

# Android (necessite Android Studio / emulateur)
npx expo start --android
```

## Tester l'application

1. Lancer le backend (`npm run dev` dans `backend/`)
2. Lancer le frontend (`npx expo start --web` dans `frontend/`)
3. Creer un compte sur l'ecran d'inscription
4. Explorer l'accueil, le quiz de recherche, les favoris et les details d'activite

## Endpoints API (resume)

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/activities` | Lister les activites |
| GET | `/api/activities/:id` | Detail d'une activite |
| GET | `/api/activities/recommend/quiz` | Recommandation via quiz |
| POST | `/api/activities/:id/view` | Marquer comme consulte |
| GET | `/api/activities/user/recently-viewed` | Activites consultees |
| GET | `/api/favorites` | Lister les favoris |
| GET | `/api/favorites/ids` | IDs des favoris |
| POST | `/api/favorites/:id` | Ajouter un favori |
| DELETE | `/api/favorites/:id` | Retirer un favori |
