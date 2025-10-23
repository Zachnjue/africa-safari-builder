import { Link } from 'react-router-dom';
import { Plane, Twitter, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-green-600 dark:text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SafariSwap</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">Your adventure, your way. Customizable African safaris at your fingertips.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/destinations" className="text-gray-600 dark:text-gray-400 hover:text-green-600">Destinations</Link></li>
              <li><Link to="/build-trip" className="text-gray-600 dark:text-gray-400 hover:text-green-600">Build Your Trip</Link></li>
              <li><Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-green-600">My Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600">Terms of Service</Link></li>
              <li><Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600"><Twitter /></a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600"><Instagram /></a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600"><Facebook /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} SafariSwap. All rights reserved. An African adventure awaits.</p>
        </div>
      </div>
    </footer>
  );
};