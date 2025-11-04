import { Link, NavLink } from 'react-router-dom';
import { Plane, Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/build-trip', label: 'Build Your Trip' },
  ];

  const adminLinks = user ? [
    { href: '/admin', label: 'Admin' }
  ] : [];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-400 via-amber-400 to-green-400 backdrop-blur-sm border-b-4 border-white shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
            <Plane className="h-10 w-10 text-white drop-shadow-lg animate-bounce" />
            <span className="text-2xl font-extrabold text-white drop-shadow-lg">SafariSwap</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {[...navLinks, ...adminLinks].map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-base font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-orange-600 px-4 py-2 rounded-full shadow-lg transform scale-110'
                      : 'text-white hover:text-orange-900 hover:bg-white/20 px-4 py-2 rounded-full'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold text-sm">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button asChild variant="ghost" className="text-white hover:bg-white/20 font-bold border-2 border-white">
                  <Link to="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white hover:bg-red-500/20 font-bold border-2 border-white hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-white hover:bg-white/20 font-bold border-2 border-white">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-white text-orange-600 hover:bg-orange-100 font-bold shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-br from-orange-300 to-amber-300 absolute w-full border-b-4 border-white pb-4 shadow-2xl">
          <nav className="flex flex-col items-center space-y-4 pt-4">
            {[...navLinks, ...adminLinks].map(link => (
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
              {user ? (
                <>
                  <div className="flex items-center justify-center gap-2 bg-green-100 px-4 py-3 rounded-lg mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-semibold text-sm">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/signin" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};