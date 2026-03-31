# Retro & Icebreaker App - Full Backlog

## Project Overview
Mobile-first (responsive) app for agile teams to find the perfect retrospective or icebreaker activity through a guided recommendation quiz.

**Tech Stack:**
- Frontend: React Native + TypeScript + Expo Router
- Styling: Plain StyleSheet (NativeWind dropped due to peer dep conflicts)
- State: Zustand (local) + TanStack Query (server)
- Backend: TypeScript + Express + SQLite (better-sqlite3)
- Auth: JWT-based simple register/login

---

## Phase 0: Project Setup [HIGH]
- [x] Initialize Expo project with TypeScript
- [x] Set up Expo Router (file-based routing)
- [x] Install & configure NativeWind
- [x] Set up backend project (Express + TypeScript)
- [x] Configure SQLite with better-sqlite3
- [x] Set up monorepo or project structure

## Phase 1: Backend - Core API [HIGH]
- [x] Database schema design (users, activities, favorites, recently_viewed)
- [x] User model + migration
- [x] Activity model + migration
- [x] Favorites model + migration
- [x] RecentlyViewed model + migration
- [x] Auth endpoints: POST /api/auth/register
- [x] Auth endpoints: POST /api/auth/login
- [x] JWT middleware for protected routes
- [x] Activity endpoints: GET /api/activities (list all)
- [x] Activity endpoints: GET /api/activities/:id (detail)
- [x] Activity endpoints: GET /api/activities/recommend (with query params)
- [x] Favorites endpoints: GET /api/favorites
- [x] Favorites endpoints: POST /api/favorites/:activityId
- [x] Favorites endpoints: DELETE /api/favorites/:activityId
- [x] Recently viewed: POST /api/activities/:id/view
- [x] Recently viewed: GET /api/activities/recently-viewed
- [x] Seed script with 12 activities (6 retros + 6 icebreakers)

## Phase 2: Frontend Auth [HIGH]
- [x] Auth store (Zustand) - token, user, login/logout actions
- [x] API client setup (fetch/axios with auth headers)
- [x] Login screen UI (email + password)
- [x] Register screen UI (name + email + password)
- [x] Auth flow: redirect to login if no token
- [x] Protected route layout wrapper

## Phase 3: Home Screen [HIGH]
- [x] Home screen layout
- [x] "Accueil" header with home icon
- [x] "Trouve ton booster !" CTA button
- [x] "Ajoutés récemment" section with horizontal card grid
- [x] "Consultés récemment" section with horizontal card grid
- [x] "Mes favoris" section (conditional, shows if has favorites)
- [x] Activity card component (thumbnail, title, tags)
- [x] Navigation to activity detail on card tap
- [x] Navigation to search on CTA tap

## Phase 4: Search / Quiz Flow [HIGH]
- [x] Search screen with multi-step state machine
- [x] Step 1: Type selector (Retros / Icebreakers tabs)
- [x] Step 2: Team size selector (3-5, 6-10, 11+)
- [x] Step 3: Duration selector (10-15, 20-30, 30-45 min)
- [x] Step 4: Mood selector (Fun, Serious, Creative)
- [x] Progress bar component (X/5)
- [x] Step 5: Result display with recommended activity
- [x] "Voir les détails" button -> activity detail
- [x] "Recommencer" button -> reset quiz
- [x] Recommendation algorithm integration
- [x] Animations/transitions between steps

## Phase 5: Activity Detail Screen [HIGH]
- [x] Back navigation arrow
- [x] Favorite toggle (heart icon) in header
- [x] Activity type badge (Retrospective / Icebreaker)
- [x] Activity title
- [x] Meta info: duration (clock icon) + team size (users icon)
- [x] Tags display (horizontal pills)
- [x] Description section
- [x] Instructions section (numbered steps)
- [x] Materials section (bulleted list)
- [x] Mark as recently viewed on open

## Phase 6: Favorites [HIGH]
- [x] Favorites screen layout
- [x] Favorites list (vertical, full cards)
- [x] Empty state (heart icon + message)
- [x] Toggle favorite from any activity card
- [x] Sync favorites with backend
- [x] Optimistic updates

## Phase 7: Navigation [MEDIUM]
- [x] Bottom tab bar component (Home / Search / Favorites)
- [x] Active tab indicator (blue color + underline)
- [x] Tab icons (home, search/magnifying glass, heart)
- [x] Expo Router tab layout configuration
- [x] Smooth tab transitions

## Phase 8: Data & Algorithm [HIGH]
- [x] Seed all 12 activities with full data
- [x] Recommendation scoring algorithm:
  - Filter by type (retro/icebreaker)
  - +3 points for team size match
  - +2 points for duration match
  - +2 points for mood/tag match
- [x] Map mood to tags:
  - "fun" -> Fun, Amusant, Créatif
  - "serious" -> Réflexion, Structure, Apprentissage
  - "creative" -> Créatif, Métaphore

## Phase 9: Polish & Responsive [MEDIUM]
- [x] Responsive layout (mobile vs tablet vs desktop)
- [x] Loading states / skeletons
- [x] Error handling & toast notifications
- [x] Smooth animations (step transitions, favorite toggle)
- [x] Color scheme consistency (#074ee8 primary, #eeeeee bg)
- [ ] Typography consistency (Inter font)
- [ ] Dark mode consideration (stretch goal)
- [x] Web export testing

---

## Activity Data (12 total)

### Retros (6):
1. Starfish - 30-45 min - 3-10 people - Tags: Réflexion, Amélioration, Équipe
2. Mad Sad Glad - 20-30 min - 3-15 people - Tags: Émotions, Sprint, Équipe
3. Voilier (Sailboat) - 30-40 min - 5-12 people - Tags: Métaphore, Obstacles, Objectifs
4. 4Ls - 25-35 min - 3-12 people - Tags: Apprentissage, Structure, Simple
5. Timeline - 40-60 min - 4-12 people - Tags: Chronologie, Détaillé, Sprint
6. Speedboat - 30-45 min - 5-15 people - Tags: Vitesse, Obstacles, Objectifs

### Icebreakers (6):
1. Two Truths and a Lie - 10-15 min - 4-20 people - Tags: Connaissance, Fun, Rapide
2. Dessin à l'aveugle - 15-20 min - 6-16 people - Tags: Communication, Créatif, Amusant
3. Si j'étais... - 10-15 min - 3-15 people - Tags: Créatif, Métaphore, Personnel
4. Speed Networking - 20-30 min - 8-30 people - Tags: Réseau, Énergie, Connexion
5. Questions insolites - 15-20 min - 3-20 people - Tags: Amusant, Créatif, Réflexion
6. Bingo Humain - 15-25 min - 10-50 people - Tags: Interaction, Mouvement, Découverte

---

## Design Tokens
- Primary: #074ee8
- Primary hover: #0640c7
- Background: #f5f5f5
- Surface: #ffffff
- Text primary: #111111
- Text secondary: #666666
- Border: #e0e0e0
- Inactive: #aaaaaa
- Light blue: #f0f7ff
- Font: Inter / system
