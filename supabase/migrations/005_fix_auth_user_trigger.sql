-- Fix "Database error creating new user" when Supabase Auth creates a profile row.
-- Common causes: missing search_path on SECURITY DEFINER trigger, or RLS blocking insert.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role,
      'CUSTOMER'::public.user_role
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Allow profile row creation during signup (trigger + self-registration)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;

CREATE POLICY "Users insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO service_role;
