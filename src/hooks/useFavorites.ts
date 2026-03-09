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
      const localFavs = localStorage.getItem("guest_favorites");
      if (localFavs) {
        try {
          const parsed = JSON.parse(localFavs) as Recipe[];
          setFavorites(parsed);
          setFavoriteIds(new Set(parsed.map((r) => r.id)));
        } catch (e) {
          console.error("Failed to parse local favorites", e);
        }
      } else {
        setFavorites([]);
        setFavoriteIds(new Set());
      }
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
    const isFav = favoriteIds.has(recipe.id);

    if (!user) {
      // LocalStorage logic for guest users
      if (isFav) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(recipe.id);
          return next;
        });
        setFavorites((prev) => {
          const next = prev.filter((r) => r.id !== recipe.id);
          localStorage.setItem("guest_favorites", JSON.stringify(next));
          return next;
        });
      } else {
        setFavoriteIds((prev) => new Set(prev).add(recipe.id));
        setFavorites((prev) => {
          const next = [recipe, ...prev];
          localStorage.setItem("guest_favorites", JSON.stringify(next));
          return next;
        });
      }
      return;
    }

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
