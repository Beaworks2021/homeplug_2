-- Modify products table to support old price/new price model
ALTER TABLE products 
DROP COLUMN discount_percentage,
ADD COLUMN original_price DECIMAL(10,2);

-- Update existing products with dummy original prices (just for migration safety)
UPDATE products SET original_price = price * 1.2 WHERE original_price IS NULL;
