

## Bug: Guest Favorites Blocked by Guard in Dashboard

### Root Cause

In `Dashboard.tsx` lines 116-125, the `handleToggleFavorite` function has a guard that blocks guest users:

```typescript
const handleToggleFavorite = (recipe: Recipe) => {
  if (isGuest) {
    toast({ title: "Sign up to save favorites", ... });
    return; // ← blocks the actual toggleFavorite call
  }
  toggleFavorite(recipe);
};
```

This was added before the `useFavorites` hook was updated to support guest mode via localStorage. Now that `useFavorites` handles guest users natively (saving to `localStorage`), this guard is preventing the feature from working. The toast fires, the heart visually appears to toggle briefly, but no favorite is actually persisted — which is why the Favorites tab shows "No favorites yet".

### Fix

**File: `src/components/Dashboard.tsx`**

Remove the `isGuest` early return from `handleToggleFavorite`. Simply call `toggleFavorite(recipe)` for all users. The `useFavorites` hook already handles the guest vs authenticated split internally.

```typescript
const handleToggleFavorite = (recipe: Recipe) => {
  toggleFavorite(recipe);
};
```

This is a one-line change. No other files need modification — the `useFavorites` hook already saves to localStorage for guests and to the database for authenticated users.

### Test Results So Far

| Feature | Status |
|---|---|
| Onboarding flow (guest) | Working — all 4 steps complete |
| Preferences label fix | Confirmed — "⏱ How much time do you usually have?" displays correctly |
| AI recipe generation | Working — 10 personalized recipes returned for "Lily" |
| Cuisine filters | Working — All (10), American (9), Italian-American (1) |
| Favorite toggle (guest) | Broken — blocked by isGuest guard |
| Favorites tab (guest) | Empty — because toggle never fires |

