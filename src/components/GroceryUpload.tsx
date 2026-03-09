import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, FileText, Sparkles, Loader2, Image, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RecipeCard from "@/components/RecipeCard";
import { KidProfile, Recipe } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  onBack: () => void;
  kids?: KidProfile[];
  cuisinePreferences?: string[];
  maxCookingTime?: string;
  isGuest?: boolean;
}

type Mode = "choose" | "photo" | "text" | "extracting" | "loading" | "results";

const GroceryUpload = ({ onBack, kids = [], cuisinePreferences, maxCookingTime, isGuest }: Props) => {
  const [mode, setMode] = useState<Mode>("choose");
  const [groceryText, setGroceryText] = useState("");
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = (recipe: Recipe) => {
    if (isGuest) {
      toast({ title: "Sign up to save favorites", description: "Create a free account to keep your favourite recipes." });
      return;
    }
    toggleFavorite(recipe);
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix — keep only base64 portion
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setMode("extracting");

    try {
      const imageBase64 = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      const { data, error } = await supabase.functions.invoke("extract-ingredients", {
        body: { imageBase64, mimeType },
      });

      if (error) throw error;

      const ingredients: string[] = data?.ingredients || [];
      if (ingredients.length === 0) throw new Error("No ingredients found in the image.");

      // Pre-fill the text area and switch to text mode for review
      setGroceryText(ingredients.join(", "));
      setMode("text");
      toast({
        title: `Found ${ingredients.length} ingredients!`,
        description: "Review them below and tap Find Recipes.",
      });
    } catch (err: any) {
      console.error("Extract error:", err);
      toast({
        title: "Couldn't read the photo",
        description: err?.message || "Try typing your ingredients instead.",
        variant: "destructive",
      });
      setPhotoPreview(null);
      setMode("text");
    }
  };

  const handleSubmit = async () => {
    const rawItems = groceryText
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawItems.length === 0) return;

    setMode("loading");

    try {
      const { data, error } = await supabase.functions.invoke("suggest-recipes", {
        body: {
          kids,
          cuisinePreferences,
          maxCookingTime,
          groceryItems: rawItems,
        },
      });

      if (error) throw error;

      if (data?.recipes && Array.isArray(data.recipes) && data.recipes.length > 0) {
        setSuggestedRecipes(data.recipes);
        setMode("results");
      } else {
        throw new Error("No recipes returned");
      }
    } catch (err: any) {
      console.error("Recipe suggestion error:", err);
      toast({
        title: "Couldn't find recipes",
        description: err?.message?.includes("429")
          ? "Rate limit reached — try again in a moment."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setMode("text");
    }
  };

  const reset = () => {
    setMode("choose");
    setGroceryText("");
    setPhotoPreview(null);
    setSuggestedRecipes([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">🛒 Grocery to Recipe</h1>
          <p className="text-muted-foreground">Tell us what you have, and AI will find recipes!</p>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <AnimatePresence mode="wait">
          {/* CHOOSE MODE */}
          {mode === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <button
                onClick={() => setMode("text")}
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 shadow-soft border border-border hover:shadow-warm transition-all text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-warm text-primary-foreground">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Type Your Grocery List</h3>
                  <p className="text-sm text-muted-foreground">Type or paste what you have at home</p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 shadow-soft border border-border hover:shadow-warm transition-all text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-sage text-accent-foreground">
                  <Camera size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Snap a Photo</h3>
                  <p className="text-sm text-muted-foreground">Photo of your fridge, pantry, or receipt — AI extracts ingredients automatically</p>
                </div>
              </button>
            </motion.div>
          )}

          {/* EXTRACTING MODE */}
          {mode === "extracting" && (
            <motion.div key="extracting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
              {photoPreview && (
                <div className="overflow-hidden rounded-2xl border border-border shadow-soft max-h-64">
                  <img src={photoPreview} alt="Uploaded" className="w-full object-cover" />
                </div>
              )}
              <div className="rounded-2xl gradient-peach p-6 space-y-3">
                <Loader2 size={32} className="animate-spin mx-auto text-primary" />
                <p className="font-bold text-foreground">AI is scanning your photo…</p>
                <p className="text-sm text-muted-foreground">Identifying ingredients from the image</p>
              </div>
            </motion.div>
          )}

          {/* TEXT MODE */}
          {mode === "text" && (
            <motion.div key="text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {photoPreview && (
                <div className="flex items-center gap-3 rounded-xl gradient-sage px-4 py-3">
                  <CheckCircle2 size={18} className="text-accent-foreground shrink-0" />
                  <p className="text-sm font-semibold text-foreground">Ingredients extracted from photo — review and edit below.</p>
                </div>
              )}

              <Textarea
                value={groceryText}
                onChange={(e) => setGroceryText(e.target.value)}
                placeholder="e.g. chicken, rice, broccoli, cheese, pasta, tomatoes, eggs, bread..."
                rows={6}
                className="rounded-xl bg-card border-border text-base"
              />
              <p className="text-xs text-muted-foreground">Separate items with commas or new lines</p>

              <div className="rounded-2xl gradient-peach p-4">
                <p className="text-sm text-foreground">
                  💡 <strong>Tip:</strong> Include everything you have — even condiments and spices.
                  The more we know, the better recipes we can suggest!
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={reset} className="rounded-full gap-2">
                  <RotateCcw size={14} /> Start over
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!groceryText.trim()}
                  className="flex-1 gradient-warm border-0 text-primary-foreground rounded-full py-6 text-lg font-bold shadow-warm hover:opacity-90"
                >
                  <Sparkles size={20} className="mr-2" /> Find Recipes
                </Button>
              </div>
            </motion.div>
          )}

          {/* LOADING MODE */}
          {mode === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl gradient-peach p-6 text-center space-y-3">
                <Sparkles size={32} className="animate-pulse mx-auto text-primary" />
                <p className="font-bold text-foreground">Finding recipes with your ingredients…</p>
                <p className="text-sm text-muted-foreground">AI is personalizing results for {kids.map(k => k.name || "your child").join(" & ") || "your family"}</p>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-border p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULTS MODE */}
          {mode === "results" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl gradient-sage p-4">
                <p className="text-sm font-semibold text-foreground">
                  🎉 Found {suggestedRecipes.length} recipes with your ingredients!
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={reset} className="rounded-full gap-2">
                  <RotateCcw size={14} /> Try different groceries
                </Button>
                <Button variant="outline" onClick={() => setMode("text")} className="rounded-full gap-2">
                  ✏️ Edit list
                </Button>
              </div>

              <div className="space-y-4">
                {suggestedRecipes.map((recipe, i) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={i}
                    kids={kids}
                    isFavorite={isFavorite(recipe.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroceryUpload;
