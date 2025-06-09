import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  isOpen,
  onClose,
  title = "Sign In Required",
  message = "Please sign in to save your day plan and access all features."
}) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-primary-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
          
          <p className="text-neutral-600 mb-6">
            {message}
          </p>

          <div className="space-y-3">
            <Link 
              to="/login" 
              state={{ from: location }}
              className="block"
            >
              <Button
                variant="primary"
                fullWidth
                icon={<LogIn className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </Link>
            
            <Link 
              to="/signup" 
              state={{ from: location }}
              className="block"
            >
              <Button
                variant="outline"
                fullWidth
                icon={<UserPlus className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </Link>
          </div>

          <p className="text-sm text-neutral-500 mt-4">
            Already have an account? <Link to="/login" state={{ from: location }} className="text-primary-600 hover:text-primary-700 font-medium">Sign in here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPrompt;