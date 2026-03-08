import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Recipe } from "@/lib/types";

type PlannedMeals = Record<string, Recipe | null>;

export function useMealPlans() {
  const { user } = useAuth();
  const [planned, setPlanned] = useState<PlannedMeals>({});
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      const meals: PlannedMeals = {};
      data.forEach((row: any) => {
        meals[`${row.day}-${row.meal}`] = row.recipe_data as Recipe;
      });
      setPlanned(meals);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const setMeal = async (day: string, meal: string, recipe: Recipe) => {
    const key = `${day}-${meal}`;
    setPlanned((prev) => ({ ...prev, [key]: recipe }));

    if (!user) return; // guest mode: local state only
    await supabase.from("meal_plans").upsert(
      {
        user_id: user.id,
        day,
        meal,
        recipe_data: recipe as any,
      },
      { onConflict: "user_id,day,meal,week_start" }
    );
  };

  const removeMeal = async (day: string, meal: string) => {
    setPlanned((prev) => {
      const next = { ...prev };
      delete next[`${day}-${meal}`];
      return next;
    });

    if (!user) return; // guest mode: local state only
    await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("day", day)
      .eq("meal", meal);
  };

  return { planned, loading, setMeal, removeMeal, refetch: fetchPlans };
}
