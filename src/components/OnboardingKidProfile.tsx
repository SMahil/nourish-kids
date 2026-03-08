import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KidProfile } from "@/lib/types";
import { commonAllergies, commonDislikes, commonFavorites } from "@/lib/mockData";
import { Plus, X } from "lucide-react";

interface Props {
  onComplete: (kids: KidProfile[]) => void;
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

const emptyKid: KidProfile = {
  name: "",
  age: "",
  allergies: [],
  dislikes: [],
  favorites: [],
  dietType: "None",
};

const OnboardingKidProfile = ({ onComplete, onBack }: Props) => {
  const [kids, setKids] = useState<KidProfile[]>([{ ...emptyKid }]);
  const [activeKid, setActiveKid] = useState(0);
  const [step, setStep] = useState(0); // 0=basics, 1=allergies, 2=dislikes, 3=favorites

  const current = kids[activeKid];

  const updateKid = (updates: Partial<KidProfile>) => {
    setKids((prev) =>
      prev.map((k, i) => (i === activeKid ? { ...k, ...updates } : k))
    );
  };

  const toggleArray = (field: "allergies" | "dislikes" | "favorites", value: string) => {
    const arr = current[field];
    updateKid({
      [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  const addKid = () => {
    setKids((prev) => [...prev, { ...emptyKid }]);
    setActiveKid(kids.length);
    setStep(0);
  };

  const removeKid = (index: number) => {
    if (kids.length <= 1) return;
    setKids((prev) => prev.filter((_, i) => i !== index));
    setActiveKid(Math.max(0, activeKid - 1));
  };

  const steps = [
    {
      title: "Tell us about your child",
      content: (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Name</label>
            <Input
              value={current.name}
              onChange={(e) => updateKid({ name: e.target.value })}
              placeholder="e.g. Emma"
              className="rounded-xl bg-card border-border"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Age</label>
            <Input
              value={current.age}
              onChange={(e) => updateKid({ age: e.target.value })}
              placeholder="e.g. 5"
              type="number"
              className="rounded-xl bg-card border-border"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Diet Type</label>
            <div className="flex flex-wrap gap-2">
              {["None", "Vegetarian", "Vegan", "Halal", "Kosher"].map((d) => (
                <ToggleChip
                  key={d}
                  label={d}
                  selected={current.dietType === d}
                  onToggle={() => updateKid({ dietType: d })}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Any allergies?",
      content: (
        <div className="flex flex-wrap gap-2">
          {commonAllergies.map((a) => (
            <ToggleChip
              key={a}
              label={a}
              selected={current.allergies.includes(a)}
              onToggle={() => toggleArray("allergies", a)}
            />
          ))}
        </div>
      ),
    },
    {
      title: "What do they NOT like? 😬",
      content: (
        <div className="flex flex-wrap gap-2">
          {commonDislikes.map((d) => (
            <ToggleChip
              key={d}
              label={d}
              selected={current.dislikes.includes(d)}
              onToggle={() => toggleArray("dislikes", d)}
            />
          ))}
        </div>
      ),
    },
    {
      title: "What do they LOVE? 😍",
      content: (
        <div className="flex flex-wrap gap-2">
          {commonFavorites.map((f) => (
            <ToggleChip
              key={f}
              label={f}
              selected={current.favorites.includes(f)}
              onToggle={() => toggleArray("favorites", f)}
            />
          ))}
        </div>
      ),
    },
  ];

  const isLastStep = step === steps.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <motion.div
        key={`${activeKid}-${step}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Kid tabs */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {kids.map((kid, i) => (
            <button
              key={i}
              onClick={() => { setActiveKid(i); setStep(0); }}
              className={`relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                i === activeKid
                  ? "gradient-warm text-primary-foreground shadow-warm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {kid.name || `Child ${i + 1}`}
              {kids.length > 1 && (
                <X
                  size={14}
                  className="ml-1 opacity-60 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); removeKid(i); }}
                />
              )}
            </button>
          ))}
          <button
            onClick={addKid}
            className="flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-border transition-colors"
          >
            <Plus size={14} /> Add child
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "gradient-warm" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground">{steps[step].title}</h2>
        {steps[step].content}

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={() => (step > 0 ? setStep(step - 1) : onBack())}
            className="flex-1 rounded-full"
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (isLastStep) {
                onComplete(kids);
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 gradient-warm border-0 text-primary-foreground rounded-full shadow-warm hover:opacity-90"
          >
            {isLastStep ? "Done ✓" : "Next →"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingKidProfile;
