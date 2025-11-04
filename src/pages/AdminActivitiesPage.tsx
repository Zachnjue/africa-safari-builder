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
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Ticket } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description?: string;
  price_per_person: number;
  category?: string;
  is_active: boolean;
}

const categories = ['Wildlife', 'Adventure', 'Cultural', 'Nature', 'Recreation', 'Sightseeing'];

export function AdminActivitiesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_person: '',
    category: '',
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

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_per_person: '',
      category: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      name: activity.name,
      description: activity.description || '',
      price_per_person: activity.price_per_person.toString(),
      category: activity.category || '',
      is_active: activity.is_active
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Activity deleted successfully!');
      fetchActivities();
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity', {
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activityData = {
      name: formData.name,
      description: formData.description,
      price_per_person: parseFloat(formData.price_per_person),
      category: formData.category,
      is_active: formData.is_active
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Activity updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('activities')
          .insert([activityData]);

        if (error) throw error;
        toast.success('Activity added successfully!');
      }

      resetForm();
      fetchActivities();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity', {
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading activities...</p>
        </div>
      </div>
    );
  }

  const activeActivities = activities.filter(a => a.is_active);
  const inactiveActivities = activities.filter(a => !a.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12">
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
              <Ticket className="w-10 h-10 text-amber-600" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Manage Activities
              </h1>
            </div>
            <p className="text-gray-600 mt-2">Add, edit, or remove activities and their pricing</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Activity
          </Button>
        </div>

        {/* Active Activities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-amber-700">Active Activities ({activeActivities.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeActivities.map((activity) => (
              <Card key={activity.id} className="border-4 border-amber-200 hover:border-amber-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{activity.name}</CardTitle>
                  {activity.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                      {activity.category}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.description && (
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-amber-600">
                      ${activity.price_per_person}
                    </span>
                    <span className="text-sm text-gray-500">/person</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(activity)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Inactive Activities */}
        {inactiveActivities.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-600">Inactive Activities ({inactiveActivities.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveActivities.map((activity) => (
                <Card key={activity.id} className="border-4 border-gray-200 opacity-60">
                  <CardHeader>
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                    {activity.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {activity.category}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-500">
                        ${activity.price_per_person}
                      </span>
                      <span className="text-sm text-gray-400">/person</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(activity)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
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

        {activities.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No activities yet. Click "Add New Activity" to get started!</p>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Edit Activity' : 'Add New Activity'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the activity details below' : 'Fill in the details to add a new activity'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Activity Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Game Drives, Hot Air Balloon Safari"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the activity..."
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
                    placeholder="150.00"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Activity
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
