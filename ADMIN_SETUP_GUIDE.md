# Admin System Setup Guide

This guide explains how to set up and use the admin system for managing your Africa Safari Builder website.

## Overview

The admin system allows you to dynamically manage:
- **Destinations**: Safari locations with images and descriptions
- **Activities**: Available activities with pricing
- **Accommodation Types**: Lodging options with pricing
- **Transportation Options**: Transport methods with pricing

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `supabase-schema.sql` in the root of your project
4. Copy and paste the entire content into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (destinations, activities, accommodation_types, transport_options)
- Indexes for better performance
- Row Level Security (RLS) policies
- Default data for accommodation types, transport options, and activities

### 2. Verify Your Supabase Environment Variables

Ensure your `.env.local` or `.env` file has the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### 3. Access the Admin Dashboard

1. Sign in to your application (create an account if you don't have one)
2. Once signed in, you'll see an "Admin" link in the header
3. Click "Admin" to access the admin dashboard at `/admin`

## Admin Features

### Admin Dashboard (`/admin`)

The main dashboard provides:
- Overview of all data (counts of destinations, activities, etc.)
- Quick navigation to each management section
- Statistics at a glance

### Manage Destinations (`/admin/destinations`)

**Features:**
- Add new destinations with images
- Edit existing destinations
- Delete destinations
- Mark destinations as "featured"
- Add activities specific to each destination

**Fields:**
- Name (e.g., "Serengeti National Park, Tanzania")
- Country
- Image URL
- Description (optional)
- Activities (comma-separated list)
- Featured status

### Manage Activities (`/admin/activities`)

**Features:**
- Add new activities
- Set pricing per person
- Categorize activities (Wildlife, Adventure, Cultural, etc.)
- Enable/disable activities
- Edit prices and descriptions

**Fields:**
- Activity name
- Description
- Price per person
- Category (Wildlife, Adventure, Cultural, Nature, Recreation, Sightseeing)
- Active status

### Manage Accommodation (`/admin/accommodation`)

**Features:**
- Add accommodation types
- Set nightly prices per person
- Add amenities
- Enable/disable accommodation types

**Fields:**
- Name (e.g., "Luxury Lodge")
- Slug (auto-generated URL-friendly name)
- Description
- Price per night (per person)
- Amenities (comma-separated)
- Active status

### Manage Transportation (`/admin/transportation`)

**Features:**
- Add transport options
- Set prices per person
- Specify vehicle types
- Enable/disable transport options

**Fields:**
- Name (e.g., "By Road (4x4 Safari Vehicle)")
- Slug (auto-generated)
- Description
- Price per person
- Vehicle type
- Active status

## How It Works

### Data Flow

1. **Admin updates data** in the admin panel
2. **Data is stored** in Supabase database
3. **Frontend pages fetch** data dynamically from Supabase
4. **Users see updated** destinations, prices, and activities in real-time

### Pages Using Dynamic Data

- **Destinations Page** (`/destinations`): Shows all destinations from the database
- **Trip Builder Page** (`/build-trip`): Uses dynamic pricing and activities
- **All Admin Pages**: Directly manage database content

### Security

The system uses Row Level Security (RLS) to ensure:
- Anyone can view active destinations, activities, accommodation, and transport
- Only authenticated users can access admin pages
- Only authenticated users can create, update, or delete data

**Note**: For production, you should implement proper admin role checking to ensure only authorized admins can access the admin panel.

## Common Tasks

### Adding a New Destination

1. Go to `/admin/destinations`
2. Click "Add New Destination"
3. Fill in the form:
   - Name and country
   - Image URL (use a direct link to an image)
   - Description (optional)
   - Activities (comma-separated, e.g., "Game Drives, Bird Watching")
   - Check "Featured" if you want it highlighted
4. Click "Add Destination"

### Updating Prices

1. Go to the relevant admin page (`/admin/activities`, `/admin/accommodation`, or `/admin/transportation`)
2. Find the item you want to update
3. Click "Edit"
4. Update the price
5. Click "Update"

### Disabling an Item

Instead of deleting, you can disable items:
1. Edit the item
2. Uncheck "Active (visible to customers)"
3. Save

This keeps the item in the database but hides it from customers.

## Tips

### Image URLs
- Use reliable image hosting services
- Ensure images are publicly accessible
- Recommended size: 800x600 pixels or larger
- Use HTTPS URLs for security

### Pricing Strategy
- Prices are per person unless specified
- Accommodation prices are per night per person
- Be consistent with your currency (USD by default)

### Activity Management
- Group similar activities using categories
- Provide clear, descriptive names
- Update prices seasonally if needed

### Destination Management
- Keep destination names consistent with industry standards
- Include country in the destination name for clarity
- Use high-quality, representative images

## Troubleshooting

### "Failed to load data" error
- Check your Supabase connection
- Verify environment variables are set correctly
- Check the browser console for specific errors

### Can't access admin panel
- Ensure you're signed in
- Check if your Supabase authentication is working
- Verify the routes are correctly set up in `App.tsx`

### Changes not appearing
- Refresh the page
- Check if the item is marked as "Active"
- Verify the data was saved in Supabase (check the Supabase dashboard)

### Database errors
- Ensure the SQL schema was executed completely
- Check Supabase logs for error details
- Verify RLS policies are enabled

## Next Steps

Consider implementing:
1. **Image upload**: Add image upload functionality instead of URL input
2. **Admin roles**: Create specific admin roles for better security
3. **Bulk operations**: Add bulk import/export features
4. **Analytics**: Track popular destinations and activities
5. **Booking management**: Extend the system to manage actual bookings
6. **Email notifications**: Get notified when new trip requests come in

## Support

For questions or issues:
- Check the Supabase documentation: https://supabase.com/docs
- Review the code comments in the admin pages
- Check the browser console for error messages

---

Happy managing!
