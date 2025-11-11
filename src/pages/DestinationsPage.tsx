import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Destination {
  id: string;
  name: string;
  image_url: string;
  country: string;
  description?: string;
  is_featured: boolean;
}

export function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch destinations from Supabase
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true });

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

    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDestinationClick = (destinationName: string) => {
    navigate('/build-trip', { state: { destination: destinationName } });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg">Explore Our Destinations</h1>
        <p className="text-lg text-gray-700 font-semibold mt-2 max-w-2xl mx-auto">Discover the heart of Africa. From the vast plains of the Serengeti to the vibrant markets of Marrakech.</p>
      </div>

      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500" />
          <Input
            placeholder="Search for a destination (e.g., Kenya, Serengeti)..."
            className="pl-10 border-4 border-cyan-300 focus:border-green-400 shadow-lg rounded-xl text-lg font-medium bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredDestinations.map((dest, index) => {
          const borderColors = [
            'border-cyan-400',
            'border-green-400',
            'border-teal-400',
            'border-emerald-400',
            'border-rose-400',
            'border-teal-400'
          ];
          return (
            <Card
              key={dest.name}
              className={`overflow-hidden group relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${borderColors[index % borderColors.length]} border-8 rounded-2xl`}
              onClick={() => handleDestinationClick(dest.name)}
            >
              <ImageWithFallback
                src={dest.image_url}
                alt={dest.name}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {dest.is_featured && (
                <div className="absolute top-2 right-2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Featured
                </div>
              )}
              <CardContent className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent w-full">
                <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">{dest.name}</h3>
                <p className="text-sm text-white font-bold mt-1 drop-shadow-md">✨ Click to build your trip</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No destinations found matching your search.</p>
        </div>
      )}
    </div>
  );
}