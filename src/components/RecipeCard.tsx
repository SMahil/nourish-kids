import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, ThumbsUp, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets, Leaf, Globe } from "lucide-react";
import { Recipe } from "@/lib/types";
import RecipeIcon from "@/components/RecipeIcon";

interface Props {
  recipe: Recipe;
  index: number;
}

const NutritionBar = ({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: React.ReactNode }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-16 shrink-0 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-[10px] font-bold text-foreground w-8 text-right">{value}g</span>
    </div>
  );
};

const RecipeCard = ({ recipe, index }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="overflow-hidden rounded-2xl bg-card shadow-soft border border-border"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <RecipeIcon icon={recipe.icon} size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{recipe.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {recipe.cookTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> {recipe.servings}
                </span>
                {recipe.cuisine && (
                  <span className="flex items-center gap-1">
                    <Globe size={14} /> {recipe.cuisine}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent">
            <ThumbsUp size={14} />
            {recipe.kidApproval}%
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-peach px-3 py-1 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition summary bar */}
        {recipe.nutrition && (
          <div className="mb-3 flex items-center gap-3 rounded-xl gradient-peach px-3 py-2">
            <Flame size={14} className="text-primary shrink-0" />
            <span className="text-xs font-bold text-foreground">
              {recipe.nutrition.calories} cal
            </span>
            <span className="text-[10px] text-muted-foreground">
              P {recipe.nutrition.protein}g · C {recipe.nutrition.carbs}g · F {recipe.nutrition.fat}g
            </span>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "Hide details" : "View recipe"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-4"
          >
            {/* Nutrition chart */}
            {recipe.nutrition && (
              <div className="rounded-xl bg-muted/20 p-3 space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1">
                  <Flame size={14} className="text-primary" /> Nutrition per serving
                </h4>
                <NutritionBar label="Protein" value={recipe.nutrition.protein} max={30} color="gradient-warm" icon={<Beef size={10} />} />
                <NutritionBar label="Carbs" value={recipe.nutrition.carbs} max={60} color="bg-primary/60" icon={<Wheat size={10} />} />
                <NutritionBar label="Fat" value={recipe.nutrition.fat} max={25} color="bg-accent-foreground/50" icon={<Droplets size={10} />} />
                <NutritionBar label="Fiber" value={recipe.nutrition.fiber} max={10} color="bg-sage" icon={<Leaf size={10} />} />
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-bold text-foreground">Ingredients</h4>
              <ul className="grid grid-cols-2 gap-1">
                {recipe.ingredients.map((ing) => (
                  <li key={ing} className="text-sm text-muted-foreground">
                    • {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold text-foreground">Steps</h4>
              <ol className="space-y-2">
                {recipe.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-warm text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RecipeCard;
