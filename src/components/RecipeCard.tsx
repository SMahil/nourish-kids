import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Users, ThumbsUp, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets, Leaf, Globe, Heart, ShieldCheck, ThumbsDown, Sparkles } from "lucide-react";
import { Recipe, KidProfile } from "@/lib/types";
import RecipeIcon from "@/components/RecipeIcon";

interface Props {
  recipe: Recipe;
  index: number;
  kids?: KidProfile[];
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

function computeMatchReasons(recipe: Recipe, kids: KidProfile[]): { text: string; type: "favorite" | "safe" | "respects" }[] {
  const reasons: { text: string; type: "favorite" | "safe" | "respects" }[] = [];
  const ingredientsLower = recipe.ingredients.map((i) => i.toLowerCase());
  const tagsLower = recipe.tags.map((t) => t.toLowerCase());
  const allText = [...ingredientsLower, ...tagsLower];

  for (const kid of kids) {
    const name = kid.name || "Your child";

    // Favorites matched
    for (const fav of kid.favorites) {
      if (allText.some((t) => t.includes(fav.toLowerCase()))) {
        reasons.push({ text: `Uses ${fav} — ${name}'s favorite!`, type: "favorite" });
      }
    }

    // Allergies avoided
    for (const allergy of kid.allergies) {
      if (!allText.some((t) => t.includes(allergy.toLowerCase()))) {
        reasons.push({ text: `${allergy}-free — safe for ${name}`, type: "safe" });
      }
    }

    // Dislikes avoided
    for (const dislike of kid.dislikes) {
      if (!allText.some((t) => t.includes(dislike.toLowerCase()))) {
        reasons.push({ text: `No ${dislike} — respects ${name}'s taste`, type: "respects" });
      }
    }
  }

  // Deduplicate and limit
  const seen = new Set<string>();
  return reasons.filter((r) => {
    if (seen.has(r.text)) return false;
    seen.add(r.text);
    return true;
  }).slice(0, 4);
}

const reasonStyles = {
  favorite: "bg-accent/20 text-accent-foreground",
  safe: "bg-sage/20 text-foreground",
  respects: "bg-peach text-foreground",
};

const reasonIcons = {
  favorite: <Heart size={10} className="shrink-0" />,
  safe: <ShieldCheck size={10} className="shrink-0" />,
  respects: <ThumbsDown size={10} className="shrink-0" />,
};

const RecipeCard = ({ recipe, index, kids }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const matchReasons = useMemo(() => {
    // Prefer AI-generated match reasons
    if (recipe.matchReasons && recipe.matchReasons.length > 0) {
      return recipe.matchReasons.map((text) => ({ text, type: "favorite" as const }));
    }
    // Compute locally from kid profiles
    if (kids && kids.length > 0) {
      return computeMatchReasons(recipe, kids);
    }
    return [];
  }, [recipe, kids]);

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
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent-foreground" title="How well this recipe matches your kids' preferences">
              <Sparkles size={14} />
              <span>{recipe.kidApproval}% match</span>
            </div>
          </div>
        </div>

        {/* Match reasons pills */}
        {matchReasons.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {matchReasons.map((reason, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${reasonStyles[reason.type]}`}
              >
                {reasonIcons[reason.type]}
                {reason.text}
              </span>
            ))}
          </div>
        )}

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
