import React from 'react';
import { MapPin, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import UserDropdown from '../auth/UserDropdown';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'User';
  };

  return (
    <header className="bg-gradient-to-r from-primary-700 to-secondary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-full bg-white p-1.5">
              <MapPin className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">DayWeave</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6 mr-6">
              <Link to="/" className="hover:text-accent-300 transition-colors">
                Home
              </Link>
              {user && (
                <Link to="/my-plans" className="hover:text-accent-300 transition-colors">
                  My Plans
                </Link>
              )}
              <Link to="/about" className="hover:text-accent-300 transition-colors">
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              {user ? (
                <UserDropdown userName={getUserName()} />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<LogIn className="h-4 w-4" />}
                    onClick={() => window.location.href = '/login'}
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => window.location.href = '/signup'}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <button className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;