ALTER TABLE public.profiles
  ADD COLUMN cuisine_preferences text[] DEFAULT '{}',
  ADD COLUMN max_cooking_time text DEFAULT '45+ min';