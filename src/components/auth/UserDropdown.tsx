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
    await signOut();
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-accent-300 transition-colors"
      >
        <span>Hi, {userName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
          <button
            onClick={() => {
              navigate('/my-plans');
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            My Plans
          </button>
          
          <button
            onClick={() => {
              navigate('/account');
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </button>
          
          <hr className="my-1 border-neutral-200" />
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-sm text-error-default hover:bg-neutral-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;