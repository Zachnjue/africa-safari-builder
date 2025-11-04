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
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Plane, Car } from 'lucide-react';

interface TransportOption {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_per_person: number;
  vehicle_type?: string;
  is_active: boolean;
}

export function AdminTransportationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price_per_person: '',
    vehicle_type: '',
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

  // Fetch transport options
  const fetchTransports = async () => {
    try {
      const { data, error } = await supabase
        .from('transport_options')
        .select('*')
        .order('price_per_person', { ascending: true });

      if (error) throw error;
      setTransports(data || []);
    } catch (error: any) {
      console.error('Error fetching transport options:', error);
      toast.error('Failed to load transport options', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransports();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price_per_person: '',
      vehicle_type: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (transport: TransportOption) => {
    setFormData({
      name: transport.name,
      slug: transport.slug,
      description: transport.description || '',
      price_per_person: transport.price_per_person.toString(),
      vehicle_type: transport.vehicle_type || '',
      is_active: transport.is_active
    });
    setEditingId(transport.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transport option?')) return;

    try {
      const { error } = await supabase
        .from('transport_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Transport option deleted successfully!');
      fetchTransports();
    } catch (error: any) {
      console.error('Error deleting transport:', error);
      toast.error('Failed to delete transport option', {
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transportData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price_per_person: parseFloat(formData.price_per_person),
      vehicle_type: formData.vehicle_type,
      is_active: formData.is_active
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('transport_options')
          .update(transportData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Transport option updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('transport_options')
          .insert([transportData]);

        if (error) throw error;
        toast.success('Transport option added successfully!');
      }

      resetForm();
      fetchTransports();
    } catch (error: any) {
      console.error('Error saving transport:', error);
      toast.error('Failed to save transport option', {
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading transport options...</p>
        </div>
      </div>
    );
  }

  const activeTransports = transports.filter(t => t.is_active);
  const inactiveTransports = transports.filter(t => !t.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12">
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
              <Plane className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Manage Transportation
              </h1>
            </div>
            <p className="text-gray-600 mt-2">Add, edit, or remove transportation options and their pricing</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Option
          </Button>
        </div>

        {/* Active Transport Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Active Transport Options ({activeTransports.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTransports.map((transport) => {
              const isAir = transport.slug.includes('air') || transport.vehicle_type?.toLowerCase().includes('air') || transport.vehicle_type?.toLowerCase().includes('flight');
              const Icon = isAir ? Plane : Car;

              return (
                <Card key={transport.id} className="border-4 border-blue-200 hover:border-blue-400 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <CardTitle className="text-lg">{transport.name}</CardTitle>
                    </div>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{transport.slug}</code>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {transport.description && (
                      <p className="text-sm text-gray-600">{transport.description}</p>
                    )}
                    {transport.vehicle_type && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="font-semibold">Vehicle:</span>
                        {transport.vehicle_type}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ${transport.price_per_person}
                      </span>
                      <span className="text-sm text-gray-500">/person</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transport)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(transport.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Inactive Transport Options */}
        {inactiveTransports.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-600">Inactive Transport Options ({inactiveTransports.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveTransports.map((transport) => (
                <Card key={transport.id} className="border-4 border-gray-200 opacity-60">
                  <CardHeader>
                    <CardTitle className="text-lg">{transport.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-500">
                        ${transport.price_per_person}
                      </span>
                      <span className="text-sm text-gray-400">/person</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transport)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(transport.id)}
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

        {transports.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No transport options yet. Click "Add New Option" to get started!</p>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Edit Transport Option' : 'Add New Transport Option'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the transport details below' : 'Fill in the details to add a new transport option'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Transport Option Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., By Road (4x4 Safari Vehicle)"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug * (auto-generated)</Label>
                <Input
                  id="slug"
                  placeholder="road"
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
                  placeholder="Brief description of this transport option..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price Per Person * ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type (Optional)</Label>
                  <Input
                    id="vehicle_type"
                    placeholder="e.g., 4x4 Safari Vehicle"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  />
                </div>
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Transport
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
