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

    const { kids } = await req.json();

    const kidDescriptions = kids
      .map(
        (k: any) =>
          `${k.name || "Child"} (age ${k.age || "unknown"}): favorites=[${k.favorites?.join(", ")}], allergies=[${k.allergies?.join(", ")}], dislikes=[${k.dislikes?.join(", ")}], diet=${k.dietType || "none"}`
      )
      .join("\n");

    const systemPrompt = `You are a kid-friendly recipe expert. Generate 5 creative, nutritious recipes that children will love.
Each recipe must avoid the listed allergies, respect dislikes, and incorporate favorites when possible.
Focus on quick, practical meals (under 30 min) that busy parents can make.
Return recipes as a JSON array using this exact schema — no markdown, no extra text.`;

    const userPrompt = `Kid profiles:\n${kidDescriptions}\n\nReturn a JSON array of 5 recipe objects with these fields:
{ "id": string, "title": string, "cookTime": string, "difficulty": "Easy"|"Medium", "servings": number, "kidApproval": number (70-99), "ingredients": string[], "steps": string[], "tags": string[], "emoji": string }`;

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
                          cookTime: { type: "string" },
                          difficulty: { type: "string", enum: ["Easy", "Medium"] },
                          servings: { type: "number" },
                          kidApproval: { type: "number" },
                          ingredients: { type: "array", items: { type: "string" } },
                          steps: { type: "array", items: { type: "string" } },
                          tags: { type: "array", items: { type: "string" } },
                          emoji: { type: "string" },
                        },
                        required: ["id", "title", "cookTime", "difficulty", "servings", "kidApproval", "ingredients", "steps", "tags", "emoji"],
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
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "[]";
      const cleaned = content.replace(/```json\n?|```/g, "").trim();
      recipes = JSON.parse(cleaned);
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
