-- Investment-related tables for stock trading and portfolio tracking

-- Stocks table with mock data
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  change_percent DECIMAL(5,2) NOT NULL,
  sector VARCHAR(100),
  market_cap BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  shares DECIMAL(10,4) NOT NULL,
  average_price DECIMAL(10,2) NOT NULL,
  total_invested DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- Investment transactions
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  shares DECIMAL(10,4) NOT NULL,
  price_per_share DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  fees DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment learning progress
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL,
  lesson_title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Stocks are viewable by everyone" ON stocks FOR SELECT USING (true);

CREATE POLICY "Users can view own portfolio" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON portfolios FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own investment transactions" ON investment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investment transactions" ON investment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own learning progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning progress" ON learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning progress" ON learning_progress FOR UPDATE USING (auth.uid() = user_id);

-- Insert mock stock data
INSERT INTO stocks (symbol, name, current_price, change_percent, sector, market_cap) VALUES
('JSE:SHP', 'Shoprite Holdings', 185.50, 2.3, 'Consumer Staples', 106000000000),
('JSE:NPN', 'Naspers', 3245.00, -1.2, 'Technology', 1400000000000),
('JSE:BVT', 'Bidvest Group', 195.75, 0.8, 'Industrials', 43000000000),
('JSE:SBK', 'Standard Bank', 142.30, 1.5, 'Financials', 226000000000),
('JSE:FSR', 'FirstRand', 65.80, -0.3, 'Financials', 374000000000),
('JSE:AGL', 'Anglo American', 425.60, 3.2, 'Mining', 560000000000),
('JSE:BIL', 'BHP Billiton', 520.40, 2.1, 'Mining', 2650000000000),
('JSE:SOL', 'Sasol', 285.90, -2.5, 'Energy', 180000000000),
('JSE:MTN', 'MTN Group', 98.75, 1.8, 'Telecommunications', 175000000000),
('JSE:VOD', 'Vodacom Group', 125.40, 0.5, 'Telecommunications', 230000000000);
