import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { kids, loading: kidsLoading, saveKids, hasKids } = useKidProfiles();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [localKids, setLocalKids] = useState<KidProfile[]>([]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Skip onboarding if user already has kid profiles
  useEffect(() => {
    if (!kidsLoading && hasKids && screen === "welcome") {
      setLocalKids(kids);
      setScreen("dashboard");
    }
  }, [kidsLoading, hasKids, kids, screen]);

  if (authLoading || kidsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {screen === "welcome" && (
        <OnboardingWelcome onStart={() => setScreen("kids")} />
      )}
      {screen === "kids" && (
        <OnboardingKidProfile
          onComplete={async (k) => {
            setLocalKids(k);
            await saveKids(k);
            setScreen("preferences");
          }}
          onBack={() => setScreen("welcome")}
        />
      )}
      {screen === "preferences" && (
        <OnboardingPreferences
          onComplete={() => setScreen("dashboard")}
          onBack={() => setScreen("kids")}
        />
      )}
      {screen === "dashboard" && (
        <Dashboard
          kids={localKids.length > 0 ? localKids : kids}
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
