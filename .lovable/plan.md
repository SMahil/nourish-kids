

## Audit: NourishKids vs Product Brief — Gaps & Fix Plan

### Critical Bugs Found

1. **RLS Policies are RESTRICTIVE (not permissive)** — All tables (`favorite_recipes`, `kid_profiles`, `meal_plans`, `profiles`) have policies marked `Permissive: No`, which means they are RESTRICTIVE. In Postgres, if there are only restrictive policies and zero permissive policies, all access is denied by default. This silently breaks all database operations for authenticated users.

2. **Truncated label in Preferences screen** — Line 58 of `OnboardingPreferences.tsx` reads `"h time do you usually have?"` instead of `"⏱ How much time do you usually have?"`.

3. **Weekly Planner sidebar uses mock data** — The recipe sidebar in `WeeklyPlanner.tsx` hardcodes `mockRecipes` instead of showing the user's AI-generated recipes. Users can't drag their personalized suggestions into the planner.

### Feature Gaps vs Product Brief

| Feature | Status | Issue |
|---|---|---|
| Onboarding & Kid Profiles | ✅ Working | — |
| Smart Recipe Dashboard | ✅ Working | — |
| Favorites (save recipes) | ⚠️ Broken | RLS blocks DB writes; guest mode silently fails with no feedback |
| Grocery-to-Recipe (text) | ⚠️ Mock only | Uses `setTimeout` + `mockRecipes` — no AI integration |
| Grocery-to-Recipe (photo) | ❌ Not implemented | Photo button just opens text mode |
| Weekly Meal Planner (drag & drop) | ⚠️ Partial | Works but sidebar uses mock recipes, not AI suggestions |
| Shopping list from plan | ✅ Working | Generates from planned meals |
| Nutrition breakdown | ✅ Working | Per-recipe and weekly snapshot |
| Auth + persistent data | ⚠️ Broken | RLS blocks all DB operations |

### Plan

#### 1. Fix RLS policies (all 4 tables) — Database migration
Recreate all policies as PERMISSIVE instead of RESTRICTIVE. This is the highest priority fix — without it, no data persists for authenticated users.

```sql
-- Drop restrictive policies and recreate as permissive for all tables
-- favorite_recipes, kid_profiles, meal_plans, profiles
```

#### 2. Fix truncated preferences label
Update `OnboardingPreferences.tsx` line 58 from `"h time do you usually have?"` to `"⏱ How much time do you usually have?"`.

#### 3. Pass AI recipes to Weekly Planner
- Add `recipes` state to `Index.tsx` that stores the last AI-generated recipe set from Dashboard
- Pass recipes as a prop to `WeeklyPlanner`
- Planner sidebar shows AI recipes when available, falls back to mock recipes

#### 4. Connect Grocery-to-Recipe to AI
- Update `GroceryUpload.tsx` to call the `suggest-recipes` edge function with the grocery list as context
- Pass `kids` and `cuisinePreferences` props into `GroceryUpload` for personalization
- Show real AI-matched recipes instead of mock data

#### 5. Add guest-mode feedback for favorites
- Show a toast when a guest taps the heart: "Sign up to save favorites"
- Pass `isGuest` flag to Dashboard

#### 6. Wire up photo upload for grocery recognition
- Add actual file input for camera/photo
- Call AI (Gemini with vision) via a new edge function to extract ingredients from the image
- Feed extracted ingredients into the existing recipe suggestion flow

### Priority Order
1. Fix RLS (critical — blocks all persistence)
2. Fix preferences label (quick win)
3. Pass AI recipes to planner (core UX gap)
4. Guest-mode favorite feedback (polish)
5. AI grocery text integration (Phase 2 feature)
6. Photo grocery recognition (Phase 2 feature)

