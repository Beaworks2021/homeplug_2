-- Insert Dummy Brands
INSERT INTO brands (name) VALUES 
  ('TechNova'),
  ('UrbanWear'),
  ('HomeComfort')
ON CONFLICT (name) DO NOTHING;

-- Insert Dummy Carousel Slides
INSERT INTO carousel_slides (title, subtitle, image_url, sort_order, is_active) VALUES
  ('Summer Collection 2024', 'Up to 50% off on new arrivals', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', 1, true),
  ('New Tech Gadgets', 'Upgrade your lifestyle with our latest tech', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop', 2, true);

-- Insert Dummy Products (Using CTE to get brand IDs)
WITH brand_data AS (
  SELECT id, name FROM brands
)
INSERT INTO products (title, description, price, discount_percentage, brand_id, category, image_url) VALUES
  (
    'Wireless Noise Cancelling Headphones', 
    'Premium sound quality with active noise cancellation.', 
    299.99, 
    15, 
    (SELECT id FROM brand_data WHERE name = 'TechNova'), 
    'Electronics', 
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Smart Fitness Watch', 
    'Track your health and fitness goals with precision.', 
    149.50, 
    0, 
    (SELECT id FROM brand_data WHERE name = 'TechNova'), 
    'Electronics', 
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Cotton Classic T-Shirt', 
    '100% organic cotton, breathable and comfortable.', 
    29.99, 
    0, 
    (SELECT id FROM brand_data WHERE name = 'UrbanWear'), 
    'Clothing', 
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Denim Jacket', 
    'Classic vintage style denim jacket for all seasons.', 
    89.95, 
    10, 
    (SELECT id FROM brand_data WHERE name = 'UrbanWear'), 
    'Clothing', 
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Modern Table Lamp', 
    'Minimalist design that fits any room decor.', 
    55.00, 
    5, 
    (SELECT id FROM brand_data WHERE name = 'HomeComfort'), 
    'Home & Living', 
    'https://images.unsplash.com/photo-1507473888900-52e1ad14592a?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Ergonomic Office Chair', 
    'Work in comfort with fully adjustable support.', 
    249.00, 
    20, 
    (SELECT id FROM brand_data WHERE name = 'HomeComfort'), 
    'Home & Living', 
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop'
  );
