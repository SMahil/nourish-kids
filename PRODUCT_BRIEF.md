# NourishKids — Product Brief

## Problem Statement

Working parents face a daily struggle: preparing nutritious meals that their children will actually enjoy. Common pain points include:

- **Meal repetition** — Parents default to the same few recipes, leading to boredom and mealtime resistance.
- **Picky eaters** — Children's allergies, dislikes, and preferences make planning even harder.
- **Time pressure** — Limited time for both cooking and researching new recipes.
- **Scattered resources** — Useful recipes exist across social media, blogs, and apps, but there's no single place that personalizes suggestions.
- **Mealtime anxiety** — Parents feel guilty about repeating meals or resorting to unhealthy shortcuts.
- **Lost quality time** — Hours spent planning and searching could be spent with the kids.

## Solution

**NourishKids** is an AI-powered meal planning app designed specifically for busy parents. It learns each child's dietary profile and suggests quick, nourishing recipes they'll actually eat — all in one place.

## Core Features

### 1. Onboarding & Kid Profiles
- Add one or more children with name, age, and dietary details.
- Capture **allergies**, **dislikes**, and **favorite foods** per child.
- Set diet type (omnivore, vegetarian, vegan, etc.).
- Specify parent's available cooking time and skill level.
- Select preferred cuisines.

### 2. Smart Recipe Dashboard
- Personalized recipe suggestions based on kid profiles.
- Each recipe card shows:
  - Cook time, difficulty, servings
  - **Kid-approval rating** (percentage likelihood kids will enjoy it)
  - Full ingredient list and step-by-step instructions
  - Tags (e.g., "nut-free", "under 20 min", "veggie-hidden")
- Filter by meal type, time, and dietary needs.

### 3. Grocery-to-Recipe Engine
- **Text mode:** Paste or type available ingredients to get matching recipes.
- **Photo mode:** Upload a photo of groceries or a receipt; AI identifies ingredients and suggests meals.
- Reduces food waste by working with what's already in the kitchen.

### 4. Weekly Meal Planner (Drag & Drop)
- 7-day calendar grid with **Breakfast**, **Lunch**, and **Dinner** slots.
- Drag suggested recipes from a sidebar into any meal slot.
- Visual progress tracker (e.g., "12/21 meals planned").
- Remove meals easily with a trash action.
- Printable/exportable weekly plan *(future)*.

## Target Users

| Persona | Description |
|---|---|
| **Busy Parent** | Works full-time, needs quick weeknight dinners (under 30 min). |
| **Health-Conscious Parent** | Wants balanced nutrition without kids rejecting meals. |
| **Multi-Kid Household** | Needs recipes that satisfy different preferences and allergies simultaneously. |
| **Meal Prep Parent** | Plans the full week ahead, shops once, cooks efficiently. |

## User Flow

```
Welcome Screen
    ↓
Add Kid Profiles (name, age, allergies, dislikes, favorites)
    ↓
Set Preferences (cooking time, skill level, cuisines)
    ↓
Dashboard (AI-suggested recipes)
    ├── Browse & expand recipe cards
    ├── Grocery Upload → get recipes from available ingredients
    └── Weekly Planner → drag & drop recipes into a 7-day calendar
```

## Design Principles

- **Warm & friendly** — Rounded shapes, soft gradients (coral, peach, sage), playful emoji.
- **Mobile-first** — Designed for one-handed use while holding a toddler.
- **Low cognitive load** — Clear icons, minimal text, progressive disclosure.
- **Encouraging tone** — "Meal magic for busy parents ✨" — never judgmental.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + custom design tokens |
| Animation | Framer Motion |
| Drag & Drop | @dnd-kit |
| UI Components | shadcn/ui (Radix primitives) |
| Backend (planned) | Lovable Cloud (database, auth, edge functions) |
| AI (planned) | LLM-powered recipe matching and grocery image recognition |

## Roadmap

### ✅ Phase 1 — MVP (Current)
- [x] Onboarding flow with kid profiles
- [x] Preference capture (time, skill, cuisine)
- [x] Recipe dashboard with mock data
- [x] Grocery-to-recipe (text & photo upload UI)
- [x] Weekly meal planner with drag & drop

### 🔜 Phase 2 — Intelligence
- [ ] Connect Lovable Cloud for persistent data & auth
- [ ] AI-powered recipe suggestions (based on profiles + preferences)
- [ ] Grocery photo recognition (OCR / vision model)
- [ ] Auto-generate shopping list from weekly plan
- [ ] Save favorite recipes

### 🔮 Phase 3 — Growth
- [ ] Nutritional breakdown per meal and per day
- [ ] Multi-parent household sharing
- [ ] Community recipes (submit & rate)
- [ ] Integration with grocery delivery services
- [ ] Push notifications for meal prep reminders
- [ ] "What's for dinner?" quick-pick mode

## Success Metrics

| Metric | Target |
|---|---|
| Onboarding completion rate | > 80% |
| Recipes viewed per session | ≥ 3 |
| Weekly plans created | ≥ 1 per active user per week |
| Return rate (7-day) | > 50% |
| Kid-approval accuracy | > 70% match with actual feedback |

---

*NourishKids — No more mealtime stress.* 🍳
