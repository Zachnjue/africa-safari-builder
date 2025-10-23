import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

const allDestinations = [
  { name: 'Serengeti National Park, Tanzania', image: 'https://images.unsplash.com/photo-1534408641153-2c10553c6d72?w=800&h=600&fit=crop' },
  { name: 'Maasai Mara National Reserve, Kenya', image: 'https://images.unsplash.com/photo-1588112353383-34759a4b86b4?w=800&h=600&fit=crop' },
  { name: 'Kruger National Park, South Africa', image: 'https://images.unsplash.com/photo-1549688133-5b48b5a48d54?w=800&h=600&fit=crop' },
  { name: 'Okavango Delta, Botswana', image: 'https://images.unsplash.com/photo-1589995549239-a41681a81254?w=800&h=600&fit=crop' },
  { name: 'Bwindi Impenetrable National Park, Uganda', image: 'https://images.unsplash.com/photo-1566453880341-a8a5f3e4905a?w=800&h=600&fit=crop' },
  { name: 'Victoria Falls, Zambia/Zimbabwe', image: 'https://images.unsplash.com/photo-1550963322-27f4212a2a51?w=800&h=600&fit=crop' },
  { name: 'Ngorongoro Crater, Tanzania', image: 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800&h=600&fit=crop' },
  { name: 'Etosha National Park, Namibia', image: 'https://images.unsplash.com/photo-1547471080-7cc2d5d88e93?w=800&h=600&fit=crop' },
  { name: 'Sossusvlei, Namibia', image: 'https://images.unsplash.com/photo-1617950531235-037a8b83674a?w=800&h=600&fit=crop' },
  { name: 'Mount Kilimanjaro, Tanzania', image: 'https://images.unsplash.com/photo-1589553400763-9185a0c10f0e?w=800&h=600&fit=crop' },
  { name: 'Giza Pyramids, Egypt', image: 'https://images.unsplash.com/photo-1528992494131-79a0335b2361?w=800&h=600&fit=crop' },
  { name: 'Marrakech, Morocco', image: 'https://images.unsplash.com/photo-1569926833532-35870b2848c4?w=800&h=600&fit=crop' },
];

export function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDestinations = allDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Explore Our Destinations</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">Discover the heart of Africa. From the vast plains of the Serengeti to the vibrant markets of Marrakech.</p>
      </div>

      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for a destination (e.g., Kenya, Serengeti)..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredDestinations.map((dest) => (
          <Card key={dest.name} className="overflow-hidden group relative">
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <CardContent className="absolute bottom-0 left-0 p-4">
              <h3 className="text-lg font-bold text-white">{dest.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
