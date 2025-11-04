-- Database Schema for Africa Safari Builder Admin System
-- Run this in your Supabase SQL Editor to create the necessary tables

-- 1. Destinations table (if not exists)
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  activities TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_per_person DECIMAL(10, 2) NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Accommodation types table
CREATE TABLE IF NOT EXISTS accommodation_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transport options table
CREATE TABLE IF NOT EXISTS transport_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_per_person DECIMAL(10, 2) NOT NULL,
  vehicle_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_is_featured ON destinations(is_featured);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);
CREATE INDEX IF NOT EXISTS idx_accommodation_is_active ON accommodation_types(is_active);
CREATE INDEX IF NOT EXISTS idx_transport_is_active ON transport_options(is_active);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_options ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public read access
CREATE POLICY "Public can view destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public can view activities" ON activities FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view accommodation types" ON accommodation_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view transport options" ON transport_options FOR SELECT USING (is_active = true);

-- 8. Create policies for authenticated users (admin) to manage data
-- Note: You might want to create a more sophisticated admin role system
CREATE POLICY "Authenticated users can insert destinations" ON destinations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update destinations" ON destinations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete destinations" ON destinations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activities" ON activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update activities" ON activities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete activities" ON activities FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert accommodation" ON accommodation_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update accommodation" ON accommodation_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete accommodation" ON accommodation_types FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert transport" ON transport_options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update transport" ON transport_options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete transport" ON transport_options FOR DELETE TO authenticated USING (true);

-- 9. Insert default accommodation types
INSERT INTO accommodation_types (name, slug, description, price_per_night, amenities) VALUES
  ('Luxury Lodge', 'luxury-lodge', 'Premium accommodations with world-class amenities', 500.00, ARRAY['WiFi', 'Pool', 'Spa', 'Fine Dining', 'Butler Service']),
  ('Classic Tented Camp', 'tented-camp', 'Authentic safari experience with comfortable amenities', 300.00, ARRAY['WiFi', 'Ensuite Bathroom', 'Restaurant', 'Game Viewing Deck']),
  ('Budget Hotel', 'budget-hotel', 'Comfortable and affordable lodging', 150.00, ARRAY['WiFi', 'Breakfast', 'Clean Rooms'])
ON CONFLICT (slug) DO NOTHING;

-- 10. Insert default transport options
INSERT INTO transport_options (name, slug, description, price_per_person, vehicle_type) VALUES
  ('By Road (4x4 Safari Vehicle)', 'road', 'Ground transportation in comfortable 4x4 vehicles', 100.00, '4x4 Safari Vehicle'),
  ('By Air (Charter Flight)', 'air', 'Quick and scenic charter flights', 500.00, 'Light Aircraft')
ON CONFLICT (slug) DO NOTHING;

-- 11. Insert sample activities (you can customize these)
INSERT INTO activities (name, description, price_per_person, category) VALUES
  ('Game Drives', 'Explore the wilderness and observe wildlife in their natural habitat', 150.00, 'Wildlife'),
  ('Hot Air Balloon Safari', 'Soar above the savannah for breathtaking aerial views', 450.00, 'Adventure'),
  ('Maasai Village Visit', 'Experience authentic Maasai culture and traditions', 50.00, 'Cultural'),
  ('Bird Watching', 'Discover diverse bird species with expert guides', 80.00, 'Wildlife'),
  ('Great Migration (seasonal)', 'Witness the spectacular wildebeest migration', 200.00, 'Wildlife'),
  ('Walking Safari', 'Explore on foot with armed guides', 120.00, 'Adventure'),
  ('Bush Walks', 'Nature walks through the African bush', 100.00, 'Nature'),
  ('Night Safari', 'Experience nocturnal wildlife activity', 180.00, 'Wildlife'),
  ('Photography Safari', 'Guided tours for wildlife photography enthusiasts', 160.00, 'Adventure'),
  ('Mokoro Canoe Safari', 'Traditional canoe excursions through waterways', 130.00, 'Adventure'),
  ('Fishing', 'Sport fishing experiences', 90.00, 'Recreation'),
  ('Gorilla Trekking', 'Once-in-a-lifetime gorilla encounters', 1500.00, 'Wildlife'),
  ('Nature Walks', 'Guided nature exploration', 70.00, 'Nature'),
  ('Community Village Visit', 'Visit local communities and learn about their way of life', 60.00, 'Cultural'),
  ('Batwa Cultural Experience', 'Learn about Batwa pygmy culture', 80.00, 'Cultural'),
  ('Victoria Falls Tour', 'Visit the magnificent Victoria Falls', 100.00, 'Sightseeing'),
  ('White Water Rafting', 'Thrilling rapids adventure', 150.00, 'Adventure'),
  ('Bungee Jumping', 'Adrenaline-pumping bungee jumping', 200.00, 'Adventure'),
  ('Helicopter Flight', 'Scenic helicopter tours', 350.00, 'Adventure'),
  ('Sunset Cruise', 'Relaxing river cruises at sunset', 120.00, 'Recreation'),
  ('Crater Floor Safari', 'Explore the Ngorongoro Crater', 180.00, 'Wildlife'),
  ('Waterhole Viewing', 'Observe wildlife at waterholes', 50.00, 'Wildlife'),
  ('Dune Climbing', 'Climb spectacular sand dunes', 80.00, 'Adventure'),
  ('Desert Photography', 'Capture stunning desert landscapes', 100.00, 'Adventure'),
  ('Star Gazing', 'Observe clear night skies', 60.00, 'Recreation'),
  ('Deadvlei Visit', 'Visit the iconic Deadvlei clay pan', 90.00, 'Sightseeing'),
  ('Mountain Trekking', 'Multi-day mountain treks', 300.00, 'Adventure'),
  ('Summit Climb', 'Climb to mountain summits', 800.00, 'Adventure'),
  ('Pyramid Tours', 'Explore ancient pyramids', 150.00, 'Cultural'),
  ('Sphinx Visit', 'Visit the Great Sphinx', 50.00, 'Cultural'),
  ('Camel Rides', 'Traditional camel excursions', 80.00, 'Cultural'),
  ('Egyptian Museum', 'Tour historical museums', 40.00, 'Cultural'),
  ('Nile River Cruise', 'Cruise along the Nile River', 200.00, 'Recreation'),
  ('Medina Tours', 'Explore traditional medinas', 60.00, 'Cultural'),
  ('Souk Shopping', 'Shop in traditional markets', 30.00, 'Cultural'),
  ('Moroccan Cooking Class', 'Learn to cook traditional Moroccan cuisine', 120.00, 'Cultural'),
  ('Desert Tours', 'Explore desert landscapes', 180.00, 'Adventure'),
  ('Hammam Spa Experience', 'Traditional spa treatments', 100.00, 'Recreation')
ON CONFLICT (name) DO NOTHING;
