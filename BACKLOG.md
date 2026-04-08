# RetroBreaker - Backlog (Iteration 4)

## Completed (Iterations 1-3)
- [x] Full backend API (auth, activities CRUD, favorites, recently viewed, quiz recommend)
- [x] Frontend auth (login, register, JWT, protected routes)
- [x] Home screen (CTA, recent, viewed, favorites sections)
- [x] Quiz flow ("Trouve ton booster" 4-step quiz + result)
- [x] Activity detail screen (full info, fav toggle, edit/delete for creator)
- [x] Activity create/edit form
- [x] Favorites (optimistic updates, sync)
- [x] Tab navigation (Accueil, Explorer, Favoris)
- [x] Responsive layout, skeletons, toasts, animations
- [x] Seed data (12 activities)
- [x] Soft-delete for activities

---

## Iteration 4 - Current Work

### Phase 1: pnpm Monorepo + README [HIGH]
- [ ] Set up pnpm workspace (pnpm-workspace.yaml at root)
- [ ] Add root package.json with workspace scripts
- [ ] Remove npm lockfiles, ensure pnpm-lock in each package
- [ ] Rewrite README for pnpm usage

### Phase 2: DB Schema Changes [HIGH]
- [ ] Add `is_global` column to `activities` (BOOLEAN, default 0)
- [ ] Add `is_admin` column to `users` (BOOLEAN, default 0)
- [ ] Add `ADMIN_EMAILS` env var to backend config
- [ ] Create `articles` table (id, title, content, author_id, created_at, updated_at)
- [ ] Migration logic for existing DBs

### Phase 3: Backend - Admin + Activity Visibility [HIGH]
- [ ] Admin detection: on login/register, check if email is in ADMIN_EMAILS env var, set is_admin
- [ ] GET /api/activities: return global activities (is_global=1 OR creator_id IS NULL) + user's own
- [ ] POST /api/activities: if admin -> is_global=1, else -> is_global=0 (user-scoped)
- [ ] Quiz recommend: same visibility rules
- [ ] GET /api/auth/me or return is_admin in login/register response

### Phase 4: Backend - Clone Endpoint [HIGH]
- [ ] POST /api/activities/:id/clone -- copies activity, sets creator_id to current user, is_global=0
- [ ] Return new cloned activity

### Phase 5: Backend - Articles CRUD [MEDIUM]
- [ ] POST /api/articles (admin only) -- create article
- [ ] GET /api/articles -- list articles (all users)
- [ ] PUT /api/articles/:id (admin only) -- update
- [ ] DELETE /api/articles/:id (admin only) -- delete

### Phase 6: Frontend - Quiz Navigation Fix [HIGH]
- [ ] Add "home" icon button in quiz header (visible at all steps)
- [ ] One-tap navigation to home from quiz at any step
- [ ] Also add home button on activity detail when coming from quiz

### Phase 7: Frontend - Activity Visibility + User Scoping [HIGH]
- [ ] Update activity list queries to pass auth token (so backend can scope)
- [ ] Show "Mes activites" section or badge for user-created activities
- [ ] Admin badge/indicator for admin users

### Phase 8: Frontend - Clone Feature [HIGH]
- [ ] "Clone" button on activity detail page
- [ ] Clone creates a copy, navigates to edit form pre-filled
- [ ] Toast confirmation

### Phase 9: Frontend - Admin Articles [MEDIUM]
- [ ] Admin: article creation form (title + rich text content)
- [ ] Admin: article list management (edit, delete)
- [ ] Home page: "Derniers articles" section showing recent articles
- [ ] Article detail view

### Phase 10: UX/UI Overhaul [HIGH]
- [ ] Warmer color palette (inspired by Figma: teal/turquoise accent, warm yellow, soft backgrounds)
- [ ] Rounded, softer card designs with larger touch targets
- [ ] Better mobile spacing -- less empty space, more content density
- [ ] Welcoming home screen header with gradient/illustration
- [ ] Improved tab bar (custom styling, icons)
- [ ] Better activity cards -- more visual, color-coded
- [ ] Quiz flow polish -- bigger buttons, better progress indicator
- [ ] Typography improvements (consistent sizing, weights)
- [ ] Create reusable UI components (Badge, SectionHeader, GradientHeader)
- [ ] Login/Register screens visual upgrade
- [ ] Activity detail page redesign (hero section, better layout)
- [ ] Empty states improvements (illustrations or friendly messages)
- [ ] Responsive polish for desktop (max-width containers, grid layouts)

### Phase 11: Testing + Cleanup [HIGH]
- [ ] Test all flows end-to-end (auth, quiz, create, clone, favorites, articles)
- [ ] Verify responsive on mobile and desktop widths
- [ ] Clean up unused code
- [ ] Final commits

---

## Design Direction (from Figma)
- Teal/turquoise primary (#0ABAB5 or similar) -- warmer than current cold blue
- Warm yellow accent (#F5C542) for CTAs and highlights
- Soft cream/warm white backgrounds instead of cold gray
- Rounded cards with subtle shadows
- Friendly illustrations/icons
- "Derniers articles" section on home (from Figma design)
