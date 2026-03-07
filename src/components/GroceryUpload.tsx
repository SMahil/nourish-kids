import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RecipeCard from "@/components/RecipeCard";
import { mockRecipes } from "@/lib/mockData";

interface Props {
  onBack: () => void;
}

const GroceryUpload = ({ onBack }: Props) => {
  const [mode, setMode] = useState<"choose" | "text" | "results">("choose");
  const [groceryText, setGroceryText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
      setMode("results");
    }, 1500);
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">
            🛒 Grocery to Recipe
          </h1>
          <p className="text-muted-foreground">
            Tell us what you have, and we'll find recipes!
          </p>
        </motion.div>

        {mode === "choose" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode("text")}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 shadow-soft border border-border hover:shadow-warm transition-shadow"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-warm text-primary-foreground">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground">Type Your Grocery List</h3>
                <p className="text-sm text-muted-foreground">
                  Type or paste what you have at home
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("text")}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 shadow-soft border border-border hover:shadow-warm transition-shadow"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-sage text-accent-foreground">
                <Camera size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground">Upload a Photo</h3>
                <p className="text-sm text-muted-foreground">
                  Snap your fridge, pantry or grocery receipt
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {mode === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Textarea
              value={groceryText}
              onChange={(e) => setGroceryText(e.target.value)}
              placeholder="e.g. chicken, rice, broccoli, cheese, pasta, tomatoes, eggs, bread..."
              rows={6}
              className="rounded-xl bg-card border-border text-base"
            />
            <p className="text-xs text-muted-foreground">
              Separate items with commas or new lines
            </p>

            <div className="rounded-2xl gradient-peach p-4">
              <p className="text-sm text-foreground">
                💡 <strong>Tip:</strong> Include everything you have — even condiments and spices. 
                The more we know, the better recipes we can suggest!
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!groceryText.trim() || loading}
              className="w-full gradient-warm border-0 text-primary-foreground rounded-full py-6 text-lg font-bold shadow-warm hover:opacity-90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={20} className="animate-spin" /> Finding recipes...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={20} /> Find Recipes
                </span>
              )}
            </Button>
          </motion.div>
        )}

        {mode === "results" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="rounded-2xl gradient-peach p-4 mb-4">
              <p className="text-sm font-semibold text-foreground">
                🎉 Found {mockRecipes.slice(0, 4).length} recipes with your ingredients!
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => { setMode("text"); setGroceryText(""); }}
              className="rounded-full"
            >
              ← Try different groceries
            </Button>

            <div className="space-y-4 mt-4">
              {mockRecipes.slice(0, 4).map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GroceryUpload;
