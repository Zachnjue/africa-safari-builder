import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Sparkles } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  image_url: string;
  country: string;
  description?: string;
  activities: string[];
  is_featured: boolean;
}

// AI Helper to generate suggestions based on destination
const generateDestinationSuggestions = (name: string, country: string) => {
  const lowerName = name.toLowerCase();
  const lowerCountry = country.toLowerCase();

  // Common African safari destinations knowledge base
  const suggestions: Record<string, any> = {
    serengeti: {
      description: "Experience the world's most spectacular wildlife migration in the vast plains of the Serengeti. Home to the Big Five and countless other species, this UNESCO World Heritage Site offers unparalleled game viewing opportunities year-round. Witness millions of wildebeest, zebras, and gazelles on their annual journey across the endless savanna.",
      activities: ["Game Drives", "Hot Air Balloon Safari", "Walking Safari", "Bird Watching", "Great Migration Viewing", "Photography Tours", "Cultural Village Visits"]
    },
    masai_mara: {
      description: "Discover Kenya's crown jewel, the Masai Mara, renowned for its exceptional population of lions, leopards, cheetahs, and the annual wildebeest migration. This spectacular reserve offers year-round wildlife viewing in one of Africa's most diverse ecosystems.",
      activities: ["Game Drives", "Hot Air Balloon Safari", "Masai Cultural Experiences", "Walking Safari", "Bird Watching", "River Crossings Viewing", "Bush Breakfast"]
    },
    kruger: {
      description: "Explore South Africa's flagship national park, spanning nearly 20,000 square kilometers of diverse ecosystems. Kruger is home to an impressive variety of wildlife including the Big Five, plus over 500 bird species and incredible landscapes.",
      activities: ["Self-Drive Safari", "Guided Game Drives", "Bush Walks", "Bird Watching", "Night Safari", "Photography Safari", "Bush Camping"]
    },
    kilimanjaro: {
      description: "Challenge yourself to summit Africa's highest peak, Mount Kilimanjaro. Standing at 5,895 meters, this dormant volcano offers breathtaking views and a once-in-a-lifetime trekking experience through five distinct climate zones.",
      activities: ["Mountain Trekking", "Summit Climbing", "Wildlife Viewing", "Photography", "Cultural Tours", "Waterfall Hikes", "Coffee Plantation Tours"]
    },
    zanzibar: {
      description: "Unwind on the pristine beaches of Zanzibar, where crystal-clear turquoise waters meet powder-white sand. This tropical paradise combines rich history, vibrant culture, and world-class diving in the Indian Ocean.",
      activities: ["Beach Relaxation", "Snorkeling", "Scuba Diving", "Spice Farm Tours", "Stone Town Walking Tours", "Dolphin Watching", "Sunset Dhow Cruises"]
    },
    okavango: {
      description: "Experience the unique ecosystem of the Okavango Delta, a UNESCO World Heritage Site and one of the world's largest inland deltas. This pristine wilderness offers exceptional wildlife viewing in a breathtaking water wilderness.",
      activities: ["Mokoro Canoe Safaris", "Game Drives", "Walking Safari", "Bird Watching", "Fishing", "Photography", "Island Camping"]
    },
    victoria_falls: {
      description: "Witness the power and majesty of Victoria Falls, one of the Seven Natural Wonders of the World. Known locally as 'The Smoke That Thunders,' this spectacular waterfall offers adventure activities and unforgettable views.",
      activities: ["Waterfall Viewing", "White Water Rafting", "Bungee Jumping", "Helicopter Flights", "Sunset Cruises", "Devil's Pool Swimming", "Wildlife Safaris"]
    }
  };

  // Try to match destination
  for (const [key, value] of Object.entries(suggestions)) {
    if (lowerName.includes(key) || lowerName.replace(/\s+/g, '_').includes(key)) {
      return value;
    }
  }

  // Generic suggestions based on country
  if (lowerCountry.includes('tanzania')) {
    return {
      description: `Discover the natural wonders of ${name}, Tanzania. Experience authentic African wildlife, stunning landscapes, and rich cultural heritage in one of East Africa's most diverse destinations.`,
      activities: ["Game Drives", "Cultural Tours", "Bird Watching", "Photography Safari", "Walking Tours", "Scenic Viewing"]
    };
  } else if (lowerCountry.includes('kenya')) {
    return {
      description: `Explore ${name}, a gem in Kenya's diverse landscape. From abundant wildlife to vibrant local culture, this destination offers an authentic East African experience.`,
      activities: ["Game Drives", "Cultural Village Visits", "Bird Watching", "Nature Walks", "Photography", "Local Market Tours"]
    };
  } else if (lowerCountry.includes('south africa')) {
    return {
      description: `Experience the beauty of ${name}, South Africa. Combining world-class wildlife viewing with stunning scenery and rich biodiversity, this destination showcases the best of Southern Africa.`,
      activities: ["Game Drives", "Wine Tasting", "Scenic Drives", "Hiking", "Bird Watching", "Cultural Experiences"]
    };
  }

  // Default generic African destination
  return {
    description: `Embark on an unforgettable journey to ${name}, ${country}. This unique African destination offers authentic wildlife experiences, breathtaking landscapes, and rich cultural encounters that will create memories to last a lifetime.`,
    activities: ["Wildlife Viewing", "Cultural Tours", "Nature Walks", "Photography", "Bird Watching", "Local Experiences"]
  };
};

