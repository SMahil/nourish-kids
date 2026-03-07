import { useState } from "react";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import OnboardingKidProfile from "@/components/OnboardingKidProfile";
import OnboardingPreferences from "@/components/OnboardingPreferences";
import Dashboard from "@/components/Dashboard";
import GroceryUpload from "@/components/GroceryUpload";
import { KidProfile } from "@/lib/types";

type Screen = "welcome" | "kids" | "preferences" | "dashboard" | "grocery";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [kids, setKids] = useState<KidProfile[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {screen === "welcome" && (
        <OnboardingWelcome onStart={() => setScreen("kids")} />
      )}
      {screen === "kids" && (
        <OnboardingKidProfile
          onComplete={(k) => {
            setKids(k);
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
          kids={kids}
          onGoToGrocery={() => setScreen("grocery")}
          onReset={() => setScreen("welcome")}
        />
      )}
      {screen === "grocery" && (
        <GroceryUpload onBack={() => setScreen("dashboard")} />
      )}
    </div>
  );
};

export default Index;
