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
import { Plus, Edit, Trash2, Save, X, ArrowLeft, BedDouble, Check } from 'lucide-react';

interface AccommodationType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_per_night: number;
  amenities?: string[];
  is_active: boolean;
}

export function AdminAccommodationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accommodations, setAccommodations] = useState<AccommodationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price_per_night: '',
    amenities: '',
    is_active: true
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

  // Fetch accommodations
  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from('accommodation_types')
        .select('*')
        .order('price_per_night', { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error: any) {
      console.error('Error fetching accommodations:', error);
      toast.error('Failed to load accommodation types', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccommodations();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price_per_night: '',
      amenities: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (accommodation: AccommodationType) => {
    setFormData({
      name: accommodation.name,
      slug: accommodation.slug,
      description: accommodation.description || '',
      price_per_night: accommodation.price_per_night.toString(),
      amenities: accommodation.amenities?.join(', ') || '',
      is_active: accommodation.is_active
    });
    setEditingId(accommodation.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accommodation type?')) return;

    try {
      const { error } = await supabase
        .from('accommodation_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Accommodation type deleted successfully!');
      fetchAccommodations();
    } catch (error: any) {
      console.error('Error deleting accommodation:', error);
      toast.error('Failed to delete accommodation type', {
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse amenities from comma-separated string
    const amenitiesArray = formData.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const accommodationData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price_per_night: parseFloat(formData.price_per_night),
      amenities: amenitiesArray,
      is_active: formData.is_active
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('accommodation_types')
          .update(accommodationData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Accommodation type updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('accommodation_types')
          .insert([accommodationData]);

        if (error) throw error;
        toast.success('Accommodation type added successfully!');
      }

      resetForm();
      fetchAccommodations();
    } catch (error: any) {
      console.error('Error saving accommodation:', error);
      toast.error('Failed to save accommodation type', {
        description: error.message
      });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading accommodation types...</p>
        </div>
      </div>
    );
  }

  const activeAccommodations = accommodations.filter(a => a.is_active);
  const inactiveAccommodations = accommodations.filter(a => !a.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <BedDouble className="w-10 h-10 text-orange-600" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Manage Accommodation
              </h1>
            </div>
            <p className="text-gray-600 mt-2">Add, edit, or remove accommodation types and their pricing</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Type
          </Button>
        </div>

        {/* Active Accommodations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-orange-700">Active Accommodation Types ({activeAccommodations.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAccommodations.map((accommodation) => (
              <Card key={accommodation.id} className="border-4 border-orange-200 hover:border-orange-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{accommodation.name}</CardTitle>
                  <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{accommodation.slug}</code>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accommodation.description && (
                    <p className="text-sm text-gray-600">{accommodation.description}</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-600">
                      ${accommodation.price_per_night}
                    </span>
                    <span className="text-sm text-gray-500">/night per person</span>
                  </div>
                  {accommodation.amenities && accommodation.amenities.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {amenity}
                          </span>
                        ))}
                        {accommodation.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">+{accommodation.amenities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(accommodation)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(accommodation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Inactive Accommodations */}
        {inactiveAccommodations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-600">Inactive Accommodation Types ({inactiveAccommodations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveAccommodations.map((accommodation) => (
                <Card key={accommodation.id} className="border-4 border-gray-200 opacity-60">
                  <CardHeader>
                    <CardTitle className="text-lg">{accommodation.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-500">
                        ${accommodation.price_per_night}
                      </span>
                      <span className="text-sm text-gray-400">/night per person</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(accommodation)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(accommodation.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {accommodations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No accommodation types yet. Click "Add New Type" to get started!</p>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Edit Accommodation Type' : 'Add New Accommodation Type'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the accommodation details below' : 'Fill in the details to add a new accommodation type'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Accommodation Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Luxury Lodge, Classic Tented Camp"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug * (auto-generated)</Label>
                <Input
                  id="slug"
                  placeholder="luxury-lodge"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Used in URLs and code. Should be lowercase with hyphens.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this accommodation type..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price Per Night (per person) * ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="300.00"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (Optional)</Label>
                <Textarea
                  id="amenities"
                  placeholder="WiFi, Pool, Spa, Fine Dining, Butler Service"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-gray-500">Separate amenities with commas</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked as boolean })
                  }
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active (visible to customers)
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
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Accommodation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
