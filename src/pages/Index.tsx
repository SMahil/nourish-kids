import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useKidProfiles } from "@/hooks/useKidProfiles";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import OnboardingKidProfile from "@/components/OnboardingKidProfile";
import OnboardingPreferences from "@/components/OnboardingPreferences";
import Dashboard from "@/components/Dashboard";
import GroceryUpload from "@/components/GroceryUpload";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import { KidProfile } from "@/lib/types";
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

  // Redirect to auth if not logged in and not guest
  useEffect(() => {
    if (!authLoading && !user && !isGuest) {
      navigate("/auth");
    }
  }, [authLoading, user, isGuest, navigate]);

  // Skip onboarding if authenticated user already has kid profiles
  useEffect(() => {
    if (!kidsLoading && hasKids && screen === "welcome" && user) {
      setLocalKids(kids);
      setScreen("dashboard");
    }
  }, [kidsLoading, hasKids, kids, screen, user]);

  if (authLoading || (!isGuest && kidsLoading)) {
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
            setScreen("dashboard");
          }}
          onBack={() => setScreen("kids")}
        />
      )}
      {screen === "dashboard" && (
        <Dashboard
          kids={localKids.length > 0 ? localKids : kids}
          cuisinePreferences={cuisinePreferences}
          maxCookingTime={maxCookingTime}
          onGoToGrocery={() => setScreen("grocery")}
          onGoToPlanner={() => setScreen("planner")}
          onReset={() => setScreen("kids")}
          onSignOut={signOut}
        />
      )}
      {screen === "grocery" && (
        <GroceryUpload onBack={() => setScreen("dashboard")} />
      )}
      {screen === "planner" && (
        <WeeklyPlanner onBack={() => setScreen("dashboard")} />
      )}
    </div>
  );
};

export default Index;
