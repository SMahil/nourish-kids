import { motion } from "framer-motion";
import { Sparkles, Upload, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/RecipeCard";
import { mockRecipes } from "@/lib/mockData";
import { KidProfile } from "@/lib/types";

interface Props {
  kids: KidProfile[];
  onGoToGrocery: () => void;
  onReset: () => void;
}

const Dashboard = ({ kids, onGoToGrocery, onReset }: Props) => {
  const kidNames = kids.map((k) => k.name || "your child").join(" & ");

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">NourishKids</h1>
            <p className="text-sm text-muted-foreground">Meals for {kidNames}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="rounded-full"
              title="Edit Preferences"
            >
              <Settings size={18} />
            </Button>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 rounded-2xl gradient-warm p-5 text-primary-foreground shadow-warm hover:opacity-90 transition-opacity"
            onClick={() => {}}
          >
            <Sparkles size={24} />
            <span className="text-sm font-bold">AI Suggestions</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 rounded-2xl gradient-sage p-5 text-accent-foreground shadow-soft hover:opacity-90 transition-opacity"
            onClick={onGoToGrocery}
          >
            <Upload size={24} />
            <span className="text-sm font-bold">From Groceries</span>
          </motion.button>
        </div>

        {/* Preferences summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-2xl gradient-peach p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Based on preferences</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kids.flatMap((kid) => [
              ...kid.favorites.map((f) => (
                <span key={`${kid.name}-fav-${f}`} className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                  ❤️ {f}
                </span>
              )),
              ...kid.allergies.map((a) => (
                <span key={`${kid.name}-allergy-${a}`} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  🚫 {a}
                </span>
              )),
            ])}
          </div>
        </motion.div>

        {/* Recipe list */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            ✨ Recommended for today
          </h2>
          {mockRecipes.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
