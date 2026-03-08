import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { kids, cuisinePreferences, maxCookingTime } = await req.json();

    // Parse numeric time limit
    let timeLimit = 999;
    if (maxCookingTime && maxCookingTime !== "45+ min") {
      const parsed = parseInt(maxCookingTime);
      if (!isNaN(parsed)) timeLimit = parsed;
    }

    const kidDescriptions = kids
      .map(
        (k: any) =>
          `${k.name || "Child"} (age ${k.age || "unknown"}): favorites=[${k.favorites?.join(", ")}], allergies=[${k.allergies?.join(", ")}], dislikes=[${k.dislikes?.join(", ")}], diet=${k.dietType || "none"}`
      )
      .join("\n");

    const cuisineNote = cuisinePreferences?.length
      ? `STRICT cuisine filter: ONLY return recipes from these cuisines: ${cuisinePreferences.join(", ")}. Do NOT include any other cuisines.`
      : "";

    const timeNote = timeLimit < 999
      ? `CRITICAL TIME CONSTRAINT: Every single recipe MUST take ${timeLimit} minutes or less total (prep + cook). The "cookTime" field MUST be formatted exactly as "X min" where X is a number ≤ ${timeLimit}. For example: "10 min", "15 min". Do NOT return any recipe that takes more than ${timeLimit} minutes. Focus on quick recipes like stir-fries, salads, wraps, smoothies, instant noodles, sandwiches, quick rice dishes, etc.`
      : "";

    const systemPrompt = `You are a kid-friendly recipe expert who finds REAL recipes from popular cooking websites and blogs.
Your job is to suggest 6 real, well-known recipes that actually exist online — not invented ones.
Each recipe must avoid the listed allergies, respect dislikes, and incorporate favorites when possible.
${cuisineNote}
${timeNote}
Include estimated nutrition info per serving (calories, protein, carbs, fat, fiber in grams).
Tag each recipe with its cuisine type.
For each recipe, include a "matchReasons" array of 2-3 short strings explaining WHY this recipe is a good match for the specific kids. Reference their names and preferences. Examples: "Uses chicken — Maya's favorite!", "Nut-free — safe for Liam", "No broccoli — respects Ava's taste".
Return recipes as a JSON array using the exact schema — no markdown, no extra text.`;

    const userPrompt = `Kid profiles:\n${kidDescriptions}\n\nFind 6 REAL recipes from popular cooking sites (e.g. AllRecipes, BBC Good Food, Tasty, etc.) that match all filters.${timeLimit < 999 ? ` REMEMBER: Every recipe must be ${timeLimit} minutes or less. cookTime must be "X min" where X ≤ ${timeLimit}.` : ""} Return a JSON array of recipe objects with these fields:
{ "id": string, "title": string, "cookTime": string, "difficulty": "Easy"|"Medium", "servings": number, "kidApproval": number (70-99), "ingredients": string[], "steps": string[], "tags": string[], "icon": string (one of: "utensils-crossed","pizza","cake","salad","soup","cookie","sandwich","coffee","ice-cream","egg","fish","beef","apple","cherry","grape","carrot","wheat","cup","milk","flame","leafy","bean","circle","croissant","glass","drumstick","popcorn"), "cuisine": string, "matchReasons": string[] (2-3 personalized reasons referencing kid names), "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number } }`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_recipes",
                description: "Return kid-friendly recipe suggestions",
                parameters: {
                  type: "object",
                  properties: {
                    recipes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          cookTime: { type: "string", description: `Format: "X min" where X ≤ ${timeLimit}` },
                          difficulty: { type: "string", enum: ["Easy", "Medium"] },
                          servings: { type: "number" },
                          kidApproval: { type: "number" },
                          ingredients: { type: "array", items: { type: "string" } },
                          steps: { type: "array", items: { type: "string" } },
                          tags: { type: "array", items: { type: "string" } },
                          icon: { type: "string", description: "Lucide icon name from allowed set" },
                          cuisine: { type: "string" },
                          nutrition: {
                            type: "object",
                            properties: {
                              calories: { type: "number" },
                              protein: { type: "number" },
                              carbs: { type: "number" },
                              fat: { type: "number" },
                              fiber: { type: "number" },
                            },
                            required: ["calories", "protein", "carbs", "fat", "fiber"],
                          },
                        },
                        required: ["id", "title", "cookTime", "difficulty", "servings", "kidApproval", "ingredients", "steps", "tags", "icon", "cuisine", "nutrition"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["recipes"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_recipes" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let recipes;

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recipes = parsed.recipes;
    } else {
      const content = data.choices?.[0]?.message?.content || "[]";
      const cleaned = content.replace(/```json\n?|```/g, "").trim();
      recipes = JSON.parse(cleaned);
    }

    // Server-side time validation: filter out any recipes exceeding the limit
    if (timeLimit < 999 && Array.isArray(recipes)) {
      recipes = recipes.filter((r: any) => {
        const match = String(r.cookTime).match(/(\d+)/);
        const mins = match ? parseInt(match[1]) : 999;
        return mins <= timeLimit;
      });
    }

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-recipes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});