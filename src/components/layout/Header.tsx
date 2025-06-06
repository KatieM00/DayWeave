import React, { useState } from 'react';
import { MapPin, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import UserDropdown from '../auth/UserDropdown';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'User';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (loading) {
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
            <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6 mr-6">
              <Link 
                to="/" 
                className="hover:text-accent-300 transition-colors duration-200"
              >
                Home
              </Link>
              {user && (
                <Link 
                  to="/my-plans" 
                  className="hover:text-accent-300 transition-colors duration-200"
                >
                  My Plans
                </Link>
              )}
              <Link 
                to="/about" 
                className="hover:text-accent-300 transition-colors duration-200"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              {user ? (
                <UserDropdown userName={getUserName()} />
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<LogIn className="h-4 w-4" />}
                      className="text-white hover:bg-white/10 border-white/20"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      variant="accent"
                      size="sm"
                      icon={<UserPlus className="h-4 w-4" />}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link 
                to="/" 
                className="hover:text-accent-300 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              {user && (
                <Link 
                  to="/my-plans" 
                  className="hover:text-accent-300 transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  My Plans
                </Link>
              )}
              <Link 
                to="/about" 
                className="hover:text-accent-300 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              
              <div className="pt-4 border-t border-white/20">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-accent-300 font-medium">
                      Hi, {getUserName()}
                    </div>
                    <Link 
                      to="/my-plans"
                      className="block hover:text-accent-300 transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      My Plans
                    </Link>
                    <Link 
                      to="/account"
                      className="block hover:text-accent-300 transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      Account Settings
                    </Link>
                    <button 
                      className="text-left hover:text-accent-300 transition-colors duration-200"
                      onClick={() => {
                        // Handle sign out
                        closeMobileMenu();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<LogIn className="h-4 w-4" />}
                        className="text-white hover:bg-white/10 border-white/20 w-full justify-start"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={closeMobileMenu}>
                      <Button
                        variant="accent"
                        size="sm"
                        icon={<UserPlus className="h-4 w-4" />}
                        className="w-full justify-start"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;