import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cuisineOptions } from "@/lib/mockData";

interface Props {
  onComplete: (prefs: { cookingTime: string; skillLevel: string; cuisines: string[] }) => void;
  onBack: () => void;
}

const ToggleChip = ({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
      selected
        ? "gradient-warm text-primary-foreground shadow-warm"
        : "bg-muted text-muted-foreground hover:bg-border"
    }`}
  >
    {label}
  </button>
);

const OnboardingPreferences = ({ onComplete, onBack }: Props) => {
  const [cookingTime, setCookingTime] = useState("15 min");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [cuisines, setCuisines] = useState<string[]>([]);

  const toggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <h2 className="mb-2 text-2xl font-bold text-foreground">Almost there! 🎉</h2>
        <p className="mb-8 text-muted-foreground">A few more preferences to personalize your experience.</p>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              h time do you usually have?
            </label>
            <div className="flex flex-wrap gap-2">
              {["5 min", "15 min", "30 min", "45+ min"].map((t) => (
                <ToggleChip key={t} label={t} selected={cookingTime === t} onToggle={() => setCookingTime(t)} />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              👨‍🍳 Your cooking skill level
            </label>
            <div className="flex flex-wrap gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((s) => (
                <ToggleChip key={s} label={s} selected={skillLevel === s} onToggle={() => setSkillLevel(s)} />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              🌍 Cuisine preferences (select any)
            </label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((c) => (
                <ToggleChip key={c} label={c} selected={cuisines.includes(c)} onToggle={() => toggleCuisine(c)} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 rounded-full">
            Back
          </Button>
          <Button
            onClick={() => onComplete({ cookingTime, skillLevel, cuisines })}
            className="flex-1 gradient-warm border-0 text-primary-foreground rounded-full shadow-warm hover:opacity-90"
          >
            See My Recipes 🍽�    </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPreferences;
