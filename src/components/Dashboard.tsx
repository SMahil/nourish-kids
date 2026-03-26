import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, RefreshCw, Settings, CalendarDays, Loader2, LogOut, Filter, Heart, ShieldAlert, Clock, Bot, Timer, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/RecipeCard";
import { mockRecipes } from "@/lib/mockData";
import { KidProfile, Recipe } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  kids: KidProfile[];
  cuisinePreferences?: string[];
  maxCookingTime?: string;
  onGoToGrocery: () => void;
  onGoToPlanner: () => void;
  onReset: () => void;
  onSignOut?: () => void;
  isGuest?: boolean;
  onRecipesChange?: (recipes: Recipe[]) => void;
  initialRecipes?: Recipe[];
}

const Dashboard = ({ kids, cuisinePreferences, maxCookingTime, onGoToGrocery, onGoToPlanner, onReset, onSignOut, isGuest, onRecipesChange, initialRecipes }: Props) => {
  const kidNames = kids.map((k) => k.name || "your child").join(" & ");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes ?? []);
  const [isLoading, setIsLoading] = useState(!initialRecipes?.length);
  const [hasAiRecipes, setHasAiRecipes] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState<string | null>(
    cuisinePreferences?.length === 1 ? cuisinePreferences[0] : null
  );
  const [effectiveMaxMinutes, setEffectiveMaxMinutes] = useState<number | null>(null);
  const { toast } = useToast();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Get unique cuisines from current recipes
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    recipes.forEach((r) => { if (r.cuisine) cuisines.add(r.cuisine); });
    return Array.from(cuisines).sort();
  }, [recipes]);

  // Parse max minutes from cooking time preference
  const maxMinutes = useMemo(() => {
    if (effectiveMaxMinutes !== null) return effectiveMaxMinutes;
    if (!maxCookingTime || maxCookingTime === "45+ min") return Infinity;
    const num = parseInt(maxCookingTime);
    return isNaN(num) ? Infinity : num;
  }, [maxCookingTime, effectiveMaxMinutes]);

  // Helper to parse minutes from recipe cookTime string
  const parseMinutes = (cookTime: string): number => {
    const match = cookTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 999;
  };

  // Filtered recipes by cuisine AND cooking time
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const cuisineMatch = !activeCuisine || r.cuisine === activeCuisine;
      const timeMatch = parseMinutes(r.cookTime) <= maxMinutes;
      return cuisineMatch && timeMatch;
    });
  }, [recipes, activeCuisine, maxMinutes]);

  // Auto-fetch real recipes on mount, skip if we already have cached recipes
  useEffect(() => {
    if (!initialRecipes?.length) {
      fetchAiSuggestions();
    } else {
      setHasAiRecipes(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateRecipes = (newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    onRecipesChange?.(newRecipes);
  };

  const fetchAiSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-recipes", {
        body: { kids, cuisinePreferences, maxCookingTime },
      });

      if (error) throw error;

      if (data?.recipes && Array.isArray(data.recipes) && data.recipes.length > 0) {
        updateRecipes(data.recipes);
        setHasAiRecipes(true);
        toast({
          title: "AI recipes ready!",
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
      updateRecipes(mockRecipes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    toggleFavorite(recipe);
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
            {onSignOut && (
              <Button
                variant="outline"
                size="icon"
                onClick={onSignOut}
                className="rounded-full"
                title="Sign Out"
              >
                <LogOut size={18} />
              </Button>
            )}
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
                  <span key={`${kid.name}-fav-${f}`} className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    <Heart size={10} /> {f}
                  </span>
              )),
              ...kid.allergies.map((a) => (
                <span key={`${kid.name}-allergy-${a}`} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  <ShieldAlert size={10} /> {a}
                </span>
              )),
            ])}
          </div>
        </motion.div>

        {/* Tabs: Recipes vs Favorites */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowFavorites(false)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              !showFavorites ? "gradient-warm text-primary-foreground shadow-warm" : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {hasAiRecipes ? "AI Recipes" : "Recipes"}
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all flex items-center gap-1.5 ${
              showFavorites ? "gradient-warm text-primary-foreground shadow-warm" : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            <Heart size={14} className={showFavorites ? "fill-current" : ""} />
            Favorites {favorites.length > 0 && `(${favorites.length})`}
          </button>
        </div>

        {/* Recipe list */}
        <div className="space-y-4">
          {showFavorites ? (
            /* Favorites view */
            favorites.length > 0 ? (
              favorites.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} kids={kids} isFavorite={true} onToggleFavorite={handleToggleFavorite} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <Heart size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground text-sm font-medium">No favorites yet</p>
                <p className="text-muted-foreground text-xs mt-1">Tap the heart on any recipe to save it here.</p>
              </div>
            )
          ) : (
            /* Recipes view */
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground leading-tight">
                    Tonight's picks for {kids[0]?.name || "your child"} 🌿
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Scored for their taste profile — sorted by best match
                  </p>
                </div>
                {hasAiRecipes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAiSuggestions}
                    disabled={isLoading}
                    className="text-xs shrink-0 mt-0.5"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-muted-foreground shrink-0" />
                {maxMinutes < Infinity && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    <Timer size={12} /> &le; {maxMinutes} min
                  </span>
                )}
                {availableCuisines.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveCuisine(null)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        !activeCuisine
                          ? "gradient-warm text-primary-foreground shadow-warm"
                          : "bg-muted text-muted-foreground hover:bg-border"
                      }`}
                    >
                      All ({recipes.filter((r) => parseMinutes(r.cookTime) <= maxMinutes).length})
                    </button>
                    {availableCuisines.map((c) => {
                      const count = recipes.filter(
                        (r) => r.cuisine === c && parseMinutes(r.cookTime) <= maxMinutes
                      ).length;
                      return (
                        <button
                          key={c}
                          onClick={() => setActiveCuisine(activeCuisine === c ? null : c)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            activeCuisine === c
                              ? "gradient-warm text-primary-foreground shadow-warm"
                              : "bg-muted text-muted-foreground hover:bg-border"
                          }`}
                        >
                          {c} ({count})
                        </button>
                      );
                    })}
                  </>
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
              ) : filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe, i) => (
                  <RecipeCard key={recipe.id} recipe={recipe} index={i} kids={kids} isFavorite={isFavorite(recipe.id)} onToggleFavorite={handleToggleFavorite} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No recipes match your filters
                    {activeCuisine ? ` (${activeCuisine})` : ""}
                    {maxMinutes < Infinity ? ` under ${maxMinutes} min` : ""}.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveCuisine(null)}
                      className="text-primary text-sm font-semibold hover:underline"
                    >
                      Clear filters
                    </button>
                    {maxMinutes < 30 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEffectiveMaxMinutes(30)}
                      >
                        <Timer size={12} className="mr-1" /> Try with 30 min
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
