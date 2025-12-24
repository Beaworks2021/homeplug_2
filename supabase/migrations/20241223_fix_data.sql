-- Update existing products with working Unsplash images and set original_price logic
-- We will set original_price slightly higher than price for some items to show discount

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    original_price = 350.00
WHERE title ILIKE '%Headphones%';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    original_price = 149.50 -- No discount
WHERE title ILIKE '%Watch%';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
    original_price = 45.00
WHERE title ILIKE '%T-Shirt%';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000&auto=format&fit=crop',
    original_price = 120.00
WHERE title ILIKE '%Jacket%';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1507473888900-52e1ad14592a?q=80&w=1000&auto=format&fit=crop',
    original_price = 65.00
WHERE title ILIKE '%Lamp%';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop',
    original_price = 300.00
WHERE title ILIKE '%Chair%';
