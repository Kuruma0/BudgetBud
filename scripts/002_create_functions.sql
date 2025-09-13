-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate current balance
CREATE OR REPLACE FUNCTION public.get_current_balance(user_uuid UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(
    SUM(CASE 
      WHEN type = 'income' THEN amount 
      WHEN type = 'expense' THEN -amount 
      ELSE 0 
    END), 0
  ) INTO balance
  FROM public.transactions
  WHERE user_id = user_uuid;
  
  RETURN balance;
END;
$$;

-- Function to get login streak
CREATE OR REPLACE FUNCTION public.get_login_streak(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak INTEGER := 0;
  current_date_check DATE := CURRENT_DATE;
BEGIN
  -- Check if user logged in today or yesterday to start counting
  IF NOT EXISTS (
    SELECT 1 FROM public.daily_logins 
    WHERE user_id = user_uuid 
    AND login_date >= CURRENT_DATE - INTERVAL '1 day'
  ) THEN
    RETURN 0;
  END IF;
  
  -- Count consecutive days backwards from today
  WHILE EXISTS (
    SELECT 1 FROM public.daily_logins 
    WHERE user_id = user_uuid 
    AND login_date = current_date_check
  ) LOOP
    streak := streak + 1;
    current_date_check := current_date_check - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak;
END;
$$;
