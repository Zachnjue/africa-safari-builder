import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

const interests = [
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'culture', label: 'Cultural Tours' },
  { id: 'beach', label: 'Beach Relaxation' },
  { id: 'hiking', label: 'Hiking & Trekking' },
  { id: 'luxury', label: 'Luxury Stays' },
  { id: 'history', label: 'Historical Sites' },
];

export function ProfilePage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Saving your preferences...',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile.',
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950/90">
      <div className="container mx-auto max-w-5xl py-12 px-4">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="h-48 md:h-64 bg-cover bg-center rounded-lg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=1200&h=400&fit=crop')"}}></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              <img className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-900 object-cover" src="https://i.pravatar.cc/150?u=jelani" alt="Jelani Maina" />
              <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jelani Maina</h1>
          <p className="text-gray-500 dark:text-gray-400">Nairobi, Kenya</p>
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
                  <Input id="fullName" defaultValue="Jelani Maina" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="jelani@example.com" readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Travel Preferences</Label>
                <div className="space-y-2">
                  <Label htmlFor="travelStyle">Preferred Travel Style</Label>
                  <Select>
                    <SelectTrigger id="travelStyle"><SelectValue placeholder="Select your style" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget-friendly</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {interests.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox id={interest.id} />
                      <label htmlFor={interest.id} className="text-sm font-medium leading-none">
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Preferences</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}