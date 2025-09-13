-- Insert sample transaction categories for reference
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT
);

-- Seed expense categories
INSERT INTO public.transaction_categories (name, type, icon, color) VALUES
('Food & Dining', 'expense', '🍽️', '#ef4444'),
('Transportation', 'expense', '🚗', '#f97316'),
('Shopping', 'expense', '🛍️', '#eab308'),
('Entertainment', 'expense', '🎬', '#a855f7'),
('Bills & Utilities', 'expense', '⚡', '#06b6d4'),
('Healthcare', 'expense', '🏥', '#10b981'),
('Education', 'expense', '📚', '#3b82f6'),
('Travel', 'expense', '✈️', '#8b5cf6'),
('Groceries', 'expense', '🛒', '#22c55e'),
('Gas', 'expense', '⛽', '#f59e0b'),
('Coffee', 'expense', '☕', '#92400e'),
('Subscriptions', 'expense', '📱', '#7c3aed'),
('Other', 'expense', '💳', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Seed income categories
INSERT INTO public.transaction_categories (name, type, icon, color) VALUES
('Salary', 'income', '💰', '#10b981'),
('Freelance', 'income', '💼', '#059669'),
('Investment', 'income', '📈', '#0d9488'),
('Gift', 'income', '🎁', '#14b8a6'),
('Refund', 'income', '↩️', '#06b6d4'),
('Other Income', 'income', '💵', '#22c55e')
ON CONFLICT (name) DO NOTHING;

-- Make categories table publicly readable
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.transaction_categories FOR SELECT TO authenticated USING (true);
