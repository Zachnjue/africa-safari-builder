import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { ArrowRight } from 'lucide-react';
import { externalImages } from '@/assets/placeholders';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

const featuredDestinations = [
  {
    name: 'Serengeti, Tanzania',
    image: 'https://www.tanzaniatourism.com/images/uploads/Serengeti_Gnus_7765.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Home to the Great Migration, vast plains, and incredible wildlife density.'
  },
  {
    name: 'Maasai Mara, Kenya',
    image: 'https://www.kenyasafari.com/images/great-migration-masai-mara-kenya-590x390.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'Iconic landscapes and abundant predators. A photographer\'s paradise.'
  },
  {
    name: 'Okavango Delta, Botswana',
    image: 'https://images.theconversation.com/files/298349/original/file-20191023-119438-prx01q.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=754&fit=crop?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    description: 'A unique wetland ecosystem teeming with life, best explored by mokoro.'
  }
];

const testimonials = [
  {
    name: 'Amina Yusuf',
    avatar: 'https://i.pravatar.cc/150?u=amina',
    location: 'Lagos, Nigeria',
    quote: 'SafariSwap made planning our dream honeymoon to the Maasai Mara effortless. The instant quote was a game-changer and everything was perfectly arranged!'
  },
  {
    name: 'Kwame Mensah',
    avatar: 'https://i.pravatar.cc/150?u=kwame',
    location: 'Accra, Ghana',
    quote: 'As a solo traveler, the customization options were incredible. I built a trip that perfectly matched my interests and budget. Highly recommended!'
  }
];

export function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleStartBuilding = () => {
    if (!user) {
      // If not authenticated, redirect to sign up
      navigate('/signup');
    } else {
      // If authenticated, go to trip builder
      navigate('/build-trip');
    }
  };

  const handleDestinationClick = (destinationName: string) => {
    if (!user) {
      // If not authenticated, redirect to sign up first
      navigate('/signup', { state: { destination: destinationName } });
    } else {
      // If authenticated, go directly to trip builder with destination pre-selected
      navigate('/build-trip', { state: { destination: destinationName } });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[70vh] md:h-[90vh] text-white flex items-center justify-center"
        style={{ backgroundImage: `url('${externalImages.heroBackground}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-2xl text-white">Craft Your Unforgettable African Saga</h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-2xl font-semibold bg-black/30 px-6 py-3 rounded-xl backdrop-blur-sm">Instantly design, price, and book your bespoke safari adventure.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white"
            onClick={handleStartBuilding}
          >
            Start Building Your Trip <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Featured Destinations</h2>
            <p className="text-lg text-gray-700 font-medium mt-2">Explore some of our most popular safari locations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest, index) => {
              const badgeColors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-cyan-500'
              ];
              const borderColors = [
                'border-blue-400',
                'border-green-400',
                'border-cyan-400'
              ];
              return (
                <Card
                  key={dest.name}
                  className={`overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 ${borderColors[index]} border-4 cursor-pointer`}
                  onClick={() => handleDestinationClick(dest.name)}
                >
                  <div className="relative">
                    <ImageWithFallback src={dest.image} alt={dest.name} className="w-full h-56 object-cover brightness-100" />
                    <div className={`absolute top-0 left-0 ${badgeColors[index]} text-white px-4 py-2 rounded-br-lg font-bold shadow-lg`}>
                      Popular
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{dest.name}</h3>
                    <p className="text-gray-700 font-medium mb-3">{dest.description}</p>
                    <p className="text-sm text-cyan-600 font-semibold flex items-center gap-1">
                      Click to start planning your trip
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-cyan-100 via-blue-50 to-green-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">What Our Adventurers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className={`${index === 0 ? 'bg-gradient-to-br from-blue-100 to-cyan-100' : 'bg-gradient-to-br from-green-100 to-emerald-100'} border-l-8 border-${index === 0 ? 'blue' : 'green'}-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <CardContent className="p-6">
                  <p className="text-gray-800 font-medium italic mb-4 text-lg">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <Avatar className="ring-4 ring-white shadow-lg">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-teal-400 text-white font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 font-medium">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}