CREATE TABLE public.favorite_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recipe_id text NOT NULL,
  recipe_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favorite_recipes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorite_recipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorite_recipes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);