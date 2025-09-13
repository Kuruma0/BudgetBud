-- Create virtual currency and town building system
CREATE TABLE IF NOT EXISTS user_bucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create building types
CREATE TABLE IF NOT EXISTS building_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL, -- residential, commercial, entertainment, infrastructure
  icon TEXT NOT NULL,
  unlock_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user buildings (what they've built in their town)
CREATE TABLE IF NOT EXISTS user_buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  building_type_id UUID REFERENCES building_types(id) ON DELETE CASCADE,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buck transactions (earning and spending history)
CREATE TABLE IF NOT EXISTS buck_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  transaction_type TEXT NOT NULL, -- earned_good_habit, earned_goal, spent_building
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default building types
INSERT INTO building_types (name, description, cost, category, icon, unlock_level) VALUES
('Small House', 'A cozy starter home for your town', 50, 'residential', '🏠', 1),
('Shop', 'A small retail store', 75, 'commercial', '🏪', 1),
('Tree', 'Beautiful greenery for your town', 25, 'infrastructure', '🌳', 1),
('Apartment', 'Multi-story housing', 120, 'residential', '🏢', 2),
('Restaurant', 'A place for townspeople to dine', 150, 'commercial', '🍽️', 2),
('Park', 'A recreational area with benches', 100, 'entertainment', '🏞️', 2),
('Office Building', 'Modern commercial space', 200, 'commercial', '🏬', 3),
('School', 'Education facility for the community', 250, 'infrastructure', '🏫', 3),
('Hospital', 'Healthcare facility', 300, 'infrastructure', '🏥', 4),
('Stadium', 'Sports and entertainment venue', 500, 'entertainment', '🏟️', 5);

-- Function to get user's current bucks
CREATE OR REPLACE FUNCTION get_user_bucks(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_bucks INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_bucks
  FROM buck_transactions
  WHERE user_id = user_uuid;
  
  RETURN total_bucks;
END;
$$ LANGUAGE plpgsql;

-- Function to award bucks for good financial decisions
CREATE OR REPLACE FUNCTION award_bucks(user_uuid UUID, buck_amount INTEGER, transaction_description TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO buck_transactions (user_id, amount, transaction_type, description)
  VALUES (user_uuid, buck_amount, 'earned_good_habit', transaction_description);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_bucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buck_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bucks" ON user_bucks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own bucks" ON user_bucks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own buildings" ON user_buildings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own buildings" ON user_buildings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own buck transactions" ON buck_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own buck transactions" ON buck_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view building types" ON building_types FOR SELECT TO authenticated USING (true);
