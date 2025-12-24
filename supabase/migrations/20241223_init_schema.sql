-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  brand_id UUID REFERENCES brands(id),
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  residential_address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carousel_slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for Products
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for Brands
CREATE POLICY "Allow public read access brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow admin full access brands" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for Orders
CREATE POLICY "Allow guest checkout" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for Order Items
CREATE POLICY "Allow guest checkout items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for Carousel Slides
CREATE POLICY "Allow public read access carousel" ON carousel_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin full access carousel" ON carousel_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage Buckets (These usually need to be created via API or Dashboard, but we can try inserting if storage schema exists)
-- Note: Creating buckets via SQL is specific to Supabase's internal schema 'storage', which might not be directly accessible or safe to modify this way. 
-- We will assume buckets are created via the Supabase dashboard or init script if possible.
-- For now, we'll stick to tables.
