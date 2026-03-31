# Retro & Icebreaker App - Full Backlog

## Project Overview
Mobile-first (responsive) app for agile teams to find the perfect retrospective or icebreaker activity through a guided recommendation quiz.

**Tech Stack:**
- Frontend: React Native + TypeScript + Expo Router
- Styling: NativeWind (Tailwind for RN)
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
- [ ] Database schema design (users, activities, favorites, recently_viewed)
- [ ] User model + migration
- [ ] Activity model + migration
- [ ] Favorites model + migration
- [ ] RecentlyViewed model + migration
- [ ] Auth endpoints: POST /api/auth/register
- [ ] Auth endpoints: POST /api/auth/login
- [ ] JWT middleware for protected routes
- [ ] Activity endpoints: GET /api/activities (list all)
- [ ] Activity endpoints: GET /api/activities/:id (detail)
- [ ] Activity endpoints: GET /api/activities/recommend (with query params)
- [ ] Favorites endpoints: GET /api/favorites
- [ ] Favorites endpoints: POST /api/favorites/:activityId
- [ ] Favorites endpoints: DELETE /api/favorites/:activityId
- [ ] Recently viewed: POST /api/activities/:id/view
- [ ] Recently viewed: GET /api/activities/recently-viewed
- [ ] Seed script with 12 activities (6 retros + 6 icebreakers)

## Phase 2: Frontend Auth [HIGH]
- [ ] Auth store (Zustand) - token, user, login/logout actions
- [ ] API client setup (fetch/axios with auth headers)
- [ ] Login screen UI (email + password)
- [ ] Register screen UI (name + email + password)
- [ ] Auth flow: redirect to login if no token
- [ ] Protected route layout wrapper

## Phase 3: Home Screen [HIGH]
- [ ] Home screen layout
- [ ] "Accueil" header with home icon
- [ ] "Trouve ton booster !" CTA button
- [ ] "Ajoutés récemment" section with horizontal card grid
- [ ] "Consultés récemment" section with horizontal card grid
- [ ] "Mes favoris" section (conditional, shows if has favorites)
- [ ] Activity card component (thumbnail, title, tags)
- [ ] Navigation to activity detail on card tap
- [ ] Navigation to search on CTA tap

## Phase 4: Search / Quiz Flow [HIGH]
- [ ] Search screen with multi-step state machine
- [ ] Step 1: Type selector (Retros / Icebreakers tabs)
- [ ] Step 2: Team size selector (3-5, 6-10, 11+)
- [ ] Step 3: Duration selector (10-15, 20-30, 30-45 min)
- [ ] Step 4: Mood selector (Fun, Serious, Creative)
- [ ] Progress bar component (X/5)
- [ ] Step 5: Result display with recommended activity
- [ ] "Voir les détails" button -> activity detail
- [ ] "Recommencer" button -> reset quiz
- [ ] Recommendation algorithm integration
- [ ] Animations/transitions between steps

## Phase 5: Activity Detail Screen [HIGH]
- [ ] Back navigation arrow
- [ ] Favorite toggle (heart icon) in header
- [ ] Activity type badge (Retrospective / Icebreaker)
- [ ] Activity title
- [ ] Meta info: duration (clock icon) + team size (users icon)
- [ ] Tags display (horizontal pills)
- [ ] Description section
- [ ] Instructions section (numbered steps)
- [ ] Materials section (bulleted list)
- [ ] Mark as recently viewed on open

## Phase 6: Favorites [HIGH]
- [ ] Favorites screen layout
- [ ] Favorites list (vertical, full cards)
- [ ] Empty state (heart icon + message)
- [ ] Toggle favorite from any activity card
- [ ] Sync favorites with backend
- [ ] Optimistic updates

## Phase 7: Navigation [MEDIUM]
- [ ] Bottom tab bar component (Home / Search / Favorites)
- [ ] Active tab indicator (blue color + underline)
- [ ] Tab icons (home, search/magnifying glass, heart)
- [ ] Expo Router tab layout configuration
- [ ] Smooth tab transitions

## Phase 8: Data & Algorithm [HIGH]
- [ ] Seed all 12 activities with full data
- [ ] Recommendation scoring algorithm:
  - Filter by type (retro/icebreaker)
  - +3 points for team size match
  - +2 points for duration match
  - +2 points for mood/tag match
- [ ] Map mood to tags:
  - "fun" -> Fun, Amusant, Créatif
  - "serious" -> Réflexion, Structure, Apprentissage
  - "creative" -> Créatif, Métaphore

## Phase 9: Polish & Responsive [MEDIUM]
- [ ] Responsive layout (mobile vs tablet vs desktop)
- [ ] Loading states / skeletons
- [ ] Error handling & toast notifications
- [ ] Smooth animations (step transitions, favorite toggle)
- [ ] Color scheme consistency (#074ee8 primary, #eeeeee bg)
- [ ] Typography consistency (Inter font)
- [ ] Dark mode consideration (stretch goal)
- [ ] Web export testing

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
