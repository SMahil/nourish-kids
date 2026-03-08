import { useState } from "react";
import { motion } from "framer-motion";
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
import { ArrowLeft, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { mockRecipes } from "@/lib/mockData";
import { Recipe } from "@/lib/types";
import { useMealPlans } from "@/hooks/useMealPlans";

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
        <span className="text-lg">{recipe.emoji}</span>
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
      <span className="text-lg">{recipe.emoji}</span>
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
      className={`relative min-h-[60px] rounded-xl border-2 border-dashed transition-colors p-2 ${
        isOver
          ? "border-primary bg-primary/10"
          : recipe
          ? "border-transparent bg-card shadow-soft"
          : "border-border bg-muted/30"
      }`}
    >
      {recipe ? (
        <div className="flex items-center gap-2">
          <span className="text-lg">{recipe.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{recipe.title}</p>
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

const WeeklyPlanner = ({ onBack }: Props) => {
  const { planned, loading, setMeal, removeMeal } = useMealPlans();
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

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

  const filledCount = Object.keys(planned).filter(k => planned[k]).length;
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
      <div className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">📅 Weekly Meal Planner</h1>
                <p className="text-sm text-muted-foreground">
                  Drag recipes from the sidebar into your week
                </p>
              </div>
              <div className="rounded-full gradient-peach px-4 py-2 text-sm font-semibold text-foreground">
                {filledCount}/{totalSlots} meals planned
              </div>
            </div>
          </motion.div>

          <div className="flex gap-6 flex-col lg:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-56 shrink-0"
            >
              <h3 className="mb-3 text-sm font-bold text-foreground">🍽️ Recipes</h3>
              <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
                {mockRecipes.map((recipe) => (
                  <DraggableRecipe key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 overflow-x-auto"
            >
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2">
                  <div />
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-bold text-foreground rounded-xl gradient-warm text-primary-foreground py-2"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>

                {MEALS.map((meal) => (
                  <div key={meal} className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2">
                    <div className="flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {meal === "Breakfast" ? "🌅" : meal === "Lunch" ? "☀️" : "🌙"}{" "}
                      {meal}
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
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeRecipe ? <DraggableRecipe recipe={activeRecipe} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WeeklyPlanner;
