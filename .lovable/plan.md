

## Add 30 Quick Recipes (Under 15 min)

Add 30 new recipes (IDs 31-60) to `src/lib/mockData.ts`, all with cook times of 10 or 15 minutes, spread across all 8 cuisines (~3-4 per cuisine).

### Recipe distribution

```text
Italian (4):     Caprese Salad, Bruschetta, Aglio e Olio, Pesto Pasta
Mexican (4):     Quesadillas, Guacamole Bowl, Bean Tostadas, Nachos
Indian (4):      Masala Toast, Dahi Chaat, Besan Cheela, Paneer Bhurji
Chinese (4):     Egg Fried Rice, Sesame Noodles, Stir-Fry Greens, Wonton Soup
Japanese (4):    Miso Soup, Edamame Rice, Tamago, Onigiri
Mediterranean(3):Hummus Plate, Greek Salad, Pita Pockets
American (4):    PB&J Rollups, Scrambled Eggs Toast, Trail Mix Bites, Smoothie Bowl
Thai (3):        Thai Peanut Noodles, Spring Rolls, Mango Sticky Rice
```

### File changes
- **`src/lib/mockData.ts`**: Append 30 recipe objects after ID "30", before the `commonAllergies` export. Each follows the existing structure with `id`, `title`, `cookTime` (10 or 15 min), `difficulty` (Easy), `servings`, `kidApproval`, `ingredients`, `steps`, `tags`, `icon` (from existing icon map keys), `cuisine`, and `nutrition`.

Single file edit, no other changes needed.

