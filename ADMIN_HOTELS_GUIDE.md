# Admin Hotels Management Guide

## Overview
You now have a complete hotels management system in the admin panel. Admin users can add, edit, preview, and delete hotels directly from the admin dashboard.

## Accessing the Hotels Management Page

### Option 1: From Admin Dashboard
1. Navigate to `/admin` or `/admin/dashboard`
2. Click on the **"Hotels"** card (rose/pink colored)
3. Or click **"Add Hotel"** in the Quick Actions section

### Option 2: Direct URL
- Navigate directly to: `/admin/hotels`

## Features

### 1. Hotels Overview
- **Total Hotels Count**: See how many hotels are in the system
- **Active Hotels Count**: Shows only active/visible hotels
- **Average Rating**: Displays the average rating across all hotels
- **Hotel Cards**: Visual cards showing key hotel information

### 2. Add New Hotel
Click the **"Add New Hotel"** button to open a comprehensive form with:

#### Required Fields:
- **Hotel Name**: e.g., "Serengeti Safari Lodge"
- **Accommodation Type**: Select from Luxury Lodge, Tented Camp, Budget Hotel
- **Price Per Night (USD)**: Hotel's nightly rate

#### Optional Fields:
- **Destination**: Link hotel to a specific destination
- **Rating**: 0-5 star rating (e.g., 4.5)
- **Location**: Full address (e.g., "Serengeti National Park, Tanzania")
- **Description**: Detailed information about the hotel
- **Image URL**: URL to hotel image
- **Amenities**: Comma-separated list (e.g., "WiFi, Pool, Spa, Restaurant")
- **Contact Email**: Hotel's contact email
- **Contact Phone**: Hotel's contact number
- **Active Status**: Toggle to show/hide from users

### 3. Edit Hotel
- Click the **"Edit"** button on any hotel card
- Modify any hotel information
- Click **"Update Hotel"** to save changes

### 4. Preview Hotel
- Click the **"Preview"** button to see how the hotel appears to users
- Shows full details including:
  - Large image
  - Description
  - Amenities list
  - Rating
  - Contact information
  - Pricing

### 5. Delete Hotel
- Click the **trash icon** button on any hotel card
- Confirm deletion
- Hotel is permanently removed

## Hotel Card Information Display
Each hotel card shows:
- Hotel image (if provided)
- Hotel name
- Accommodation category (color-coded)
- Location with map pin icon
- Star rating
- Price per night
- Brief description (truncated)
- Active/Inactive status badge
- Action buttons (Preview, Edit, Delete)

## Integration with Trip Builder

Hotels automatically appear in the Trip Builder when users:
1. Select an accommodation category (Step 2)
2. Hotels are filtered by the selected accommodation type
3. Hotels are displayed with all relevant information
4. Users can click to select a hotel
5. Users can preview hotels before selecting

## Database Requirements

### Before Using This Feature:
1. Run the `hotels-schema.sql` file in your Supabase SQL Editor
2. This creates the hotels table and adds 9 sample hotels
3. Verify the table exists: `SELECT * FROM hotels;`

### Hotels Table Structure:
```sql
- id: UUID (primary key)
- name: TEXT (required)
- accommodation_type_id: UUID (foreign key to accommodation_types)
- destination_id: UUID (optional foreign key to destinations)
- description: TEXT
- image_url: TEXT
- rating: DECIMAL(2,1) between 0-5
- amenities: TEXT[] (array)
- price_per_night: DECIMAL(10,2) (required)
- location: TEXT
- contact_email: TEXT
- contact_phone: TEXT
- is_active: BOOLEAN (default true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Best Practices

### Image URLs
- Use high-quality images (minimum 800px wide)
- Recommended sources:
  - Supabase Storage (upload to your project)
  - Unsplash (free high-quality images)
  - Your own hotel image URLs
- Always test image URLs before saving

### Pricing
- Set realistic prices for each accommodation tier
- Luxury Lodge: $500-800/night
- Tented Camp: $300-400/night
- Budget Hotel: $100-200/night

### Descriptions
- Write compelling 2-3 sentence descriptions
- Highlight unique features
- Mention nearby attractions
- Keep it concise but informative

### Amenities
- Use consistent naming (e.g., always "WiFi" not "wifi" or "Wi-Fi")
- Common amenities: WiFi, Pool, Spa, Restaurant, Bar, Gym, Room Service
- Separate with commas
- No spaces after commas (the system handles this)

### Ratings
- Use realistic ratings (4.0-5.0 for good hotels)
- Include decimal point for precision (e.g., 4.7)
- Leave blank if no rating available

## Navigation Paths

```
Admin Dashboard → Hotels Card → Hotels Management Page
       ↓
   Add Hotel
       ↓
   Fill Form
       ↓
   Save Hotel
       ↓
   Appears in Trip Builder
```

## Troubleshooting

### Hotels Not Showing in Trip Builder
1. Check hotel `is_active` is set to `true`
2. Verify `accommodation_type_id` matches a valid accommodation type
3. Check database connection in browser console

### Images Not Loading
1. Verify image URL is publicly accessible
2. Check for HTTPS (not HTTP)
3. Test URL in browser directly
4. Consider uploading to Supabase Storage

### Can't Delete Hotel
1. Check if you're logged in as admin
2. Verify database permissions
3. Check browser console for errors

## Admin Access

### Requirements:
- Must be logged in with a valid Supabase account
- Authenticated users automatically have admin access
- Consider implementing role-based access control for production

## Future Enhancements

Consider adding:
- Photo gallery (multiple images per hotel)
- Room types and availability
- Booking functionality
- User reviews and ratings
- Bulk import/export
- Hotel comparison feature
- Advanced search and filters

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify database schema is properly set up
3. Review the `hotels-schema.sql` file
4. Check Supabase logs for backend errors
