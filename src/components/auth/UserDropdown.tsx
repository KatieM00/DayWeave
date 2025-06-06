import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, FileText, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserDropdownProps {
  userName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-accent-300 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/10"
      >
        <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-neutral-800 font-medium text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block">Hi, {userName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn border border-neutral-200">
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center text-neutral-800 font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-neutral-800">{userName}</p>
                <p className="text-sm text-neutral-500">Manage your account</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleNavigation('/my-plans')}
              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
            >
              <FileText className="w-4 h-4 mr-3 text-neutral-500" />
              My Plans
            </button>
            
            <button
              onClick={() => handleNavigation('/preferences')}
              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
            >
              <User className="w-4 h-4 mr-3 text-neutral-500" />
              Preferences
            </button>
            
            <button
              onClick={() => handleNavigation('/account')}
              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-3 text-neutral-500" />
              Account Settings
            </button>
          </div>
          
          <div className="border-t border-neutral-200 py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-error-default hover:bg-error-light/10 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;