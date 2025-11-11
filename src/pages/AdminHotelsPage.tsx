import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Hotel, Star, MapPin, Eye } from 'lucide-react';

interface HotelData {
  id: string;
  name: string;
  accommodation_type_id: string;
  destination_id?: string;
  description: string;
  image_url?: string;
  rating?: number;
  amenities?: string[];
  price_per_night: number;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

interface AccommodationType {
  id: string;
  name: string;
  slug: string;
}

interface Destination {
  id: string;
  name: string;
}

export function AdminHotelsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationType[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewHotel, setPreviewHotel] = useState<HotelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('AdminHotelsPage render - loading:', loading, 'user:', !!user, 'error:', error, 'showForm:', showForm);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    accommodation_type_id: '',
    destination_id: 'none',
    description: '',
    image_url: '',
    rating: '',
    amenities: '',
    price_per_night: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    is_active: true
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Auth error:', error);
          toast.error('Authentication error');
          navigate('/signin');
          return;
        }

        if (!user) {
          toast.error('Please sign in to access admin panel');
          navigate('/signin');
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Exception checking auth:', err);
        toast.error('Failed to check authentication');
        navigate('/signin');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch hotels and related data
  const fetchData = async () => {
    try {
      const [hotelsResult, accomResult, destResult] = await Promise.all([
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
        supabase.from('accommodation_types').select('id, name, slug'),
        supabase.from('destinations').select('id, name')
      ]);

      if (hotelsResult.error) {
        // Check if it's a "relation does not exist" error
        if (hotelsResult.error.message.includes('relation') || hotelsResult.error.message.includes('does not exist')) {
          setError('hotels_table_missing');
          setLoading(false);
          return;
        }
        throw hotelsResult.error;
      }
      if (accomResult.error) throw accomResult.error;
      if (destResult.error) throw destResult.error;

      setHotels(hotelsResult.data || []);
      setAccommodationTypes(accomResult.data || []);
      setDestinations(destResult.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('general_error');
      toast.error('Failed to load data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      accommodation_type_id: '',
      destination_id: 'none',
      description: '',
      image_url: '',
      rating: '',
      amenities: '',
      price_per_night: '',
      location: '',
      contact_email: '',
      contact_phone: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (hotel: HotelData) => {
    setFormData({
      name: hotel.name,
      accommodation_type_id: hotel.accommodation_type_id,
      destination_id: hotel.destination_id || 'none',
      description: hotel.description || '',
      image_url: hotel.image_url || '',
      rating: hotel.rating?.toString() || '',
      amenities: hotel.amenities?.join(', ') || '',
      price_per_night: hotel.price_per_night.toString(),
      location: hotel.location || '',
      contact_email: hotel.contact_email || '',
      contact_phone: hotel.contact_phone || '',
      is_active: hotel.is_active
    });
    setEditingId(hotel.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Hotel deleted successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting hotel:', error);
      toast.error('Failed to delete hotel', {
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.accommodation_type_id || !formData.price_per_night) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Parse amenities from comma-separated string
    const amenitiesArray = formData.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const hotelData: any = {
      name: formData.name,
      accommodation_type_id: formData.accommodation_type_id,
      destination_id: formData.destination_id || null,
      description: formData.description,
      image_url: formData.image_url || null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      amenities: amenitiesArray,
      price_per_night: parseFloat(formData.price_per_night),
      location: formData.location || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      is_active: formData.is_active
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('hotels')
          .update(hotelData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Hotel updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('hotels')
          .insert([hotelData]);

        if (error) throw error;
        toast.success('Hotel created successfully!');
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving hotel:', error);
      toast.error('Failed to save hotel', {
        description: error.message
      });
    }
  };

  const getAccommodationTypeName = (id: string) => {
    return accommodationTypes.find(a => a.id === id)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  // If not loading but no user, show error
  if (!loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the admin panel</p>
          <Button onClick={() => navigate('/signin')} className="bg-cyan-600 hover:bg-blue-700">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show setup instructions if hotels table doesn't exist
  if (error === 'hotels_table_missing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-4 border-cyan-400">
            <CardHeader className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Hotel className="h-8 w-8" />
                Hotels Table Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-teal-900 mb-2">
                  The hotels table hasn't been created yet
                </h3>
                <p className="text-teal-800">
                  To use the hotels management feature, you need to run the SQL schema in your Supabase database.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Setup Instructions:</h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Open the SQL file</h4>
                      <p className="text-gray-700">
                        Find the file <code className="bg-gray-100 px-2 py-1 rounded">hotels-schema.sql</code> in your project root directory
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Go to Supabase</h4>
                      <p className="text-gray-700">
                        Open your Supabase project dashboard and navigate to the <strong>SQL Editor</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Run the SQL</h4>
                      <p className="text-gray-700">
                        Copy the entire contents of <code className="bg-gray-100 px-2 py-1 rounded">hotels-schema.sql</code> and paste it into the SQL Editor, then click <strong>Run</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Refresh this page</h4>
                      <p className="text-gray-700">
                        After the SQL executes successfully, refresh this page to start managing hotels
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">What you'll get:</h4>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>✓ Hotels table with all necessary fields</li>
                  <li>✓ 9 sample hotels (3 per accommodation category)</li>
                  <li>✓ Proper indexes and security policies</li>
                  <li>✓ Ready to use in Trip Builder</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-cyan-600 hover:bg-blue-700"
                >
                  I've run the SQL - Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <Card className="mt-6 border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>SQL File Location:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/hotels-schema.sql</code>
              </p>
              <p>
                <strong>Documentation:</strong> Check <code className="bg-gray-100 px-2 py-1 rounded">HOTELS_SETUP.md</code> for detailed instructions
              </p>
              <p>
                <strong>Supabase SQL Editor:</strong> Project Dashboard → SQL Editor → New Query
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show general error state
  if (error === 'general_error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-4 border-red-400">
            <CardHeader className="bg-gradient-to-r from-red-400 to-cyan-400 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Hotel className="h-8 w-8" />
                Error Loading Hotels
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-red-800">
                  There was an error loading the hotels page. Please check the console for details.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-cyan-600 hover:bg-blue-700"
                >
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Hotel className="h-8 w-8 text-cyan-600" />
                Manage Hotels
              </h1>
              <p className="text-gray-600 mt-1">Add, edit, or remove hotels from your accommodation options</p>
            </div>
          </div>
          <Button
            onClick={() => {
              console.log('Add New Hotel button clicked');
              setShowForm(true);
            }}
            className="bg-cyan-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Hotel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">{hotels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {hotels.filter(h => h.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                {hotels.filter(h => h.rating).length > 0
                  ? (hotels.reduce((sum, h) => sum + (h.rating || 0), 0) / hotels.filter(h => h.rating).length).toFixed(1)
                  : 'N/A'}
                {hotels.filter(h => h.rating).length > 0 && <Star className="h-6 w-6 fill-yellow-400 text-green-400" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotels List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {hotel.image_url && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                      <p className="text-sm text-cyan-600 font-medium">
                        {getAccommodationTypeName(hotel.accommodation_type_id)}
                      </p>
                    </div>
                    {!hotel.is_active && (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  {hotel.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {hotel.location}
                    </p>
                  )}

                  {hotel.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-green-400" />
                      <span className="text-sm font-medium">{hotel.rating} / 5.0</span>
                    </div>
                  )}

                  <div className="text-lg font-bold text-cyan-600">
                    ${hotel.price_per_night}/night
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewHotel(hotel)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(hotel)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(hotel.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hotels.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Hotel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first hotel</p>
              <Button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="bg-cyan-400 text-white sticky top-0 z-10">
                <CardTitle className="flex items-center justify-between">
                  <span>{editingId ? 'Edit Hotel' : 'Add New Hotel'}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Close button clicked');
                      resetForm();
                    }}
                    className="text-white hover:bg-blue-500"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Serengeti Safari Lodge"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="accommodation_type">Accommodation Type *</Label>
                  <Select
                    value={formData.accommodation_type_id}
                    onValueChange={(value) => setFormData({ ...formData, accommodation_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accommodationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destination">Destination (Optional)</Label>
                  <Select
                    value={formData.destination_id}
                    onValueChange={(value) => setFormData({ ...formData, destination_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price_per_night">Price Per Night (USD) *</Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    placeholder="e.g., 250.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="e.g., 4.5"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Serengeti National Park, Tanzania"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the hotel, its features, and what makes it special..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/hotel-image.jpg"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="e.g., WiFi, Pool, Spa, Restaurant, Bar"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="hotel@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (visible to users)
                  </Label>
                </div>
              </div>

                  <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-blue-700 flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Update' : 'Create'} Hotel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewHotel} onOpenChange={() => setPreviewHotel(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cyan-600 flex items-center gap-2">
                <Hotel className="h-6 w-6" />
                {previewHotel?.name}
              </DialogTitle>
              {previewHotel?.location && (
                <DialogDescription className="flex items-center gap-1 text-base">
                  <MapPin className="h-4 w-4" />
                  {previewHotel.location}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-6 py-4">
              {previewHotel?.image_url && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewHotel.image_url}
                    alt={previewHotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                {previewHotel?.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-green-400" />
                    <span className="text-lg font-semibold">{previewHotel.rating} / 5.0</span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-600">${previewHotel?.price_per_night}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-gray-700">{previewHotel?.description}</p>
              </div>

              {previewHotel?.amenities && previewHotel.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {previewHotel.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(previewHotel?.contact_email || previewHotel?.contact_phone) && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    {previewHotel.contact_email && (
                      <p>Email: {previewHotel.contact_email}</p>
                    )}
                    {previewHotel.contact_phone && (
                      <p>Phone: {previewHotel.contact_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewHotel(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
