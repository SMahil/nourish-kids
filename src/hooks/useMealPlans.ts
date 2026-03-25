import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Recipe } from "@/lib/types";

type PlannedMeals = Record<string, Recipe | null>;
type GuestPlansByWeek = Record<string, PlannedMeals>;

export type AcceptanceStatus = "accepted" | "rejected";
export type AcceptanceMap = Record<string, AcceptanceStatus>;

const ACCEPTANCE_KEY = "nourish_meal_acceptance";

const loadAcceptanceStore = (): Record<string, AcceptanceMap> => {
  try {
    const raw = localStorage.getItem(ACCEPTANCE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAcceptanceStore = (store: Record<string, AcceptanceMap>) => {
  try {
    localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify(store));
  } catch {}
};

const getWeekStartDate = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = (day + 6) % 7; // Monday-based week
  start.setDate(start.getDate() - diff);
  return start;
};

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useMealPlans() {
  const { user } = useAuth();
  const [planned, setPlanned] = useState<PlannedMeals>({});
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStartDate(new Date()));
  const guestPlansRef = useRef<GuestPlansByWeek>({});

  // Meal acceptance state — persisted in localStorage
  const [acceptance, setAcceptanceState] = useState<AcceptanceMap>(() => {
    const iso = toDateString(getWeekStartDate(new Date()));
    return loadAcceptanceStore()[iso] ?? {};
  });

  const weekStartIso = useMemo(() => toDateString(weekStart), [weekStart]);

  const fetchPlans = useCallback(async () => {
    setLoading(true);

    if (!user) {
      setPlanned(guestPlansRef.current[weekStartIso] ?? {});
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .select("day,meal,recipe_data")
      .eq("user_id", user.id)
      .eq("week_start", weekStartIso);

    if (error) {
      console.error("Failed to fetch meal plans:", error.message);
      setPlanned({});
      setLoading(false);
      return;
    }

    const meals: PlannedMeals = {};
    (data ?? []).forEach((row: any) => {
      meals[`${row.day}-${row.meal}`] = row.recipe_data as Recipe;
    });
    setPlanned(meals);
    setLoading(false);
  }, [user, weekStartIso]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const setMeal = async (day: string, meal: string, recipe: Recipe) => {
    const key = `${day}-${meal}`;

    if (!user) {
      setPlanned((prev) => {
        const next = { ...prev, [key]: recipe };
        guestPlansRef.current[weekStartIso] = next;
        return next;
      });
      return;
    }

    setPlanned((prev) => ({ ...prev, [key]: recipe }));

    const { error } = await supabase.from("meal_plans").upsert(
      {
        user_id: user.id,
        day,
        meal,
        week_start: weekStartIso,
        recipe_data: recipe as any,
      },
      { onConflict: "user_id,day,meal,week_start" }
    );

    if (error) {
      console.error("Failed to save meal plan:", error.message);
      fetchPlans();
    }
  };

  const removeMeal = async (day: string, meal: string) => {
    const key = `${day}-${meal}`;

    if (!user) {
      setPlanned((prev) => {
        const next = { ...prev };
        delete next[key];
        guestPlansRef.current[weekStartIso] = next;
        return next;
      });
      return;
    }

    setPlanned((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("week_start", weekStartIso)
      .eq("day", day)
      .eq("meal", meal);

    if (error) {
      console.error("Failed to remove meal plan:", error.message);
      fetchPlans();
    }
  };

  // Reload acceptance data when navigating weeks
  useEffect(() => {
    setAcceptanceState(loadAcceptanceStore()[weekStartIso] ?? {});
  }, [weekStartIso]);

  const setAcceptance = useCallback(
    (day: string, meal: string, status: AcceptanceStatus | null) => {
      const key = `${day}-${meal}`;
      setAcceptanceState((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[key];
        } else {
          next[key] = status;
        }
        const store = loadAcceptanceStore();
        if (Object.keys(next).length === 0) {
          delete store[weekStartIso];
        } else {
          store[weekStartIso] = next;
        }
        saveAcceptanceStore(store);
        return next;
      });
    },
    [weekStartIso]
  );

  const goToPreviousWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const goToNextWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const goToCurrentWeek = () => {
    setWeekStart(getWeekStartDate(new Date()));
  };

  return {
    planned,
    loading,
    setMeal,
    removeMeal,
    refetch: fetchPlans,
    weekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    acceptance,
    setAcceptance,
  };
}
