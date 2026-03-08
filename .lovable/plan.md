

## Problem

When you select "10 min" or "15 min" cooking time, the dashboard shows no recipes. Two issues cause this:

1. **AI prompt is vague about time format** — The AI may return "20 min" or "25 min" recipes despite the constraint, because the prompt says "15 min or less" but doesn't enforce the `cookTime` string format strictly.

2. **Double filtering kills results** — The AI tries to respect the time limit but sometimes overshoots. The client-side `parseMinutes` filter then removes those recipes, leaving zero results. If ALL AI recipes exceed the limit even slightly, you get an empty screen.

3. **Fallback mock recipes are also too slow** — When the AI call fails, mock recipes (mostly 20-30 min) also get filtered out.

## Plan

### 1. Fix edge function prompt to be stricter about time
- Explicitly tell the AI: "cookTime field MUST be a string like '10 min' and the number MUST be ≤ {limit}."
- Add the numeric limit directly (e.g., "maximum 15 minutes total") instead of passing the raw string.

### 2. Add server-side validation of cookTime
- After parsing AI response, filter out any recipes where cookTime exceeds the limit before returning to client. This ensures only valid recipes reach the frontend.

### 3. Add quick mock recipes for short times
- Add 4-6 mock Indian recipes with 10-15 min cook times (e.g., Bread Upma, Poha, Instant Rava Dosa, Maggi Noodles, Curd Rice, Banana Lassi) so the fallback also works for short time filters.

### 4. Improve empty state UX
- When zero recipes match after AI fetch, show a helpful message with a "Try with more time" button that bumps the filter to 30 min, rather than just showing a blank screen.

### Technical details

**Edge function changes** (`supabase/functions/suggest-recipes/index.ts`):
- Parse numeric limit from `maxCookingTime` string
- Update `timeNote` to: `"CRITICAL: Every recipe cookTime MUST be '${limit} min' or less. The cookTime field must be formatted as 'X min' where X ≤ ${limit}."`
- After parsing AI response, filter: `recipes.filter(r => parseInt(r.cookTime) <= limit)`

**Mock data** (`src/lib/mockData.ts`):
- Add ~6 quick Indian recipes with cookTime "10 min" or "15 min"

**Dashboard** (`src/components/Dashboard.tsx`):
- Add "Try with more time" button in empty state that sets maxMinutes to 30

