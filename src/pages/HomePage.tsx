import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { ArrowRight } from 'lucide-react';
import { externalImages } from '@/assets/placeholders';

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
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[70vh] md:h-[90vh] text-white flex items-center justify-center"
        style={{ backgroundImage: `url('${externalImages.heroBackground}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">Craft Your Unforgettable African Saga</h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">Instantly design, price, and book your bespoke safari adventure.</p>
          <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link to="/build-trip">Start Building Your Trip <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Featured Destinations</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Explore some of our most popular safari locations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest) => (
              <Card key={dest.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <ImageWithFallback src={dest.image} alt={dest.name} className="w-full h-56 object-cover" />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{dest.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{dest.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">What Our Adventurers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-gray-50 dark:bg-gray-900 border-l-4 border-green-600">
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
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