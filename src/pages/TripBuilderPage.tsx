import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { BedDouble, Ticket, Plane, MapPin, Users } from 'lucide-react';

export function TripBuilderPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Build Your Custom Trip</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Follow these steps to create your personalized African adventure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Builder Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Destination & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MapPin className="mr-2 h-6 w-6 text-green-600"/> 1. Destination & Dates</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-medium">Where do you want to go?</label>
                   <Select>
                    <SelectTrigger><SelectValue placeholder="e.g., Maasai Mara, Kenya" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mara">Maasai Mara, Kenya</SelectItem>
                      <SelectItem value="serengeti">Serengeti, Tanzania</SelectItem>
                      <SelectItem value="kruger">Kruger, South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">How many travelers?</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <Input type="number" defaultValue={2} className="w-20" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="font-medium mb-2 block">When do you want to travel?</label>
                  <Calendar mode="range" className="rounded-md border" />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Accommodation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><BedDouble className="mr-2 h-6 w-6 text-green-600"/> 2. Accommodation Style</CardTitle>
              </CardHeader>
              <CardContent>
                 <Select>
                  <SelectTrigger><SelectValue placeholder="Select your preferred lodging style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury-lodge">Luxury Lodge</SelectItem>
                    <SelectItem value="tented-camp">Classic Tented Camp</SelectItem>
                    <SelectItem value="budget-hotel">Budget Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 3: Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Ticket className="mr-2 h-6 w-6 text-green-600"/> 3. Activities & Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Choose what you want to experience (coming soon).</p>
              </CardContent>
            </Card>

             {/* Step 4: Transport */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Plane className="mr-2 h-6 w-6 text-green-600"/> 4. Transportation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Select your mode of transport (coming soon).</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Trip Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28">
              <CardHeader>
                <CardTitle>Your Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Estimated Total</span>
                    <span>$0.00</span>
                  </div>
                  <p className="text-xs text-gray-500">This is an estimate. Final price will be calculated upon completion.</p>
                </div>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">Get Instant Quote</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}