export function AdminDestinationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingActivities, setGeneratingActivities] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    country: '',
    description: '',
    activities: '',
    is_featured: false
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to access admin panel');
        navigate('/signin');
      } else {
        setUser(user);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch destinations
  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error: any) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destinations', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDestinations();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      country: '',
      description: '',
      activities: '',
      is_featured: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleGenerateDescription = () => {
    if (!formData.name || !formData.country) {
      toast.error('Please enter destination name and country first');
      return;
    }

    setGeneratingDescription(true);
    // Simulate API delay for better UX
    setTimeout(() => {
      const suggestions = generateDestinationSuggestions(formData.name, formData.country);
      setFormData({ ...formData, description: suggestions.description });
      setGeneratingDescription(false);
      toast.success('Description generated! Feel free to edit it.');
    }, 800);
  };

  const handleGenerateActivities = () => {
    if (!formData.name || !formData.country) {
      toast.error('Please enter destination name and country first');
      return;
    }

    setGeneratingActivities(true);
    // Simulate API delay for better UX
    setTimeout(() => {
      const suggestions = generateDestinationSuggestions(formData.name, formData.country);
      setFormData({ ...formData, activities: suggestions.activities.join(', ') });
      setGeneratingActivities(false);
      toast.success('Activities generated! Feel free to edit them.');
    }, 800);
  };

  const handleGenerateImageUrl = async () => {
    if (!formData.name) {
      toast.error('Please enter destination name first');
      return;
    }

    setGeneratingImage(true);

    try {
      // Create search query from destination name and country
      const searchQuery = `${formData.name} ${formData.country} africa safari wildlife`.replace(/\s+/g, ',');

      // Using Unsplash API to search for relevant images
      const unsplashAccessKey = 'your-access-key-here'; // In production, this would be in env variables

      // For demo purposes, we'll use Unsplash Source which doesn't require auth
      // Format: https://source.unsplash.com/1600x900/?keyword1,keyword2
      const imageUrl = `https://source.unsplash.com/1600x900/?${searchQuery}`;

      // Alternatively, fetch from Unsplash API for better results
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(formData.name + ' ' + formData.country + ' africa')}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': 'Client-ID qXsHnORB-E-eHn1vdqLcb_6h4F1T2llWf2sHKUnaYzY'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const selectedImage = data.results[0];
          setFormData({ ...formData, image_url: selectedImage.urls.regular });
          toast.success('Image URL generated! Preview should load shortly.');
        } else {
          // Fallback to source URL if no results
          setFormData({ ...formData, image_url: imageUrl });
          toast.success('Image URL generated!');
        }
      } else {
        // Fallback to source URL if API fails
        setFormData({ ...formData, image_url: imageUrl });
        toast.success('Image URL generated!');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to basic source URL
      const fallbackQuery = `${formData.name} ${formData.country}`.replace(/\s+/g, ',');
      const fallbackUrl = `https://source.unsplash.com/1600x900/?${fallbackQuery}`;
      setFormData({ ...formData, image_url: fallbackUrl });
      toast.success('Image URL generated with fallback!');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleEdit = (dest: Destination) => {
    setFormData({
      name: dest.name,
      image_url: dest.image_url,
      country: dest.country,
      description: dest.description || '',
      activities: dest.activities.join(', '),
      is_featured: dest.is_featured
    });
    setEditingId(dest.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Destination deleted successfully!');
      fetchDestinations();
    } catch (error: any) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination', {
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse activities from comma-separated string
    const activitiesArray = formData.activities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const destinationData = {
      name: formData.name,
      image_url: formData.image_url,
      country: formData.country,
      description: formData.description,
      activities: activitiesArray,
      is_featured: formData.is_featured
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('destinations')
          .update(destinationData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Destination updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('destinations')
          .insert([destinationData]);

        if (error) throw error;
        toast.success('Destination added successfully!');
      }

      resetForm();
      fetchDestinations();
    } catch (error: any) {
      console.error('Error saving destination:', error);
      toast.error('Failed to save destination', {
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Manage Destinations
            </h1>
            <p className="text-gray-600 mt-2">Add, edit, or remove destinations from your website</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Destination
          </Button>
        </div>

        {/* Destinations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Card key={dest.id} className="overflow-hidden border-4 border-purple-200 hover:border-purple-400 transition-all">
              <div className="relative h-48">
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {dest.is_featured && (
                  <div className="absolute top-2 right-2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{dest.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{dest.country}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {dest.activities.length} activities
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(dest)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(dest.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {destinations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No destinations yet. Click "Add New Destination" to get started!</p>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Edit Destination' : 'Add New Destination'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the destination details below' : 'Fill in the details to add a new destination'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Destination Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Serengeti National Park, Tanzania"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., Tanzania"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image_url">Image URL *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateImageUrl}
                    disabled={generatingImage || !formData.name}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {generatingImage ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {!formData.name
                    ? 'Fill in destination name to enable AI image generation'
                    : 'Paste a direct link to an image, or click "Generate with AI" for suggestions from Unsplash'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription || !formData.name || !formData.country}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {generatingDescription ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Brief description of the destination..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {!formData.name || !formData.country
                    ? 'Fill in name and country to enable AI suggestions'
                    : 'Click "Generate with AI" for a suggested description'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="activities">Activities *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateActivities}
                    disabled={generatingActivities || !formData.name || !formData.country}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {generatingActivities ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  id="activities"
                  placeholder="Game Drives, Hot Air Balloon Safari, Bird Watching"
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500">
                  {!formData.name || !formData.country
                    ? 'Fill in name and country to enable AI suggestions'
                    : 'Separate activities with commas, or click "Generate with AI" for suggestions'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked as boolean })
                  }
                />
                <label
                  htmlFor="is_featured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as Featured Destination
                </label>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Destination
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
