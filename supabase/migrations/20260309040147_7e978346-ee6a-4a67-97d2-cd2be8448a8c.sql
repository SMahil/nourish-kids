
-- ================================================================
-- Fix: Recreate all RLS policies as PERMISSIVE (Postgres default)
-- The previous policies were RESTRICTIVE which silently blocks all access
-- ================================================================

-- ── favorite_recipes ──
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorite_recipes;

CREATE POLICY "Users can view own favorites"
  ON public.favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorite_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorite_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ── kid_profiles ──
DROP POLICY IF EXISTS "Users can view own kids" ON public.kid_profiles;
DROP POLICY IF EXISTS "Users can insert own kids" ON public.kid_profiles;
DROP POLICY IF EXISTS "Users can update own kids" ON public.kid_profiles;
DROP POLICY IF EXISTS "Users can delete own kids" ON public.kid_profiles;

CREATE POLICY "Users can view own kids"
  ON public.kid_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kids"
  ON public.kid_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kids"
  ON public.kid_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kids"
  ON public.kid_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ── meal_plans ──
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

CREATE POLICY "Users can view own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ── profiles ──
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
