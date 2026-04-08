# RetroBreaker

Application mobile-first pour aider les equipes agiles a trouver la retrospective ou l'icebreaker ideal via un quiz de recommandation.

## Pre-requis

- **Node.js** >= 18
- **pnpm** >= 8 (`npm install -g pnpm`)
- **Windows** : Visual Studio Build Tools (pour compiler `better-sqlite3`)

## Installation

Le projet utilise un **monorepo pnpm** avec deux packages : `backend` et `frontend`.

```bash
# Depuis la racine du projet -- installe les deux packages
pnpm install
```

## Configuration

```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env
```

Variables d'environnement (`backend/.env`) :

| Variable | Description | Defaut |
|----------|-------------|--------|
| `JWT_SECRET` | Secret pour signer les tokens JWT | `a-secret` |
| `PORT` | Port du serveur backend | `3000` |
| `ADMIN_EMAILS` | Emails admin separes par des virgules | (vide) |

## Lancer le projet

### Backend

```bash
# Seeder la base de donnees (12 activites par defaut)
pnpm seed

# Demarrer le serveur (port 3000)
pnpm dev:backend
```

Verifier : `curl http://localhost:3000/api/health`

### Frontend

Dans un **second terminal** :

```bash
# Lancer Expo (web, port 8081)
pnpm dev:frontend
```

### Autres plateformes

```bash
# iOS (necessite Xcode / macOS)
pnpm --filter frontend ios

# Android (necessite Android Studio / emulateur)
pnpm --filter frontend android
```

## Probleme avec better-sqlite3

Si vous obtenez une erreur `Could not locate the bindings file`, recompiler :

```bash
pnpm --filter backend exec npx node-gyp rebuild --directory=node_modules/better-sqlite3
```

Necessite Python 3 et Visual Studio Build Tools (C++ desktop workload).

## Tester l'application

1. Lancer le backend (`pnpm dev:backend`)
2. Lancer le frontend (`pnpm dev:frontend`)
3. Creer un compte sur l'ecran d'inscription
4. Explorer l'accueil, le quiz, les favoris et les activites

## Structure du projet

```
retrobreaker/
  backend/          # Express + SQLite API
  frontend/         # React Native + Expo Router
  pnpm-workspace.yaml
  package.json      # Scripts monorepo
```

## Endpoints API

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/activities` | Lister les activites |
| GET | `/api/activities/:id` | Detail d'une activite |
| POST | `/api/activities` | Creer une activite |
| PUT | `/api/activities/:id` | Modifier une activite |
| DELETE | `/api/activities/:id` | Supprimer (soft-delete) |
| POST | `/api/activities/:id/clone` | Cloner une activite |
| GET | `/api/activities/recommend/quiz` | Recommandation via quiz |
| POST | `/api/activities/:id/view` | Marquer comme consulte |
| GET | `/api/activities/user/recently-viewed` | Activites consultees |
| GET | `/api/favorites` | Lister les favoris |
| GET | `/api/favorites/ids` | IDs des favoris |
| POST | `/api/favorites/:id` | Ajouter un favori |
| DELETE | `/api/favorites/:id` | Retirer un favori |
| GET | `/api/articles` | Lister les articles |
| POST | `/api/articles` | Creer un article (admin) |
| PUT | `/api/articles/:id` | Modifier un article (admin) |
| DELETE | `/api/articles/:id` | Supprimer un article (admin) |
