

## Fix for H1 & H2: Kid Confidence Indicators + Nutrition Gap View

### H1 — "Parents lack confidence kids will accept suggested meals"

**Problem:** The app shows a generic `kidApproval` percentage but doesn't explain *why* a recipe matches the child's profile. Parents need personalized reasoning to trust the suggestion.

**Solution: Personalized Match Reasons on RecipeCard**

- Add a new `matchReasons` computed section to `RecipeCard` that cross-references the recipe's ingredients/tags against the kid profiles passed down.
- Show pill badges like: "Uses chicken — Maya's favorite!", "Nut-free — safe for Liam", "No broccoli — respects Ava's dislikes".
- Reframe the `kidApproval` badge as a "Kid Match" score with a tooltip explaining what it means.
- For AI recipes: update the edge function prompt to also return a `matchReasons: string[]` field per recipe explaining why it suits the specific kids.

**File changes:**
- `src/lib/types.ts` — Add optional `matchReasons?: string[]` to `Recipe`
- `src/components/RecipeCard.tsx` — Accept `kids` prop, compute local match reasons from ingredients vs kid favorites/allergies/dislikes, display as colored pills below tags
- `src/components/Dashboard.tsx` — Pass `kids` to `RecipeCard`
- `supabase/functions/suggest-recipes/index.ts` — Add `matchReasons` to the AI prompt schema so AI returns personalized explanations

### H2 — "Parents don't see the nutrition gap from repetitive meals"

**Problem:** Nutrition data exists per recipe but there's no view showing how the weekly plan improves overall variety and coverage.

**Solution: Weekly Nutrition Summary in WeeklyPlanner**

- Add a collapsible "Nutrition Snapshot" panel in the WeeklyPlanner that aggregates nutrition across all planned meals.
- Show daily averages for calories, protein, carbs, fat, fiber as progress bars against recommended daily values for children.
- Show a "Variety Score" — count of unique ingredients across the week (e.g., "Your plan uses 47 unique ingredients this week").
- Highlight gaps: if protein is consistently low or fiber is missing, show a gentle nudge like "Consider adding a high-fiber option for Wednesday dinner."

**File changes:**
- `src/components/WeeklyPlanner.tsx` — Add `NutritionSnapshot` component that computes aggregated nutrition from `planned` recipes, renders as a collapsible card with daily average bars and variety score
- `src/components/WeeklyPlanner.tsx` — Add toggle button next to the Shopping List button in the header

### Summary of all file changes

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `matchReasons?: string[]` to Recipe |
| `src/components/RecipeCard.tsx` | Add `kids` prop, render match-reason pills |
| `src/components/Dashboard.tsx` | Pass `kids` to RecipeCard |
| `supabase/functions/suggest-recipes/index.ts` | Add `matchReasons` to AI schema/prompt |
| `src/components/WeeklyPlanner.tsx` | Add NutritionSnapshot panel with aggregated stats + variety score |

