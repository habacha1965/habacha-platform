-- HABACHA PLATFORM DATABASE SCHEMA (Supabase PostgreSQL)

-- 1. Profiles Table (Users & Companies)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT CHECK (user_type IN ('individual', 'business', 'supplier', 'admin')),
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Suppliers Table (Asset Providers)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL, -- Aviation, Maritime, Vehicles, Fleets, Real Estate
  registration_number TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Assets Table (Cars, Jets, Boats, Fleets, Real Estate)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subtype TEXT NOT NULL, -- e.g., Luxury Sedan, Cargo Van, Private Jet, Superyacht
  location TEXT NOT NULL,
  pricing_structure TEXT NOT NULL, -- e.g., Daily Rate, Hourly Block, Dry Lease, Wet Lease
  price_estimate NUMERIC,
  specifications JSONB DEFAULT '{}'::jsonb, -- Store dynamic specs (range, capacity, payload)
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'chartered', 'maintenance', 'offline')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Inquiries & Rental Requests Table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_type TEXT CHECK (client_type IN ('private_individual', 'business')),
  start_date DATE,
  end_date DATE,
  custom_requirements TEXT,
  anti_spam_passed BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'approved', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
