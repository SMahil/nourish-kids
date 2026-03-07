import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { Recipe } from "@/lib/types";

interface Props {
  recipe: Recipe;
  index: number;
}

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
            <span className="text-3xl">{recipe.emoji}</span>
            <div>
              <h3 className="text-lg font-bold text-foreground">{recipe.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {recipe.cookTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> {recipe.servings}
                </span>
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
