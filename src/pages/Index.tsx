import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useKidProfiles } from "@/hooks/useKidProfiles";
import { supabase } from "@/integrations/supabase/client";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import OnboardingKidProfile from "@/components/OnboardingKidProfile";
import OnboardingPreferences from "@/components/OnboardingPreferences";
import Dashboard from "@/components/Dashboard";
import GroceryUpload from "@/components/GroceryUpload";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import { KidProfile, Recipe } from "@/lib/types";
import { Loader2 } from "lucide-react";

type Screen = "welcome" | "kids" | "preferences" | "dashboard" | "grocery" | "planner";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";
  const { kids, loading: kidsLoading, saveKids, hasKids } = useKidProfiles();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [localKids, setLocalKids] = useState<KidProfile[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState<string>("45+ min");
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Redirect to auth if not logged in and not guest
  useEffect(() => {
    if (!authLoading && !user && !isGuest) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, isGuest, navigate]);

  // Load saved preferences for returning users
  useEffect(() => {
    const loadPrefs = async () => {
      if (!user) { setPrefsLoaded(true); return; }
      const { data } = await supabase
        .from("profiles")
        .select("cuisine_preferences, max_cooking_time")
        .eq("id", user.id)
        .single();
      if (data) {
        if (data.cuisine_preferences?.length) setCuisinePreferences(data.cuisine_preferences);
        if (data.max_cooking_time) setMaxCookingTime(data.max_cooking_time);
      }
      setPrefsLoaded(true);
    };
    if (!authLoading) loadPrefs();
  }, [user, authLoading]);

  // Skip onboarding if authenticated user already has kid profiles and prefs loaded
  useEffect(() => {
    if (!kidsLoading && hasKids && screen === "welcome" && user && prefsLoaded) {
      setLocalKids(kids);
      setScreen("dashboard");
    }
  }, [kidsLoading, hasKids, kids, screen, user, prefsLoaded]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const savePreferences = async (cuisines: string[], cookingTime: string) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ cuisine_preferences: cuisines, max_cooking_time: cookingTime })
      .eq("id", user.id);
  };

  const activeKids = localKids.length > 0 ? localKids : kids;

  if (authLoading || (!isGuest && (kidsLoading || !prefsLoaded))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user && !isGuest) return null;

  return (
    <div className="min-h-screen bg-background">
      {screen === "welcome" && (
        <OnboardingWelcome onStart={() => setScreen("kids")} />
      )}
      {screen === "kids" && (
        <OnboardingKidProfile
          onComplete={async (k) => {
            setLocalKids(k);
            if (user) await saveKids(k);
            setScreen("preferences");
          }}
          onBack={() => setScreen("welcome")}
        />
      )}
      {screen === "preferences" && (
        <OnboardingPreferences
          onComplete={(prefs) => {
            setCuisinePreferences(prefs.cuisines);
            setMaxCookingTime(prefs.cookingTime);
            savePreferences(prefs.cuisines, prefs.cookingTime);
            setScreen("dashboard");
          }}
          onBack={() => setScreen("kids")}
        />
      )}
      {screen === "dashboard" && (
        <Dashboard
          kids={activeKids}
          cuisinePreferences={cuisinePreferences}
          maxCookingTime={maxCookingTime}
          onGoToGrocery={() => setScreen("grocery")}
          onGoToPlanner={() => setScreen("planner")}
          onReset={() => setScreen("kids")}
          onSignOut={handleSignOut}
          isGuest={isGuest}
          onRecipesChange={setAiRecipes}
          initialRecipes={aiRecipes.length > 0 ? aiRecipes : undefined}
        />
      )}
      {screen === "grocery" && (
        <GroceryUpload
          onBack={() => setScreen("dashboard")}
          kids={activeKids}
          cuisinePreferences={cuisinePreferences}
          maxCookingTime={maxCookingTime}
          isGuest={isGuest}
        />
      )}
      {screen === "planner" && (
        <WeeklyPlanner
          onBack={() => setScreen("dashboard")}
          recipes={aiRecipes.length > 0 ? aiRecipes : undefined}
        />
      )}
    </div>
  );
};

export default Index;
