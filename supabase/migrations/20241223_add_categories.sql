-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin Manage Categories" ON categories FOR ALL TO authenticated USING (true);

-- Add category_id to products
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);

-- Migrate existing text categories to the new table
DO $$ 
DECLARE 
    r RECORD;
    cat_id UUID;
BEGIN
    FOR r IN SELECT DISTINCT category FROM products WHERE category IS NOT NULL LOOP
        -- Insert category if not exists
        INSERT INTO categories (name, slug) 
        VALUES (r.category, lower(replace(r.category, ' ', '-')))
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO cat_id;

        -- Update products
        UPDATE products SET category_id = cat_id WHERE category = r.category;
    END LOOP;
END $$;

-- We can keep the old 'category' column for now as a fallback or drop it. 
-- Let's keep it for safety but we will switch to using category_id in the code.
