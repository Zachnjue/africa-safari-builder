import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { MapPin, Ticket, BedDouble, Plane, BarChart3, Settings, Hotel } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    destinations: 0,
    activities: 0,
    accommodations: 0,
    hotels: 0,
    transports: 0
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
        fetchStats();
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [destResult, actResult, accomResult, hotelsResult, transResult] = await Promise.all([
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        supabase.from('activities').select('id', { count: 'exact', head: true }),
        supabase.from('accommodation_types').select('id', { count: 'exact', head: true }),
        supabase.from('hotels').select('id', { count: 'exact', head: true }),
        supabase.from('transport_options').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        destinations: destResult.count || 0,
        activities: actResult.count || 0,
        accommodations: accomResult.count || 0,
        hotels: hotelsResult.count || 0,
        transports: transResult.count || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: 'Destinations',
      description: 'Manage safari destinations and locations',
      icon: MapPin,
      count: stats.destinations,
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400',
      route: '/admin/destinations'
    },
    {
      title: 'Activities',
      description: 'Manage activities and their pricing',
      icon: Ticket,
      count: stats.activities,
      color: 'from-teal-500 to-green-500',
      borderColor: 'border-teal-400',
      route: '/admin/activities'
    },
    {
      title: 'Accommodation',
      description: 'Manage lodging types and prices',
      icon: BedDouble,
      count: stats.accommodations,
      color: 'from-cyan-500 to-red-500',
      borderColor: 'border-cyan-400',
      route: '/admin/accommodation'
    },
    {
      title: 'Hotels',
      description: 'Manage individual hotels and properties',
      icon: Hotel,
      count: stats.hotels,
      color: 'from-rose-500 to-pink-500',
      borderColor: 'border-rose-400',
      route: '/admin/hotels'
    },
    {
      title: 'Transportation',
      description: 'Manage transport options and rates',
      icon: Plane,
      count: stats.transports,
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400',
      route: '/admin/transportation'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.email}! Manage your website content and pricing.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={`border-4 ${card.borderColor} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                onClick={() => navigate(card.route)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{card.count}</span>
                    <span className="text-gray-500">items</span>
                  </div>
                  <Button
                    className={`w-full mt-4 bg-gradient-to-r ${card.color} hover:opacity-90 text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(card.route);
                    }}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-4 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/destinations')}
              >
                <MapPin className="w-6 h-6 text-green-600" />
                <span>Add Destination</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/activities')}
              >
                <Ticket className="w-6 h-6 text-teal-600" />
                <span>Add Activity</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/accommodation')}
              >
                <BedDouble className="w-6 h-6 text-cyan-600" />
                <span>Update Pricing</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/hotels')}
              >
                <Hotel className="w-6 h-6 text-rose-600" />
                <span>Add Hotel</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <Settings className="w-6 h-6 text-blue-600" />
                <span>View Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
