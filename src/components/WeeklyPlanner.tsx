import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeIcon from "@/components/RecipeIcon";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { ArrowLeft, Trash2, GripVertical, Loader2, ShoppingCart, Check, Copy, X, CalendarDays, UtensilsCrossed, Sunrise, Sun, Moon, BarChart3, Flame, Beef, Wheat, Droplets, Leaf, Apple, AlertTriangle } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { mockRecipes } from "@/lib/mockData";
import { Recipe, NutritionInfo } from "@/lib/types";
import { useMealPlans } from "@/hooks/useMealPlans";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onBack: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;

const slotKey = (day: string, meal: string) => `${day}-${meal}`;

function DraggableRecipe({ recipe, overlay }: { recipe: Recipe; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { recipe },
  });

  if (overlay) {
    return (
      <div className="flex items-center gap-2 rounded-xl gradient-warm p-3 text-primary-foreground shadow-warm max-w-[200px]">
        <RecipeIcon icon={recipe.icon} size={18} />
        <span className="text-xs font-bold truncate">{recipe.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-xl bg-card border border-border p-2.5 shadow-soft cursor-grab active:cursor-grabbing transition-opacity ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <GripVertical size={14} className="text-muted-foreground shrink-0" />
      <RecipeIcon icon={recipe.icon} size={16} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{recipe.title}</p>
        <p className="text-[10px] text-muted-foreground">{recipe.cookTime}</p>
      </div>
    </div>
  );
}

function DroppableSlot({
  day,
  meal,
  recipe,
  onRemove,
}: {
  day: string;
  meal: string;
  recipe: Recipe | null;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotKey(day, meal),
    data: { day, meal },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[56px] rounded-xl border-2 border-dashed transition-colors p-2 ${
        isOver
          ? "border-primary bg-primary/10"
          : recipe
          ? "border-transparent bg-card shadow-soft"
          : "border-border bg-muted/30"
      }`}
    >
      {recipe ? (
        <div className="flex items-center gap-1.5">
          <RecipeIcon icon={recipe.icon} size={16} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-foreground truncate leading-tight">{recipe.title}</p>
            <p className="text-[10px] text-muted-foreground">{recipe.cookTime}</p>
          </div>
          <button
            onClick={onRemove}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-[10px] text-muted-foreground">Drop here</span>
        </div>
      )}
    </div>
  );
}

/* ── Mobile card view for a single day ── */
function DayCard({
  day,
  planned,
  removeMeal,
}: {
  day: string;
  planned: Record<string, Recipe | undefined>;
  removeMeal: (day: string, meal: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-soft p-4">
      <h4 className="text-sm font-extrabold text-foreground mb-3 gradient-warm bg-clip-text text-transparent">
        {day}
      </h4>
      <div className="space-y-2">
        {MEALS.map((meal) => {
          const key = slotKey(day, meal);
          return (
            <DroppableSlot
              key={key}
              day={day}
              meal={meal}
              recipe={planned[key] ?? null}
              onRemove={() => removeMeal(day, meal)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Recommended daily values for children (ages 4-13 average)
const DAILY_TARGETS = { calories: 1800, protein: 40, carbs: 250, fat: 60, fiber: 20 };

function NutritionSnapshot({ planned }: { planned: Record<string, Recipe | undefined> }) {
  const stats = useMemo(() => {
    const recipes = Object.values(planned).filter(Boolean) as Recipe[];
    const withNutrition = recipes.filter((r) => r.nutrition);
    if (withNutrition.length === 0) return null;

    const totals = withNutrition.reduce(
      (acc, r) => ({
        calories: acc.calories + (r.nutrition!.calories || 0),
        protein: acc.protein + (r.nutrition!.protein || 0),
        carbs: acc.carbs + (r.nutrition!.carbs || 0),
        fat: acc.fat + (r.nutrition!.fat || 0),
        fiber: acc.fiber + (r.nutrition!.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    // Count days that have at least one meal
    const daysWithMeals = new Set(
      Object.entries(planned)
        .filter(([, r]) => r)
        .map(([key]) => key.split("-")[0])
    ).size;
    const divisor = Math.max(daysWithMeals, 1);

    const dailyAvg = {
      calories: Math.round(totals.calories / divisor),
      protein: Math.round(totals.protein / divisor),
      carbs: Math.round(totals.carbs / divisor),
      fat: Math.round(totals.fat / divisor),
      fiber: Math.round(totals.fiber / divisor),
    };

    // Variety score: unique ingredients
    const uniqueIngredients = new Set<string>();
    recipes.forEach((r) => r.ingredients.forEach((ing) => uniqueIngredients.add(ing.toLowerCase().trim())));

    // Gaps / nudges
    const nudges: string[] = [];
    if (dailyAvg.fiber < DAILY_TARGETS.fiber * 0.5) nudges.push("Consider adding high-fiber options like beans, lentils, or whole grains.");
    if (dailyAvg.protein < DAILY_TARGETS.protein * 0.5) nudges.push("Protein looks low — try adding eggs, chicken, or yogurt to some meals.");
    if (uniqueIngredients.size < 15 && recipes.length >= 5) nudges.push("Try more variety — different veggies and proteins each day help nutrition.");

    return { dailyAvg, uniqueIngredients: uniqueIngredients.size, mealCount: withNutrition.length, nudges };
  }, [planned]);

  if (!stats) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-soft p-5 text-center">
        <p className="text-sm text-muted-foreground">Add meals with nutrition data to see your weekly snapshot.</p>
      </div>
    );
  }

  const bars = [
    { label: "Calories", value: stats.dailyAvg.calories, target: DAILY_TARGETS.calories, unit: "cal", icon: <Flame size={14} />, color: "gradient-warm" },
    { label: "Protein", value: stats.dailyAvg.protein, target: DAILY_TARGETS.protein, unit: "g", icon: <Beef size={14} />, color: "bg-primary" },
    { label: "Carbs", value: stats.dailyAvg.carbs, target: DAILY_TARGETS.carbs, unit: "g", icon: <Wheat size={14} />, color: "bg-primary/60" },
    { label: "Fat", value: stats.dailyAvg.fat, target: DAILY_TARGETS.fat, unit: "g", icon: <Droplets size={14} />, color: "bg-accent-foreground/50" },
    { label: "Fiber", value: stats.dailyAvg.fiber, target: DAILY_TARGETS.fiber, unit: "g", icon: <Leaf size={14} />, color: "bg-sage" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border shadow-soft p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">Nutrition Snapshot</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full gradient-sage px-3 py-1.5 text-xs font-semibold text-foreground flex items-center gap-1">
            <Apple size={12} /> {stats.uniqueIngredients} unique ingredients
          </div>
          <span className="text-xs text-muted-foreground">{stats.mealCount} meals tracked</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Daily averages based on your planned meals vs. recommended daily intake for children.</p>

      <div className="space-y-3">
        {bars.map((bar) => {
          const pct = Math.min(Math.round((bar.value / bar.target) * 100), 150);
          const isLow = pct < 40;
          const isGood = pct >= 60 && pct <= 120;
          return (
            <div key={bar.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  {bar.icon} {bar.label}
                </span>
                <span className={`font-bold ${isLow ? "text-destructive" : isGood ? "text-accent-foreground" : "text-foreground"}`}>
                  {bar.value}{bar.unit} / {bar.target}{bar.unit}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${isLow ? "bg-destructive/70" : bar.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {stats.nudges.length > 0 && (
        <div className="space-y-2">
          {stats.nudges.map((nudge, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl gradient-peach px-3 py-2.5">
              <AlertTriangle size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-foreground">{nudge}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const WeeklyPlanner = ({ onBack }: Props) => {
  const { planned, loading, setMeal, removeMeal } = useMealPlans();
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const shoppingList = useMemo(() => {
    const countMap = new Map<string, number>();
    Object.values(planned).forEach((recipe) => {
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const key = ing.toLowerCase().trim();
        countMap.set(key, (countMap.get(key) || 0) + 1);
      });
    });
    return Array.from(countMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count, display: count > 1 ? `${name} (×${count})` : name }));
  }, [planned]);

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyShoppingList = () => {
    const text = shoppingList
      .map((item) => `${checkedItems.has(item.name) ? "✓" : "☐"} ${item.display}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Shopping list copied to clipboard" });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveRecipe(event.active.data.current?.recipe ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveRecipe(null);
    const { active, over } = event;
    if (!over) return;

    const recipe: Recipe = active.data.current?.recipe;
    if (!recipe) return;

    const dropId = String(over.id);
    if (DAYS.some((d) => MEALS.some((m) => slotKey(d, m) === dropId))) {
      const [day, meal] = dropId.split("-");
      setMeal(day, meal, recipe);
    }
  };

  const filledCount = Object.keys(planned).filter((k) => planned[k]).length;
  const totalSlots = DAYS.length * MEALS.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={onBack}
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                  <CalendarDays size={22} className="text-primary" /> Weekly Meal Planner
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Drag recipes from the sidebar into your week
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="rounded-full gradient-peach px-3 py-1.5 text-xs font-semibold text-foreground">
                  {filledCount}/{totalSlots} meals
                </div>
                {filledCount > 0 && (
                  <>
                    <Button
                      onClick={() => { setShowNutrition(!showNutrition); if (!showNutrition) setShowShoppingList(false); }}
                      className={`rounded-full gap-2 text-xs ${showNutrition ? "gradient-warm text-primary-foreground shadow-warm border-0" : ""}`}
                      variant={showNutrition ? "default" : "outline"}
                      size="sm"
                    >
                      <BarChart3 size={14} />
                      Nutrition
                    </Button>
                    <Button
                      onClick={() => { setShowShoppingList(!showShoppingList); if (!showShoppingList) setShowNutrition(false); }}
                      className={`rounded-full gap-2 text-xs ${showShoppingList ? "gradient-warm text-primary-foreground shadow-warm border-0" : ""}`}
                      variant={showShoppingList ? "default" : "outline"}
                      size="sm"
                    >
                      <ShoppingCart size={14} />
                      Shopping ({shoppingList.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main content: sidebar + grid */}
          <div className="flex gap-5 flex-col lg:flex-row">
            {/* Recipe sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-52 shrink-0"
            >
              <h3 className="mb-2 text-sm font-bold text-foreground flex items-center gap-1.5">
                <UtensilsCrossed size={14} className="text-primary" /> Recipes
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1 pb-2 lg:pb-0">
                {mockRecipes.map((recipe) => (
                  <div key={recipe.id} className="shrink-0 lg:shrink">
                    <DraggableRecipe recipe={recipe} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Desktop grid view */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 hidden lg:block overflow-x-auto"
            >
              <div className="min-w-[700px]">
                {/* Day headers */}
                <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-1.5 mb-1.5">
                  <div />
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[11px] font-bold rounded-lg gradient-warm text-primary-foreground py-1.5"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Meal rows */}
                {MEALS.map((meal) => (
                  <div key={meal} className="grid grid-cols-[72px_repeat(7,1fr)] gap-1.5 mb-1.5">
                    <div className="flex items-center justify-center text-[11px] font-bold text-muted-foreground gap-1">
                      {meal === "Breakfast" ? <Sunrise size={13} /> : meal === "Lunch" ? <Sun size={13} /> : <Moon size={13} />}
                      <span className="hidden xl:inline">{meal}</span>
                    </div>
                    {DAYS.map((day) => {
                      const key = slotKey(day, meal);
                      return (
                        <DroppableSlot
                          key={key}
                          day={day}
                          meal={meal}
                          recipe={planned[key] ?? null}
                          onRemove={() => removeMeal(day, meal)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mobile card view */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAYS.map((day) => (
                <DayCard key={day} day={day} planned={planned} removeMeal={removeMeal} />
              ))}
            </div>
          </div>

          {/* Shopping List Panel — outside the flex container */}
          <AnimatePresence>
            {showShoppingList && shoppingList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="rounded-2xl bg-card border border-border shadow-soft p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={18} className="text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Shopping List</h3>
                      <span className="rounded-full gradient-peach px-2 py-0.5 text-xs font-semibold text-foreground">
                        {shoppingList.length} items
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyShoppingList} className="rounded-full gap-1">
                        <Copy size={14} /> Copy
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowShoppingList(false)} className="rounded-full h-8 w-8">
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {shoppingList.map((item) => {
                      const checked = checkedItems.has(item.name);
                      return (
                        <button
                          key={item.name}
                          onClick={() => toggleCheck(item.name)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all ${
                            checked ? "bg-muted/50 opacity-60" : "bg-muted/20 hover:bg-muted/40"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              checked ? "gradient-warm border-transparent" : "border-border"
                            }`}
                          >
                            {checked && <Check size={12} className="text-primary-foreground" />}
                          </div>
                          <span
                            className={`text-sm capitalize ${
                              checked ? "line-through text-muted-foreground" : "text-foreground font-medium"
                            }`}
                          >
                            {item.display}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {checkedItems.size > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      {checkedItems.size} of {shoppingList.length} items checked off
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DragOverlay>
        {activeRecipe ? <DraggableRecipe recipe={activeRecipe} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WeeklyPlanner;
