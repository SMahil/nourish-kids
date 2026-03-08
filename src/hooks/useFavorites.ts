import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Recipe } from "@/lib/types";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("favorite_recipes")
      .select("recipe_id, recipe_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const recipes = data.map((row: any) => row.recipe_data as Recipe);
      setFavorites(recipes);
      setFavoriteIds(new Set(data.map((row: any) => row.recipe_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (recipe: Recipe) => {
    if (!user) return;

    const isFav = favoriteIds.has(recipe.id);

    if (isFav) {
      // Remove
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(recipe.id);
        return next;
      });
      setFavorites((prev) => prev.filter((r) => r.id !== recipe.id));

      await supabase
        .from("favorite_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.id);
    } else {
      // Add
      setFavoriteIds((prev) => new Set(prev).add(recipe.id));
      setFavorites((prev) => [recipe, ...prev]);

      await supabase.from("favorite_recipes").insert({
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_data: recipe as any,
      });
    }
  };

  const isFavorite = (recipeId: string) => favoriteIds.has(recipeId);

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
}
