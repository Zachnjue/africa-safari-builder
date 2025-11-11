import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BedDouble, Ticket, Plane, MapPin, Users, Car, Mail, Hotel, Eye, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Activity {
  id: string;
  name: string;
  price_per_person: number;
  is_active: boolean;
}

interface AccommodationType {
  id: string;
  name: string;
  slug: string;
  price_per_night: number;
  is_active: boolean;
}

interface TransportOption {
  id: string;
  name: string;
  slug: string;
  price_per_person: number;
  is_active: boolean;
}

interface Hotel {
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

interface Destination {
  id: string;
  name: string;
  activities: string[];
}

export function TripBuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDestination, setSelectedDestination] = useState(
    location.state?.destination || ''
  );
  const [travelers, setTravelers] = useState(2);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [accommodation, setAccommodation] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [transport, setTransport] = useState('');
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic data from Supabase
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationType[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [hotelPreview, setHotelPreview] = useState<Hotel | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destResult, actResult, accomResult, transResult] = await Promise.all([
          supabase.from('destinations').select('*').order('name', { ascending: true }),
          supabase.from('activities').select('*').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('accommodation_types').select('*').eq('is_active', true).order('price_per_night', { ascending: false }),
          supabase.from('transport_options').select('*').eq('is_active', true).order('price_per_person', { ascending: true })
        ]);

        if (destResult.error) throw destResult.error;
        if (actResult.error) throw actResult.error;
        if (accomResult.error) throw accomResult.error;
        if (transResult.error) throw transResult.error;

        setDestinations(destResult.data || []);
        setActivities(actResult.data || []);
        setAccommodations(accomResult.data || []);
        setTransports(transResult.data || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load trip builder data', {
          description: error.message
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch current user and check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // User not authenticated, show dismissible dialog
        setShowAuthDialog(true);
      } else {
        setUser(user);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate]);

  // Get activities for selected destination
  const availableActivities = useMemo(() => {
    if (!selectedDestination) return [];

    // If no activities in database, return empty
    if (activities.length === 0) {
      console.warn('No activities found in database');
      return [];
    }

    // Find the destination and get its activities list
    const dest = destinations.find(d => d.name === selectedDestination);

    // If destination not found or has no activities, return all available activities
    if (!dest || !dest.activities || dest.activities.length === 0) {
      console.log('No specific activities for destination, showing all activities');
      return activities.map(a => a.name);
    }

    // Return only activities that exist in the destination's activities list
    const filteredActivities = activities
      .filter(a => dest.activities.includes(a.name))
      .map(a => a.name);

    // If no matching activities, return all activities as fallback
    if (filteredActivities.length === 0) {
      console.log('No matching activities found, showing all activities');
      return activities.map(a => a.name);
    }

    return filteredActivities;
  }, [selectedDestination, destinations, activities]);

  // Auto-populate activities when destination changes
  useEffect(() => {
    if (selectedDestination && availableActivities.length > 0) {
      // Auto-select first 2 activities as suggestions
      setSelectedActivities(availableActivities.slice(0, 2));
    } else {
      setSelectedActivities([]);
    }
  }, [selectedDestination, availableActivities]);

  // Fetch hotels when accommodation type changes
  useEffect(() => {
    const fetchHotels = async () => {
      if (!accommodation || accommodation === 'none') {
        setHotels([]);
        setSelectedHotel('');
        return;
      }

      try {
        const accomType = accommodations.find(a => a.slug === accommodation);
        if (!accomType) return;

        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('accommodation_type_id', accomType.id)
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (error) throw error;
        setHotels(data || []);
      } catch (error: any) {
        console.error('Error fetching hotels:', error);
        toast.error('Failed to load hotels', {
          description: error.message
        });
      }
    };

    fetchHotels();
  }, [accommodation, accommodations]);

  // Calculate number of nights
  const nights = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from);
  }, [dateRange]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;

    // Accommodation cost (skip if "none" selected)
    if (accommodation && accommodation !== 'none' && nights > 0) {
      const accom = accommodations.find(a => a.slug === accommodation);
      if (accom) {
        total += accom.price_per_night * nights * travelers;
      }
    }

    // Activities cost
    selectedActivities.forEach(activityName => {
      const activity = activities.find(a => a.name === activityName);
      if (activity) {
        total += activity.price_per_person * travelers;
      }
    });

    // Transportation cost (skip if "none" selected)
    if (transport && transport !== 'none') {
      const transportOption = transports.find(t => t.slug === transport);
      if (transportOption) {
        total += transportOption.price_per_person * travelers;
      }
    }

    return total;
  }, [accommodation, nights, travelers, selectedActivities, transport, accommodations, activities, transports]);

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleGetQuote = () => {
    if (!selectedDestination) {
      toast.error('Please select a destination');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select travel dates');
      return;
    }
    // Accommodation, activities, and transport are optional
    setShowQuoteDialog(true);
  };

  const handleSendQuote = async () => {
    if (!user?.email) {
      toast.error('Please sign in to receive quote via email');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Format the quote email content
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Your Safari Trip Quote</h1>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #111827;">Trip Details</h2>
            <p><strong>Destination:</strong> ${selectedDestination}</p>
            <p><strong>Travel Dates:</strong> ${format(dateRange!.from!, 'MMMM dd, yyyy')} - ${format(dateRange!.to!, 'MMMM dd, yyyy')}</p>
            <p><strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}</p>
            <p><strong>Travelers:</strong> ${travelers} person${travelers > 1 ? 's' : ''}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #111827;">Accommodation</h3>
            <p>${getAccommodationLabel()}</p>
            <p style="color: #6b7280;">$${getAccommodationPrice(accommodation)}/night per person × ${nights} nights × ${travelers} travelers = $${getAccommodationPrice(accommodation) * nights * travelers}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #111827;">Activities</h3>
            <ul>
              ${selectedActivities.map(activity => `
                <li>${activity} - $${getActivityPrice(activity)}/person × ${travelers} travelers = $${getActivityPrice(activity) * travelers}</li>
              `).join('')}
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #111827;">Transportation</h3>
            <p>${getTransportLabel()}</p>
            <p style="color: #6b7280;">$${getTransportPrice(transport)}/person × ${travelers} travelers = $${getTransportPrice(transport) * travelers}</p>
          </div>

          <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: white; margin: 0;">Total Estimated Price</h2>
            <h1 style="color: white; margin: 10px 0;">$${totalPrice.toLocaleString()}</h1>
            <p style="margin: 0;">*This is an estimate. Final pricing may vary.</p>
          </div>

          <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review your quote details</li>
              <li>Contact us to confirm availability</li>
              <li>Customize your trip further if needed</li>
              <li>Book your adventure!</li>
            </ul>
          </div>

          <div style="margin: 20px 0; text-align: center; color: #6b7280;">
            <p>Thank you for choosing SafariSwap!</p>
            <p>Questions? Contact us at support@safariswap.com</p>
          </div>
        </div>
      `;

      // For now, we'll simulate sending the email
      // In production, you would use Supabase Edge Functions or a service like Resend
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log the quote to console for demo purposes
      console.log('Quote Email Content:', emailContent);
      console.log('Sending to:', user.email);

      toast.success('Quote sent to your email!', {
        description: `Check ${user.email} for your personalized safari quote.`
      });

      setShowQuoteDialog(false);
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getAccommodationLabel = () => {
    const accom = accommodations.find(a => a.slug === accommodation);
    return accom ? accom.name : '';
  };

  const getAccommodationPrice = (slug: string) => {
    const accom = accommodations.find(a => a.slug === slug);
    return accom ? accom.price_per_night : 0;
  };

  const getActivityPrice = (name: string) => {
    const activity = activities.find(a => a.name === name);
    return activity ? activity.price_per_person : 0;
  };

  const getTransportPrice = (slug: string) => {
    const transportOption = transports.find(t => t.slug === slug);
    return transportOption ? transportOption.price_per_person : 0;
  };

  const getTransportLabel = () => {
    const transportOption = transports.find(t => t.slug === transport);
    return transportOption ? transportOption.name : '';
  };

  // Step navigation functions
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedDestination && dateRange?.from && dateRange?.to && travelers > 0;
      case 2:
        return true; // Accommodation is optional
      case 3:
        return true; // Activities are optional
      case 4:
        return true; // Transport is optional
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (!canProceedToNextStep()) {
      const stepNames = ['destination and dates', 'accommodation', 'activities', 'transportation'];
      toast.error(`Please complete ${stepNames[currentStep - 1]} before proceeding`);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show loading state while checking authentication or loading data
  if (isCheckingAuth || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading trip builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent drop-shadow-lg">Build Your Custom Trip</h1>
          <p className="text-lg text-gray-700 font-semibold mt-2">Follow these steps to create your personalized African adventure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Builder Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Destination & Dates */}
            {currentStep === 1 && (
            <Card className="border-4 border-green-400 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
              <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-t-lg">
                <CardTitle className="flex items-center"><MapPin className="mr-2 h-6 w-6 text-white"/> 1. Destination & Dates</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <label className="font-medium">Where do you want to go?</label>
                   <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="e.g., Maasai Mara, Kenya" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.name}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">How many travelers?</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="font-medium mb-2 block">When do you want to travel?</label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    className="rounded-md border"
                    numberOfMonths={2}
                  />
                  {nights > 0 && (
                    <p className="text-sm text-green-600 mt-2 font-medium">{nights} night{nights > 1 ? 's' : ''} selected</p>
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Step 2: Accommodation */}
            {currentStep === 2 && (
            <Card className="border-4 border-cyan-400 shadow-2xl bg-gradient-to-br from-cyan-50 to-blue-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
              <CardHeader className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-t-lg">
                <CardTitle className="flex items-center"><BedDouble className="mr-2 h-6 w-6 text-white"/> 2. Accommodation Style</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 font-medium">Choose your accommodation category</label>
                  <Select value={accommodation} onValueChange={setAccommodation}>
                    <SelectTrigger><SelectValue placeholder="Select your preferred lodging style" /></SelectTrigger>
                    <SelectContent>
                      {accommodations.map((accom) => (
                        <SelectItem key={accom.id} value={accom.slug}>
                          <div className="flex flex-col">
                            <span>{accom.name}</span>
                            <span className="text-xs text-gray-500">${accom.price_per_night}/night per person</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hotels List */}
                {accommodation && accommodation !== 'none' && hotels.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hotel className="h-5 w-5 text-cyan-600" />
                      <label className="text-sm text-gray-600 font-medium">Available Hotels ({hotels.length})</label>
                    </div>
                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
                      {hotels.map((hotel) => (
                        <div
                          key={hotel.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            selectedHotel === hotel.id
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedHotel(hotel.id)}
                        >
                          <div className="flex gap-4">
                            {hotel.image_url && (
                              <img
                                src={hotel.image_url}
                                alt={hotel.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                                  {hotel.location && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {hotel.location}
                                    </p>
                                  )}
                                  {hotel.rating && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-green-400" />
                                      <span className="text-xs font-medium">{hotel.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-cyan-600">${hotel.price_per_night}/night</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHotelPreview(hotel);
                                    }}
                                    className="text-xs mt-1"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accommodation && accommodation !== 'none' && hotels.length === 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-sm text-teal-800">No hotels available for this category yet. Please check back later.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Step 3: Activities */}
            {currentStep === 3 && (
            <Card className="border-4 border-teal-400 shadow-2xl bg-gradient-to-br from-teal-50 to-green-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
              <CardHeader className="bg-gradient-to-r from-teal-400 to-green-400 text-white rounded-t-lg">
                <CardTitle className="flex items-center"><Ticket className="mr-2 h-6 w-6 text-white"/> 3. Activities & Interests</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!selectedDestination ? (
                  <p className="text-gray-600 dark:text-gray-400">Please select a destination first to see available activities.</p>
                ) : activities.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-teal-600 font-medium">No activities available yet.</p>
                    <p className="text-sm text-gray-600">
                      The admin needs to add activities to the database. Please contact support or try again later.
                    </p>
                  </div>
                ) : availableActivities.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We've pre-selected popular activities for {selectedDestination.split(',')[0]}. Customize your selection or skip this step:
                    </p>
                    <p className="text-xs text-teal-600 font-medium">
                      Optional - Uncheck all if you prefer to arrange your own activities
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableActivities.map((activity) => (
                        <div key={activity} className="flex items-start space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-400 transition-all duration-200 cursor-pointer hover:shadow-md">
                          <Checkbox
                            id={activity}
                            checked={selectedActivities.includes(activity)}
                            onCheckedChange={() => handleActivityToggle(activity)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={activity}
                              className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {activity}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">${getActivityPrice(activity)}/person</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-teal-600 font-medium">No activities found for this destination.</p>
                    <p className="text-sm text-gray-600">
                      Activities may not be configured for "{selectedDestination}" yet. Please try selecting a different destination or contact support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

             {/* Step 4: Transport */}
            {currentStep === 4 && (
            <Card className="border-4 border-blue-400 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-t-lg">
                <CardTitle className="flex items-center"><Plane className="mr-2 h-6 w-6 text-white"/> 4. Transportation</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <label className="font-medium">How would you like to travel?</label>
                  <p className="text-sm text-gray-600">Choose your transportation method (optional)</p>
                  <Select value={transport} onValueChange={setTransport}>
                    <SelectTrigger><SelectValue placeholder="Select transportation mode or skip" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">None - I'll arrange my own</span>
                            <span className="text-xs text-gray-500">Skip transportation booking</span>
                          </div>
                        </div>
                      </SelectItem>
                      {transports.map((trans) => (
                        <SelectItem key={trans.id} value={trans.slug}>
                          <div className="flex items-center gap-2">
                            {trans.slug.includes('air') ? <Plane className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                            <div className="flex flex-col">
                              <span>{trans.name}</span>
                              <span className="text-xs text-gray-500">${trans.price_per_person}/person</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="min-w-32"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  size="lg"
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 min-w-32"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleGetQuote}
                  disabled={!selectedDestination || !dateRange?.from || !dateRange?.to}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 min-w-32"
                >
                  Get Quote
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">Step {currentStep} of 4</span>
                <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { step: 1, label: 'Destination', icon: MapPin },
                  { step: 2, label: 'Accommodation', icon: BedDouble },
                  { step: 3, label: 'Activities', icon: Ticket },
                  { step: 4, label: 'Transport', icon: Plane }
                ].map(({ step, label, icon: Icon }) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                      currentStep === step
                        ? 'bg-cyan-100 border-2 border-cyan-500'
                        : currentStep > step
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1 ${
                      currentStep === step
                        ? 'text-cyan-600'
                        : currentStep > step
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium text-center ${
                      currentStep === step
                        ? 'text-cyan-900'
                        : currentStep > step
                        ? 'text-green-900'
                        : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trip Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 border-8 border-rose-400 shadow-2xl bg-gradient-to-br from-rose-50 to-pink-50 transition-all duration-500 hover:shadow-3xl animate-in fade-in slide-in-from-right-4">
              <CardHeader className="bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-t-lg">
                <CardTitle className="text-white font-extrabold text-2xl">Your Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {selectedDestination && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedDestination}</p>
                      </div>
                    </div>
                  </div>
                )}

                {travelers > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <p className="text-sm">{travelers} traveler{travelers > 1 ? 's' : ''}</p>
                  </div>
                )}

                {nights > 0 && (
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-green-600" />
                    <p className="text-sm">{nights} night{nights > 1 ? 's' : ''}</p>
                  </div>
                )}

                {accommodation && (
                  <div className="text-sm">
                    <p className="font-medium">Accommodation:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {accommodation === 'none' ? "I'll arrange my own" : getAccommodationLabel()}
                    </p>
                  </div>
                )}

                {selectedActivities.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Activities ({selectedActivities.length}):</p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc list-inside">
                      {selectedActivities.slice(0, 3).map(activity => (
                        <li key={activity} className="text-xs">{activity}</li>
                      ))}
                      {selectedActivities.length > 3 && (
                        <li className="text-xs">+ {selectedActivities.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {transport && (
                  <div className="text-sm">
                    <p className="font-medium">Transportation:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {transport === 'none' ? "I'll arrange my own" : getTransportLabel()}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Estimated Total</span>
                    <span className="text-green-600">${totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">This is an estimate. Final price will be calculated upon completion.</p>
                </div>

                {currentStep === 4 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">Ready to get your quote!</p>
                    <p className="text-xs text-green-600">Click "Get Quote" below to see your detailed pricing breakdown.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hotel Preview Dialog */}
        <Dialog open={!!hotelPreview} onOpenChange={() => setHotelPreview(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cyan-600 flex items-center gap-2">
                <Hotel className="h-6 w-6" />
                {hotelPreview?.name}
              </DialogTitle>
              {hotelPreview?.location && (
                <DialogDescription className="flex items-center gap-1 text-base">
                  <MapPin className="h-4 w-4" />
                  {hotelPreview.location}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Hotel Image */}
              {hotelPreview?.image_url && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={hotelPreview.image_url}
                    alt={hotelPreview.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rating and Price */}
              <div className="flex items-center justify-between">
                {hotelPreview?.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-green-400" />
                    <span className="text-lg font-semibold">{hotelPreview.rating} / 5.0</span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-600">${hotelPreview?.price_per_night}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-gray-700">{hotelPreview?.description}</p>
              </div>

              {/* Amenities */}
              {hotelPreview?.amenities && hotelPreview.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {hotelPreview.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(hotelPreview?.contact_email || hotelPreview?.contact_phone) && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    {hotelPreview.contact_email && (
                      <p>Email: {hotelPreview.contact_email}</p>
                    )}
                    {hotelPreview.contact_phone && (
                      <p>Phone: {hotelPreview.contact_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setHotelPreview(null)}>
                Close
              </Button>
              <Button
                className="bg-cyan-600 hover:bg-blue-700"
                onClick={() => {
                  if (hotelPreview) {
                    setSelectedHotel(hotelPreview.id);
                    setHotelPreview(null);
                  }
                }}
              >
                Select This Hotel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quote Preview Dialog */}
        <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-green-600">Your Safari Quote</DialogTitle>
              <DialogDescription>
                Review your personalized trip details and pricing breakdown
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Trip Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Trip Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{selectedDestination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Travel Dates</p>
                      <p className="font-medium">
                        {dateRange?.from && format(dateRange.from, 'MMM dd, yyyy')} - {dateRange?.to && format(dateRange.to, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{nights} night{nights > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Travelers</p>
                      <p className="font-medium">{travelers} person{travelers > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Accommodation */}
                  {accommodation && accommodation !== 'none' && (
                    <div className="flex justify-between items-start pb-3 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{getAccommodationLabel()}</p>
                        <p className="text-sm text-gray-500">
                          ${getAccommodationPrice(accommodation)}/night × {nights} nights × {travelers} travelers
                        </p>
                      </div>
                      <p className="font-medium">${getAccommodationPrice(accommodation) * nights * travelers}</p>
                    </div>
                  )}
                  {accommodation === 'none' && (
                    <div className="flex justify-between items-start pb-3 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Accommodation</p>
                        <p className="text-sm text-gray-500 italic">I'll arrange my own</p>
                      </div>
                      <p className="font-medium">$0</p>
                    </div>
                  )}

                  {/* Activities */}
                  {selectedActivities.length > 0 ? (
                    <div className="pb-3 border-b">
                      <p className="font-medium mb-2">Activities</p>
                      {selectedActivities.map(activity => (
                        <div key={activity} className="flex justify-between items-start text-sm mb-2">
                          <div className="flex-1">
                            <p>{activity}</p>
                            <p className="text-gray-500">${getActivityPrice(activity)}/person × {travelers} travelers</p>
                          </div>
                          <p>${getActivityPrice(activity) * travelers}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pb-3 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Activities</p>
                        <p className="text-sm text-gray-500 italic">I'll arrange my own</p>
                      </div>
                    </div>
                  )}

                  {/* Transportation */}
                  {transport && transport !== 'none' && (
                    <div className="flex justify-between items-start pb-3 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{getTransportLabel()}</p>
                        <p className="text-sm text-gray-500">
                          ${getTransportPrice(transport)}/person × {travelers} travelers
                        </p>
                      </div>
                      <p className="font-medium">${getTransportPrice(transport) * travelers}</p>
                    </div>
                  )}
                  {transport === 'none' && (
                    <div className="flex justify-between items-start pb-3 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Transportation</p>
                        <p className="text-sm text-gray-500 italic">I'll arrange my own</p>
                      </div>
                      <p className="font-medium">$0</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xl font-bold">Total Estimated Price</p>
                    <p className="text-2xl font-bold text-green-600">${totalPrice.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    *This is an estimate. Final pricing may vary based on availability and season.
                  </p>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-teal-50 dark:bg-teal-950">
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">1.</span>
                      <span>Review your quote details above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">2.</span>
                      <span>Send quote to your email for safekeeping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">3.</span>
                      <span>Contact us to confirm availability and customize further</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">4.</span>
                      <span>Book your dream African adventure!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                Close
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSendQuote}
                disabled={isSendingEmail || !user}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isSendingEmail ? 'Sending...' : `Send to ${user?.email || 'Email'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Authentication Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Plane className="h-6 w-6 text-cyan-600" />
                Sign In to Build Your Trip
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Create a free account or sign in to access the trip builder and start planning your African safari adventure.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Why sign in?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">✓</span>
                    <span>Save and customize your trip itinerary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">✓</span>
                    <span>Get instant quotes via email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">✓</span>
                    <span>Access exclusive deals and offers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600">✓</span>
                    <span>Track your booking history</span>
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => navigate('/signin', { state: { from: '/build-trip' } })}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/signup', { state: { from: '/build-trip' } })}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 flex-1"
              >
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
