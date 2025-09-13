-- Add monthly_budget column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(12,2) DEFAULT 0;

-- Update the user_profiles table to ensure all users have a profile
INSERT INTO user_profiles (user_id, monthly_budget)
SELECT auth.uid(), 0
FROM auth.users
WHERE auth.uid() NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;
