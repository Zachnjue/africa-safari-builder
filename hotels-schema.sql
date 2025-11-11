-- Hotels table to store individual hotels for each accommodation type
CREATE TABLE IF NOT EXISTS hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  accommodation_type_id UUID REFERENCES accommodation_types(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  amenities TEXT[],
  price_per_night DECIMAL(10, 2) NOT NULL,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hotels_accommodation_type ON hotels(accommodation_type_id);
CREATE INDEX IF NOT EXISTS idx_hotels_destination ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON hotels(is_active);

-- Enable Row Level Security
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view active hotels" ON hotels FOR SELECT USING (is_active = true);

-- Create policies for authenticated users (admin) to manage hotels
CREATE POLICY "Authenticated users can insert hotels" ON hotels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hotels" ON hotels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete hotels" ON hotels FOR DELETE TO authenticated USING (true);

-- Insert sample hotels for Luxury Lodge category
INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Serengeti Safari Lodge',
  id,
  'Experience luxury in the heart of Serengeti with stunning views of the endless plains. Our lodge offers world-class amenities and personalized service.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  4.8,
  ARRAY['WiFi', 'Infinity Pool', 'Spa', 'Fine Dining', 'Butler Service', 'Game Viewing Deck'],
  550.00,
  'Serengeti National Park, Tanzania'
FROM accommodation_types WHERE slug = 'luxury-lodge'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Masai Mara Grand Lodge',
  id,
  'Perched on the edge of the escarpment, this lodge offers breathtaking views and unparalleled luxury in the Masai Mara.',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  4.9,
  ARRAY['WiFi', 'Pool', 'Spa', 'Fine Dining', 'Butler Service', 'Private Balconies'],
  600.00,
  'Masai Mara, Kenya'
FROM accommodation_types WHERE slug = 'luxury-lodge'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Victoria Falls Royal Lodge',
  id,
  'Exclusive luxury resort near Victoria Falls with panoramic views and exceptional service.',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  4.7,
  ARRAY['WiFi', 'Pool', 'Spa', 'Fine Dining', 'Gym', 'Helipad'],
  580.00,
  'Victoria Falls, Zimbabwe'
FROM accommodation_types WHERE slug = 'luxury-lodge'
ON CONFLICT DO NOTHING;

-- Insert sample hotels for Tented Camp category
INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Serengeti Under Canvas',
  id,
  'Authentic tented camp experience following the Great Migration. Comfortable luxury tents with ensuite facilities.',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  4.6,
  ARRAY['WiFi', 'Ensuite Bathroom', 'Restaurant', 'Game Viewing Deck', 'Campfire'],
  320.00,
  'Serengeti National Park, Tanzania'
FROM accommodation_types WHERE slug = 'tented-camp'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Mara River Camp',
  id,
  'Elegant tented camp on the banks of the Mara River with front-row seats to wildlife crossings.',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  4.5,
  ARRAY['WiFi', 'Ensuite Bathroom', 'Restaurant', 'Bar', 'River Views'],
  350.00,
  'Masai Mara, Kenya'
FROM accommodation_types WHERE slug = 'tented-camp'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Okavango Delta Tented Lodge',
  id,
  'Eco-friendly tented camp in the pristine Okavango Delta with water-based activities.',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
  4.7,
  ARRAY['WiFi', 'Ensuite Bathroom', 'Restaurant', 'Mokoro Trips', 'Sunset Cruises'],
  380.00,
  'Okavango Delta, Botswana'
FROM accommodation_types WHERE slug = 'tented-camp'
ON CONFLICT DO NOTHING;

-- Insert sample hotels for Budget Hotel category
INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Arusha Budget Inn',
  id,
  'Clean and comfortable budget accommodation perfect for safari adventurers. Great location near town center.',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  4.2,
  ARRAY['WiFi', 'Breakfast', 'Clean Rooms', 'Parking', '24/7 Reception'],
  120.00,
  'Arusha, Tanzania'
FROM accommodation_types WHERE slug = 'budget-hotel'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Nairobi Safari Hotel',
  id,
  'Affordable hotel with great access to Nairobi National Park and city attractions.',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  4.1,
  ARRAY['WiFi', 'Breakfast', 'Clean Rooms', 'Restaurant', 'Tour Desk'],
  140.00,
  'Nairobi, Kenya'
FROM accommodation_types WHERE slug = 'budget-hotel'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, accommodation_type_id, description, image_url, rating, amenities, price_per_night, location)
SELECT
  'Livingstone Backpackers',
  id,
  'Budget-friendly accommodation near Victoria Falls with a social atmosphere.',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  4.3,
  ARRAY['WiFi', 'Breakfast', 'Clean Rooms', 'Pool', 'Common Area'],
  100.00,
  'Livingstone, Zambia'
FROM accommodation_types WHERE slug = 'budget-hotel'
ON CONFLICT DO NOTHING;
