# MiniShop - E-commerce Application

## Architecture Overview

MiniShop is a modern e-commerce application built with Next.js 15 App Router, featuring a public storefront for guest users and a protected admin dashboard for product and order management.

### Key Features
- Public storefront with product browsing and guest checkout
- Admin dashboard with full CRUD operations for products and orders
- LocalStorage-based favorites for guest users
- Supabase integration for database, authentication, and file storage

## Database Schema (Supabase/PostgreSQL)

### Tables

#### 1. brands
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. products
```sql
CREATE TABLE products (
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
```

#### 3. orders
```sql
CREATE TABLE orders (
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
```

#### 4. order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. carousel_slides
```sql
CREATE TABLE carousel_slides (
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
```

### Supabase Storage Buckets

1. **product-images**: Stores product images
   - Public bucket for product catalog images
   - Max file size: 5MB per image
   - Allowed formats: jpg, jpeg, png, webp

2. **carousel-images**: Stores hero carousel images
   - Public bucket for homepage carousel slides
   - Max file size: 10MB per image
   - Allowed formats: jpg, jpeg, png, webp

### Row Level Security (RLS) Policies

#### Products Table
```sql
-- Allow public read access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);

-- Allow authenticated admin full access
CREATE POLICY "Allow admin full access" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

#### Orders Table
```sql
-- Allow guest checkout (insert)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow guest checkout" ON orders FOR INSERT WITH CHECK (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

#### Carousel Slides Table
```sql
-- Allow public read access
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON carousel_slides FOR SELECT USING (is_active = true);

-- Allow admin full access
CREATE POLICY "Allow admin full access" ON carousel_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## Project Structure (Next.js 15 App Router)

```
minishop/
├── app/
│   ├── (shop)/
│   │   ├── layout.tsx          # Shop layout with header/footer
│   │   ├── page.tsx            # Home page with carousel and products
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Product detail page
│   │   └── checkout/
│   │       └── page.tsx        # Guest checkout page
│   │
│   ├── (admin)/
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Admin dashboard overview
│   │   ├── products/
│   │   │   ├── page.tsx        # Product list with CRUD
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Add new product
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit product
│   │   ├── orders/
│   │   │   └── page.tsx        # Order management
│   │   └── marketing/
│   │       ├── carousel/
│   │       │   └── page.tsx    # Carousel slide management
│   │       └── brands/
│   │           └── page.tsx    # Brand management
│   │
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts        # Image upload endpoint
│   │   └── checkout/
│   │       └── route.ts        # Checkout processing
│   │
│   └── globals.css
│
├── components/
│   ├── shop/
│   │   ├── HeroCarousel.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ShoppingCart.tsx
│   │   ├── CartItem.tsx
│   │   └── CheckoutForm.tsx
│   │
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductTable.tsx
│   │   ├── OrderTable.tsx
│   │   ├── CarouselManager.tsx
│   │   └── BrandManager.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Form.tsx
│       ├── Table.tsx
│       └── Dialog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client for frontend
│   │   ├── server.ts           # Supabase client for server components
│   │   └── admin.ts            # Supabase admin client
│   │
│   ├── hooks/
│   │   ├── useCart.ts          # Cart management hook
│   │   ├── useFavorites.ts     # Favorites management hook
│   │   └── useProducts.ts      # Products data fetching
│   │
│   ├── utils/
│   │   ├── formatters.ts       # Price formatting, etc.
│   │   └── validators.ts       # Form validation helpers
│   │
│   └── types/
│       └── database.ts         # TypeScript types for database
│
├── public/
│   └── images/
│       └── placeholder.jpg
│
├── middleware.ts               # Admin route protection
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

## Technology Stack

### Core Technologies
- **Frontend Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Admin only)
- **File Storage**: Supabase Storage

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## Key Implementation Details

### State Management
- **Cart**: LocalStorage-based for guest users
- **Favorites**: LocalStorage-based for guest users
- **Admin Auth**: Supabase Auth with session management

### API Routes
- `/api/upload`: Handles image uploads to Supabase Storage
- `/api/checkout`: Processes guest checkout and creates orders

### Middleware
- Protects admin routes (`/admin/*`) by checking Supabase session
- Redirects unauthenticated users to admin login page

### Data Flow
1. **Public Storefront**: Direct Supabase client queries for products and carousel data
2. **Admin Dashboard**: Server-side data fetching with proper authentication
3. **Checkout Process**: API route handles order creation and item association

This architecture ensures a clean separation between public and admin functionality while maintaining simplicity and performance.