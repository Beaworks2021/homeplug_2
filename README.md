# HomePlug 2 - E-commerce Platform

A full-stack e-commerce application built with Next.js 16, TypeScript, Supabase, and Tailwind CSS. This project features a customer-facing shop and an admin dashboard for managing products, orders, brands, categories, and carousel slides.

## 🏗️ Project Overview

**HomePlug 2** is a modern e-commerce platform with:
- **Customer Shop**: Public-facing storefront with product browsing, cart, favorites, and checkout
- **Admin Dashboard**: Protected admin area for managing inventory, orders, and marketing content
- **Authentication**: Supabase Auth for admin access
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Storage**: Supabase Storage for product images

## 📁 Project Structure

```
homeplug_2/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/           # Admin routes (protected)
│   │   │   └── admin/
│   │   │       ├── dashboard/ # Admin dashboard
│   │   │       ├── products/  # Product management (CRUD)
│   │   │       ├── orders/    # Order management
│   │   │       ├── brands/    # Brand management
│   │   │       ├── categories/# Category management
│   │   │       └── carousel/  # Hero carousel management
│   │   ├── (auth)/            # Authentication routes
│   │   │   └── login/         # Admin login page
│   │   ├── (shop)/            # Public shop routes
│   │   │   ├── page.tsx       # Homepage (product listing)
│   │   │   ├── products/[id]/ # Product detail pages
│   │   │   ├── brand/[id]/    # Brand filter pages
│   │   │   ├── category/[id]/ # Category filter pages
│   │   │   └── checkout/      # Checkout flow
│   │   ├── api/               # API routes
│   │   │   └── upload/        # Image upload endpoint
│   │   └── auth/              # Auth routes
│   │       └── signout/       # Sign out handler
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   │   ├── ProductForm.tsx
│   │   │   ├── BrandsManager.tsx
│   │   │   ├── CategoriesManager.tsx
│   │   │   ├── CarouselManager.tsx
│   │   │   ├── OrderStatusToggle.tsx
│   │   │   └── DeleteProductButton.tsx
│   │   ├── shop/              # Shop components
│   │   │   ├── Header.tsx     # Navigation header with cart
│   │   │   ├── HeroCarousel.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductActions.tsx
│   │   │   └── CheckoutForm.tsx
│   │   └── Logo.tsx
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useCart.ts     # Cart state management (localStorage)
│   │   │   └── useFavorites.ts# Favorites state management
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser Supabase client
│   │   │   └── server.ts      # Server-side Supabase client
│   │   ├── types/
│   │   │   └── database.ts    # TypeScript types for DB schema
│   │   └── data.ts            # Data fetching utilities
│   └── middleware.ts          # Route protection & auth middleware
├── supabase/
│   └── migrations/            # Database migrations
│       ├── 20241223_init_schema.sql
│       ├── 20241223_add_categories.sql
│       ├── 20241223_update_price_model.sql
│       ├── 20241223_seed_data.sql
│       ├── 20241223_fix_data.sql
│       └── 20241223_storage_policies.sql
└── public/                    # Static assets

```

## 🗄️ Database Schema

The application uses the following main tables:

- **`products`**: Product catalog with title, description, price, images, brand, and category
- **`brands`**: Product brands
- **`categories`**: Product categories with slugs
- **`orders`**: Customer orders with status (Pending/Approved/Cancelled)
- **`order_items`**: Individual items within orders
- **`carousel_slides`**: Hero carousel slides for homepage

All tables have Row Level Security (RLS) enabled:
- Public read access for products, brands, categories, and active carousel slides
- Admin-only write access (requires authentication)
- Guest checkout allowed for orders

## 🔐 Authentication & Authorization

- **Admin Routes**: Protected by middleware (`/admin/*`)
  - Redirects to `/login` if not authenticated
  - Uses Supabase Auth for session management
- **Public Routes**: Shop pages are accessible without authentication
- **Middleware**: Located at `src/middleware.ts` handles route protection

## 🛒 Key Features

### Customer Shop
- Product browsing with filtering by brand/category
- Shopping cart (stored in localStorage)
- Favorites/wishlist functionality
- Product detail pages
- Checkout form with order submission
- Hero carousel on homepage

### Admin Dashboard
- **Dashboard**: Overview stats (orders, products, pending orders)
- **Products**: Full CRUD operations (create, read, update, delete)
- **Orders**: View and update order status
- **Brands**: Manage product brands
- **Categories**: Manage product categories
- **Carousel**: Manage homepage hero slides

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account and project

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations (in Supabase dashboard SQL editor)
# Apply all files in supabase/migrations/ in order

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the shop.

### Admin Access
1. Navigate to `/login`
2. Sign in with Supabase Auth credentials
3. Access admin dashboard at `/admin/dashboard`

## 🧭 Navigation Guide

### For Frontend Development

**Shop Pages:**
- `src/app/(shop)/page.tsx` - Homepage
- `src/app/(shop)/products/[id]/page.tsx` - Product details
- `src/app/(shop)/checkout/page.tsx` - Checkout page
- `src/components/shop/` - Shop UI components

**Admin Pages:**
- `src/app/(admin)/admin/dashboard/page.tsx` - Dashboard
- `src/app/(admin)/admin/products/page.tsx` - Product list
- `src/app/(admin)/admin/products/new/page.tsx` - Create product
- `src/app/(admin)/admin/products/[id]/edit/page.tsx` - Edit product
- `src/components/admin/` - Admin UI components

### For Backend/Database Work

**Database Types:**
- `src/lib/types/database.ts` - TypeScript definitions for all tables

**Data Fetching:**
- `src/lib/supabase/client.ts` - Browser client (use in components)
- `src/lib/supabase/server.ts` - Server client (use in Server Components/API routes)
- `src/lib/data.ts` - Reusable data fetching functions

**Migrations:**
- `supabase/migrations/` - Run these in Supabase SQL editor in order

### For State Management

**Cart:**
- `src/lib/hooks/useCart.ts` - Cart hook (localStorage-based)
- Used in Header, ProductActions, CheckoutForm

**Favorites:**
- `src/lib/hooks/useFavorites.ts` - Favorites hook

## 🔧 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **UI Utilities**: class-variance-authority, clsx, tailwind-merge

## 📝 Important Notes

1. **Cart Storage**: Cart is stored in localStorage (client-side only)
2. **Image Upload**: Uses Supabase Storage via `/api/upload` endpoint
3. **Price Model**: Products have `price` and `original_price` fields for discounts
4. **Order Status**: Orders can be Pending, Approved, or Cancelled
5. **Carousel**: Only active slides (`is_active = true`) are displayed

## 🐛 Common Tasks

**Adding a new product:**
1. Go to `/admin/products/new`
2. Fill out ProductForm
3. Upload image (stored in Supabase Storage)

**Managing orders:**
1. View orders at `/admin/orders`
2. Use OrderStatusToggle to update status

**Updating database schema:**
1. Create new migration in `supabase/migrations/`
2. Update types in `src/lib/types/database.ts`
3. Apply migration in Supabase dashboard

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

The project is configured for Vercel deployment (`vercel.json` present).

---

**Project Name**: HomePlug 2 (MiniShop)  
**Version**: 0.1.0
