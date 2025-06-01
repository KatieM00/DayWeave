import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-700 to-secondary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="rounded-full bg-white p-1.5">
            <MapPin className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">DayWeave</h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-accent-300 transition-colors">
            Home
          </Link>
          <Link to="/my-plans" className="hover:text-accent-300 transition-colors">
            My Plans
          </Link>
          <Link to="/about" className="hover:text-accent-300 transition-colors">
            About
          </Link>
        </nav>
        
        <button className="md:hidden text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;