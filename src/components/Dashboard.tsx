import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, RefreshCw, Settings, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/RecipeCard";
import { mockRecipes } from "@/lib/mockData";
import { KidProfile, Recipe } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  kids: KidProfile[];
  onGoToGrocery: () => void;
  onGoToPlanner: () => void;
  onReset: () => void;
}

const Dashboard = ({ kids, onGoToGrocery, onGoToPlanner, onReset }: Props) => {
  const kidNames = kids.map((k) => k.name || "your child").join(" & ");
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAiRecipes, setHasAiRecipes] = useState(false);
  const { toast } = useToast();

  const fetchAiSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-recipes", {
        body: { kids },
      });

      if (error) throw error;

      if (data?.recipes && Array.isArray(data.recipes) && data.recipes.length > 0) {
        setRecipes(data.recipes);
        setHasAiRecipes(true);
        toast({
          title: "✨ AI recipes ready!",
          description: `${data.recipes.length} personalized meals for ${kidNames}`,
        });
      } else {
        throw new Error("No recipes returned");
      }
    } catch (err: any) {
      console.error("AI suggestion error:", err);
      const msg = err?.message || "Something went wrong";
      toast({
        title: "Couldn't fetch AI recipes",
        description: msg.includes("429")
          ? "Rate limit reached — try again in a moment."
          : msg.includes("402")
            ? "AI credits exhausted. Top up in Settings."
            : "Using curated suggestions instead.",
        variant: "destructive",
      });
      setRecipes(mockRecipes);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="mb-8 grid grid-cols-3 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 rounded-2xl gradient-warm p-5 text-primary-foreground shadow-warm hover:opacity-90 transition-opacity"
            onClick={fetchAiSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Sparkles size={24} />
            )}
            <span className="text-sm font-bold">
              {isLoading ? "Thinking…" : "AI Suggestions"}
            </span>
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

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2 rounded-2xl bg-secondary p-5 text-secondary-foreground shadow-soft hover:opacity-90 transition-opacity"
            onClick={onGoToPlanner}
          >
            <CalendarDays size={24} />
            <span className="text-sm font-bold">Week Plan</span>
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {hasAiRecipes ? "🤖 AI-Personalized for your kids" : "✨ Recommended for today"}
            </h2>
            {hasAiRecipes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchAiSuggestions}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            recipes.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
