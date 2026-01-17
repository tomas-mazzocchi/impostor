-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id)
);

-- Words table
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id)
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('category', 'word')),
    entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_words_category_id ON words(category_id);
CREATE INDEX idx_words_approved ON words(approved);
CREATE INDEX idx_categories_approved ON categories(approved);
CREATE INDEX idx_reports_type_entity ON reports(type, entity_id);

-- Function to normalize text for search (using unaccent)
CREATE OR REPLACE FUNCTION normalize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(unaccent(input_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION update_created_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER categories_created_at
    BEFORE INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at();

CREATE TRIGGER words_created_at
    BEFORE INSERT ON words
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at();

CREATE TRIGGER reports_created_at
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at();

CREATE TRIGGER user_roles_created_at
    BEFORE INSERT ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_created_at();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Categories policies
-- Public read for approved categories
CREATE POLICY "Public can read approved categories"
    ON categories FOR SELECT
    USING (approved = TRUE);

-- Authenticated users can propose categories
CREATE POLICY "Authenticated users can insert categories"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Admins can update categories (for moderation)
CREATE POLICY "Admins can update categories"
    ON categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Words policies
-- Public read for approved words in approved categories
CREATE POLICY "Public can read approved words"
    ON words FOR SELECT
    USING (
        approved = TRUE AND
        EXISTS (
            SELECT 1 FROM categories
            WHERE categories.id = words.category_id AND categories.approved = TRUE
        )
    );

-- Authenticated users can propose words
CREATE POLICY "Authenticated users can insert words"
    ON words FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Admins can update words (for moderation)
CREATE POLICY "Admins can update words"
    ON words FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Reports policies
-- Authenticated users can create reports
CREATE POLICY "Authenticated users can insert reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admins and moderators can read reports
CREATE POLICY "Admins and moderators can read reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- User roles policies
-- Only admins can read user roles
CREATE POLICY "Admins can read user roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Only admins can insert/update user roles
CREATE POLICY "Admins can manage user roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );
