import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Search } from 'lucide-react';
import { useState } from 'react';

const allDestinations = [
  { name: 'Serengeti National Park, Tanzania', image: 'https://www.tanzaniatourism.com/images/uploads/Serengeti_Gnus_7765.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Maasai Mara National Reserve, Kenya', image: 'https://www.kenyasafari.com/images/great-migration-masai-mara-kenya-590x390.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Kruger National Park, South Africa', image: 'https://i.ytimg.com/vi/EUQ3QhLzTyk/maxresdefault.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Okavango Delta, Botswana', image: 'https://images.theconversation.com/files/298349/original/file-20191023-119438-prx01q.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=754&fit=clip?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Bwindi Impenetrable National Park, Uganda', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFsYiaHRyWl2CVuOvwaBC-kdgohngIEaJXRw&s?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Victoria Falls, Zambia/Zimbabwe', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrg6-TOL6GcnOK2Ri3iZwSw5pISWSQvXkkxg&s?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Ngorongoro Crater, Tanzania', image: 'https://nomadicessentialstravel.com/wp-content/uploads/2024/09/03-DAYS-TANZANIA-SAFARI-EXPLORE-THE-SERENGETI-AND-NGORONGORO-CRATER.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Etosha National Park, Namibia', image: 'https://i.ytimg.com/vi/iY06mtGUVSA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB8zuAKqVV1NEjtnEeSstFZRZuX9A?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Sossusvlei, Namibia', image: 'https://www.sossusvlei.org/wp-content/uploads/2021/02/Aerial-view-guest-area-andBeyond-Sossusvlei-e1613674179629-600x400.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Mount Kilimanjaro, Tanzania', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRadT1zNVbM31hihd_IMTpJFzRRMBLQRY1vJQ&s?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Giza Pyramids, Egypt', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaMbr5GUwjG_jaHGshH_n8Jy-ahibnUKdqLQ&s?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
  { name: 'Marrakech, Morocco', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQh7sq-j98CK0-KqcFboh-C23FHzlUSYkmnA&s?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop' },
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
            <ImageWithFallback
              src={dest.image}
              alt={dest.name}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
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