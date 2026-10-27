-- HABACHA PLATFORM MASTER SCHEMA
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.asset_category CASCADE;
DROP TYPE IF EXISTS public.asset_status CASCADE;
DROP TYPE IF EXISTS public.supplier_status CASCADE;
DROP TYPE IF EXISTS public.inquiry_status CASCADE;

CREATE TYPE public.user_role AS ENUM ('individual', 'b2b_client', 'asset_owner', 'admin');
CREATE TYPE public.asset_category AS ENUM ('car', 'van', 'truck', 'private_jet', 'commercial_aircraft', 'cargo_plane', 'yacht', 'cargo_ship', 'passenger_ship', 'real_estate');
CREATE TYPE public.asset_status AS ENUM ('available', 'leased', 'maintenance', 'reserved');
CREATE TYPE public.supplier_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.inquiry_status AS ENUM ('pending', 'under_review', 'approved', 'declined', 'completed');

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    phone TEXT,
    role public.user_role DEFAULT 'individual'::public.user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    asset_categories TEXT[] NOT NULL,
    fleet_size INT DEFAULT 1,
    status public.supplier_status DEFAULT 'pending'::public.supplier_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category public.asset_category NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    rate_per_day NUMERIC(12, 2),
    rate_per_hour NUMERIC(12, 2),
    capacity TEXT,
    status public.asset_status DEFAULT 'available'::public.asset_status NOT NULL,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    client_type TEXT DEFAULT 'individual' NOT NULL,
    company_name TEXT,
    start_date DATE,
    end_date DATE,
    message TEXT,
    status public.inquiry_status DEFAULT 'pending'::public.inquiry_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert to suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read to suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public update to suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public insert to inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read to inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public update to inquiries" ON public.inquiries FOR UPDATE USING (true);

INSERT INTO public.assets (title, category, description, location, rate_per_day, rate_per_hour, capacity, is_featured, image_url)
VALUES
('Gulfstream G650ER Jet', 'private_jet', 'Ultra-long-range executive private jet for global intercontinental charters.', 'Dubai / London / New York', 24000.00, 4800.00, '14 Passengers', true, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200'),
('50m Custom Motor Yacht', 'yacht', 'Tri-deck luxury superyacht equipped with helipad, tender, and crew.', 'Monaco / Dubai Marina', 18500.00, 3200.00, '12 Guests / 10 Crew', true, 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=1200'),
('Commercial Fleet: 25x Mercedes Sprinter Vans', 'van', 'Commercial cargo and passenger van fleet available for short & long term lease.', 'Rotterdam / Frankfurt', 3500.00, NULL, '25 Vehicles', true, 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&q=80&w=1200'),
('Boeing 737-800 Freighter (Cargo)', 'cargo_plane', 'Heavy payload dedicated air cargo aircraft for international logistics charter.', 'Amsterdam Schiphol (AMS)', 45000.00, 8500.00, '23,900 kg Payload', true, 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=1200'),
('Rolls-Royce Phantom VIII', 'car', 'Ultra-luxury chauffeur sedan available for VIP transfer and corporate executive charter.', 'Dubai / London / Paris', 2200.00, 350.00, '4 Passengers', false, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'),
('Executive Waterfront Villa & Event Estate', 'real_estate', 'Prime coastal luxury residence available for corporate summits and private executive leasing.', 'Dubai Palm Jumeirah', 12000.00, NULL, 'Up to 50 Guests', false, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200');
