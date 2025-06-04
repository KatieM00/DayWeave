import React from 'react';
import { Sparkles } from 'lucide-react';
import Card from './Card';

interface ItineraryGeneratorProps {
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

const ItineraryGenerator: React.FC<ItineraryGeneratorProps> = ({
  isLoading,
  error,
  onRetry
}) => {
  const loadingMessages = [
    "Discovering hidden gems in your area...",
    "Calculating optimal routes...",
    "Checking venue availability...",
    "Planning the perfect schedule...",
    "Adding some magical touches...",
  ];

  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (error) {
    return (
      <Card className="text-center py-8">
        <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error-default\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2">
            <circle cx="12\" cy="12\" r="10" />
            <line x1="15\" y1="9\" x2="9\" y2="15" />
            <line x1="9\" y1="9\" x2="15\" y2="15" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-error-dark mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-neutral-600 mb-6">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <div className="absolute top-0 left-0 w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-primary-800 mb-2">
              Creating Your Perfect Day
            </h3>
            <p className="text-neutral-600 min-h-[1.5rem] transition-all duration-300">
              {loadingMessages[messageIndex]}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default ItineraryGenerator;