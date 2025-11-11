# Hotels Feature Setup Guide

## Overview
The hotels feature allows users to see specific hotels within each accommodation category (Luxury Lodge, Tented Camp, Budget Hotel) and preview them with detailed information.

## Database Setup

### Step 1: Run the Hotels Schema SQL

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `hotels-schema.sql` in your project root
4. Copy the entire SQL content
5. Paste and run it in the Supabase SQL Editor

This will create:
- A `hotels` table with all necessary fields
- Proper indexes for performance
- Row Level Security policies
- Sample hotel data for all three accommodation categories (9 sample hotels total)

### Step 2: Verify the Setup

After running the SQL, verify the setup:

```sql
-- Check if the table was created
SELECT * FROM hotels;

-- Check hotels by accommodation type
SELECT h.*, a.name as accommodation_type_name
FROM hotels h
JOIN accommodation_types a ON h.accommodation_type_id = a.id
ORDER BY a.name, h.rating DESC;
```

## Features Implemented

### 1. Hotel Selection
- When users select an accommodation category, available hotels are displayed
- Hotels are sorted by rating (highest first)
- Each hotel card shows:
  - Hotel image
  - Name
  - Location
  - Rating (stars)
  - Price per night
  - Brief description
  - Preview button

### 2. Hotel Preview Modal
- Click "Preview" button on any hotel to see full details:
  - Large hero image
  - Complete description
  - Full amenities list
  - Contact information (email & phone)
  - Rating
  - Price per night
  - "Select This Hotel" button

### 3. Hotel Selection Highlighting
- Selected hotel is highlighted with orange border and background
- Only one hotel can be selected at a time

## Sample Hotels Included

### Luxury Lodge Category (3 hotels)
1. **Serengeti Safari Lodge** - $550/night, 4.8 rating
2. **Masai Mara Grand Lodge** - $600/night, 4.9 rating
3. **Victoria Falls Royal Lodge** - $580/night, 4.7 rating

### Tented Camp Category (3 hotels)
1. **Serengeti Under Canvas** - $320/night, 4.6 rating
2. **Mara River Camp** - $350/night, 4.5 rating
3. **Okavango Delta Tented Lodge** - $380/night, 4.7 rating

### Budget Hotel Category (3 hotels)
1. **Arusha Budget Inn** - $120/night, 4.2 rating
2. **Nairobi Safari Hotel** - $140/night, 4.1 rating
3. **Livingstone Backpackers** - $100/night, 4.3 rating

## Adding More Hotels

To add more hotels to your database:

```sql
INSERT INTO hotels (
  name,
  accommodation_type_id,
  description,
  image_url,
  rating,
  amenities,
  price_per_night,
  location
)
SELECT
  'Hotel Name Here',
  id,  -- This will be the accommodation type ID
  'Hotel description here...',
  'https://example.com/image.jpg',
  4.5,  -- Rating out of 5
  ARRAY['WiFi', 'Pool', 'Restaurant'],  -- Array of amenities
  250.00,  -- Price per night
  'City, Country'
FROM accommodation_types
WHERE slug = 'luxury-lodge';  -- Change to match your desired category
```

## Image URLs

The sample hotels use Unsplash images. For production, you should:
1. Upload your own hotel images to Supabase Storage
2. Update the `image_url` field with your storage URLs
3. Or use a CDN service for better performance

## Future Enhancements

Potential features to add:
- Link hotels to specific destinations
- Add photo galleries (multiple images per hotel)
- Add availability calendar
- Add booking functionality
- Add reviews and ratings from users
- Add search and filter functionality
- Add hotel comparison feature
