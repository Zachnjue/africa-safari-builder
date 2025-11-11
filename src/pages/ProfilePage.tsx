import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { toast } from 'sonner';
import { Camera, LogOut, MapPin, Compass, X, Plus } from 'lucide-react';
import { externalImages } from '@/assets/placeholders';
import { supabase } from '@/lib/supabaseClient';

const interests = [
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'culture', label: 'Cultural Tours' },
  { id: 'beach', label: 'Beach Relaxation' },
  { id: 'hiking', label: 'Hiking & Trekking' },
  { id: 'luxury', label: 'Luxury Stays' },
  { id: 'history', label: 'Historical Sites' },
];

interface Destination {
  id: string;
  name: string;
  country: string;
}

interface Activity {
  id: string;
  name: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customDestinations, setCustomDestinations] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [newDestination, setNewDestination] = useState('');
  const [newActivity, setNewActivity] = useState('');

  // ✅ Fetch current user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
      } else {
        setUser(user);
        // Check if this is a new user (from signup with redirect intent)
        const fromPath = location.state?.from;
        setIsNewUser(!!fromPath);

        // Load saved preferences from user metadata
        const metadata = user.user_metadata || {};
        setSelectedDestinations(metadata.preferred_destinations || []);
        setSelectedActivities(metadata.preferred_activities || []);
        setSelectedInterests(metadata.interests || []);
        setCustomDestinations(metadata.custom_destinations || []);
        setCustomActivities(metadata.custom_activities || []);
      }
    };
    fetchUser();
  }, [navigate, location]);

  // Fetch destinations and activities from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch destinations
        const { data: destData, error: destError } = await supabase
          .from('destinations')
          .select('id, name, country')
          .order('name');

        if (destError) throw destError;
        setDestinations(destData || []);

        // Fetch activities
        const { data: actData, error: actError } = await supabase
          .from('activities')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (actError) throw actError;
        setActivities(actData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load preferences options');
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('You have been logged out.');
    navigate('/signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update user metadata with preferences
      const { error } = await supabase.auth.updateUser({
        data: {
          preferred_destinations: selectedDestinations,
          preferred_activities: selectedActivities,
          interests: selectedInterests,
          custom_destinations: customDestinations,
          custom_activities: customActivities,
        }
      });

      if (error) throw error;

      const redirectPath = isNewUser ? '/build-trip' : '/destinations';
      const redirectMessage = isNewUser ? 'Redirecting to trip builder...' : 'Profile saved!';

      toast.success(`Profile updated successfully! ${redirectMessage}`);
      if (isNewUser) {
        setTimeout(() => navigate(redirectPath), 1500);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile', { description: error.message });
    }
  };

  const toggleDestination = (destId: string) => {
    setSelectedDestinations(prev =>
      prev.includes(destId) ? prev.filter(id => id !== destId) : [...prev, destId]
    );
  };

  const toggleActivity = (actId: string) => {
    setSelectedActivities(prev =>
      prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]
    );
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId) ? prev.filter(id => id !== interestId) : [...prev, interestId]
    );
  };

  const addCustomDestination = () => {
    if (newDestination.trim() && !customDestinations.includes(newDestination.trim())) {
      setCustomDestinations(prev => [...prev, newDestination.trim()]);
      setNewDestination('');
      toast.success('Custom destination added!');
    }
  };

  const removeCustomDestination = (dest: string) => {
    setCustomDestinations(prev => prev.filter(d => d !== dest));
  };

  const addCustomActivity = () => {
    if (newActivity.trim() && !customActivities.includes(newActivity.trim())) {
      setCustomActivities(prev => [...prev, newActivity.trim()]);
      setNewActivity('');
      toast.success('Custom activity added!');
    }
  };

  const removeCustomActivity = (act: string) => {
    setCustomActivities(prev => prev.filter(a => a !== act));
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950/90 min-h-screen">
      <div className="container mx-auto max-w-5xl py-12 px-4">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div
            className="h-48 md:h-64 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url('${externalImages.profileBackground}')` }}
          ></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              <ImageWithFallback
                className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-900 object-cover"
                src={user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`}
                alt={user.user_metadata?.full_name || user.email}
              />
              <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.user_metadata?.full_name || 'Traveler'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          <Button onClick={handleLogout} variant="destructive" className="mt-4">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Profile & Preferences</CardTitle>
            <CardDescription>Tell us more about you to personalize your trip recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={user.user_metadata?.full_name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Travel Preferences</Label>
                <div className="space-y-2">
                  <Label htmlFor="travelStyle">Preferred Travel Style</Label>
                  <Select>
                    <SelectTrigger id="travelStyle">
                      <SelectValue placeholder="Select your style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget-friendly</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">General Travel Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {interests.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={() => toggleInterest(interest.id)}
                      />
                      <label
                        htmlFor={interest.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Wishlist */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                  <Label className="text-lg font-medium">Destination Wishlist</Label>
                </div>
                <p className="text-sm text-gray-600">Select the destinations you'd like to visit</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-cyan-200">
                  {destinations.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-full text-center py-4">
                      Loading destinations...
                    </p>
                  ) : (
                    destinations.map((destination) => (
                      <div
                        key={destination.id}
                        className={`flex items-start space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedDestinations.includes(destination.id)
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                            : 'border-gray-200 hover:border-cyan-300 bg-white dark:bg-gray-800'
                        }`}
                        onClick={() => toggleDestination(destination.id)}
                      >
                        <Checkbox
                          id={`dest-${destination.id}`}
                          checked={selectedDestinations.includes(destination.id)}
                          onCheckedChange={() => toggleDestination(destination.id)}
                        />
                        <label
                          htmlFor={`dest-${destination.id}`}
                          className="text-sm font-medium leading-tight cursor-pointer flex-1"
                        >
                          <div>{destination.name}</div>
                          <div className="text-xs text-gray-500">{destination.country}</div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedDestinations.length > 0 && (
                  <p className="text-sm text-cyan-600 font-medium">
                    {selectedDestinations.length} destination{selectedDestinations.length !== 1 ? 's' : ''} selected
                  </p>
                )}

                {/* Add Custom Destination */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Don't see your destination? Add it here:</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Zanzibar, Tanzania or Victoria Falls"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDestination())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCustomDestination}
                      disabled={!newDestination.trim()}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Display Custom Destinations */}
                {customDestinations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-cyan-700">Your Custom Destinations:</Label>
                    <div className="flex flex-wrap gap-2">
                      {customDestinations.map((dest) => (
                        <div
                          key={dest}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-400 rounded-lg"
                        >
                          <MapPin className="h-4 w-4 text-cyan-600" />
                          <span className="text-sm font-medium text-gray-900">{dest}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomDestination(dest)}
                            className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-teal-600" />
                  <Label className="text-lg font-medium">Activity Preferences</Label>
                </div>
                <p className="text-sm text-gray-600">Choose the activities you'd like to experience</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-teal-200">
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-full text-center py-4">
                      Loading activities...
                    </p>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-start space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedActivities.includes(activity.id)
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-gray-200 hover:border-teal-300 bg-white dark:bg-gray-800'
                        }`}
                        onClick={() => toggleActivity(activity.id)}
                      >
                        <Checkbox
                          id={`act-${activity.id}`}
                          checked={selectedActivities.includes(activity.id)}
                          onCheckedChange={() => toggleActivity(activity.id)}
                        />
                        <label
                          htmlFor={`act-${activity.id}`}
                          className="text-sm font-medium leading-tight cursor-pointer flex-1"
                        >
                          {activity.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedActivities.length > 0 && (
                  <p className="text-sm text-teal-600 font-medium">
                    {selectedActivities.length} activit{selectedActivities.length !== 1 ? 'ies' : 'y'} selected
                  </p>
                )}

                {/* Add Custom Activity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Don't see your activity? Add it here:</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Scuba diving, Hot air balloon, Mountain climbing"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomActivity())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCustomActivity}
                      disabled={!newActivity.trim()}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Display Custom Activities */}
                {customActivities.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-teal-700">Your Custom Activities:</Label>
                    <div className="flex flex-wrap gap-2">
                      {customActivities.map((activity) => (
                        <div
                          key={activity}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-100 to-green-100 border-2 border-teal-400 rounded-lg"
                        >
                          <Compass className="h-4 w-4 text-teal-600" />
                          <span className="text-sm font-medium text-gray-900">{activity}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomActivity(activity)}
                            className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/destinations')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
