import { Link, NavLink } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/build-trip', label: 'Build Your Trip' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-green-600 dark:text-green-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">SafariSwap</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <NavLink 
                key={link.href} 
                to={link.href} 
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button asChild>
              <Link to="/profile">My Profile</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 dark:text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 absolute w-full border-b border-gray-200 dark:border-gray-800 pb-4">
          <nav className="flex flex-col items-center space-y-4 pt-4">
            {navLinks.map(link => (
              <NavLink 
                key={link.href} 
                to={link.href} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${
                    isActive 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex flex-col space-y-2 w-full px-8 pt-4">
              <Button variant="outline" asChild>
                <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </Button>
              <Button asChild>
                <Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};