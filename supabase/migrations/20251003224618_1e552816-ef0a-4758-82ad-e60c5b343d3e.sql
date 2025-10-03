-- Create trigger to automatically grant welcome bonus when user signs up
CREATE OR REPLACE FUNCTION public.grant_welcome_bonus_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant 2000 points welcome bonus
  INSERT INTO public.rewards (user_id, type, amount, description)
  VALUES (NEW.id, 'welcome', 2000, 'Bono de bienvenida por registrarte en Wincova');
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires after profile is created
DROP TRIGGER IF EXISTS on_profile_created_grant_bonus ON public.profiles;
CREATE TRIGGER on_profile_created_grant_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_welcome_bonus_on_signup();