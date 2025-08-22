-- =====================================================
-- FinVoice Database Schema for Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (extends Firebase auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    firebase_uid TEXT UNIQUE, -- Firebase user ID (optional)
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'bn', 'or', 'pa', 'kn', 'mar')),
    currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP', 'JPY')),
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'foodDining', 'transportation', 'entertainment', 'utilities', 
        'shopping', 'healthcare', 'education', 'travel', 'other'
    )),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voice_input TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    month_year TEXT NOT NULL, -- Format: "2025-04"
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    categories JSONB NOT NULL, -- Store category budgets as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- =====================================================
-- CATEGORIES TABLE (for reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.expense_categories (id, name, icon, color) VALUES
    ('foodDining', 'Food & Dining', 'food', '#FF6B6B'),
    ('transportation', 'Transportation', 'car', '#4ECDC4'),
    ('entertainment', 'Entertainment', 'movie', '#45B7D1'),
    ('utilities', 'Utilities', 'lightning-bolt', '#96CEB4'),
    ('shopping', 'Shopping', 'shopping', '#FFEAA7'),
    ('healthcare', 'Healthcare', 'medical-bag', '#DDA0DD'),
    ('education', 'Education', 'school', '#98D8C8'),
    ('travel', 'Travel', 'airplane', '#F7DC6F'),
    ('other', 'Other', 'help-circle', '#6B46C1')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Disable RLS temporarily for profiles table to allow backend operations
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- EXPENSES RLS POLICIES
-- =====================================================
-- Users can view their own expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- BUDGETS RLS POLICIES
-- =====================================================
-- Users can view their own budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own budgets
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES RLS POLICIES
-- =====================================================
-- Everyone can view categories (read-only)
CREATE POLICY "Anyone can view categories" ON public.expense_categories
    FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON public.expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON public.budgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get total expenses for a user in a date range
CREATE OR REPLACE FUNCTION get_user_expenses_total(
    user_uuid UUID,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(amount) 
        FROM public.expenses 
        WHERE user_id = user_uuid 
        AND date BETWEEN start_date AND end_date
    ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expenses by category for a user
CREATE OR REPLACE FUNCTION get_user_expenses_by_category(
    user_uuid UUID,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(category TEXT, total DECIMAL(10,2), count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.category,
        SUM(e.amount) as total,
        COUNT(*) as count
    FROM public.expenses e
    WHERE e.user_id = user_uuid
    AND (start_date IS NULL OR e.date >= start_date)
    AND (end_date IS NULL OR e.date <= end_date)
    GROUP BY e.category
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample profile (replace with actual user ID from Firebase)
-- INSERT INTO public.profiles (id, phone, name, language, currency, theme) VALUES
--     ('00000000-0000-0000-0000-000000000001', '+919876543210', 'Test User', 'en', 'INR', 'light');

-- Insert sample budget (replace with actual user ID)
-- INSERT INTO public.budgets (user_id, month_year, total_amount, categories) VALUES
--     ('00000000-0000-0000-0000-000000000001', '2025-01', 50000.00, 
--      '{"foodDining": {"budgeted": 12000, "spent": 8500}, "transportation": {"budgeted": 8000, "spent": 6500}}');

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending Firebase authentication';
COMMENT ON TABLE public.expenses IS 'User expense records with voice input support';
COMMENT ON TABLE public.budgets IS 'Monthly budget tracking with category breakdowns';
COMMENT ON TABLE public.expense_categories IS 'Reference table for expense categories';

COMMENT ON COLUMN public.expenses.voice_input IS 'Original voice input text for expense';
COMMENT ON COLUMN public.expenses.location_lat IS 'Latitude of expense location (optional)';
COMMENT ON COLUMN public.expenses.location_lng IS 'Longitude of expense location (optional)';
COMMENT ON COLUMN public.budgets.categories IS 'JSON object with category budgets and spending';
