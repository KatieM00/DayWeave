// src/components/common/OptimizedItineraryGenerator.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import Card from './Card';

interface OptimizedItineraryGeneratorProps {
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
  progress?: number;
  stage?: string;
  preferences?: any;
}

const OptimizedItineraryGenerator: React.FC<OptimizedItineraryGeneratorProps> = ({
  isLoading,
  error,
  onRetry,
  progress = 0,
  stage = 'Initializing...',
  preferences
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(30);

  const loadingStages = [
    { message: "🚀 Starting your adventure...", duration: 2000 },
    { message: "🤖 AI is analyzing your preferences...", duration: 3000 },
    { message: "🗺️ Discovering amazing places...", duration: 4000 },
    { message: "📍 Finding the perfect venues...", duration: 3000 },
    { message: "🧭 Calculating optimal routes...", duration: 2000 },
    { message: "⚡ Adding some magical touches...", duration: 2000 },
    { message: "✨ Almost ready!", duration: 1000 }
  ];

  const quickFacts = [
    "DayWeave uses AI to find hidden gems in your area",
    "Our algorithm considers real-time data like weather and opening hours",
    "Each plan is uniquely crafted based on your preferences",
    "We can plan anything from budget adventures to luxury experiences"
  ];

  useEffect(() => {
    if (!isLoading) return;
    
    let currentTime = 0;
    let stageIndex = 0;
    
    const updateStage = () => {
      if (stageIndex < loadingStages.length - 1) {
        setTimeout(() => {
          setMessageIndex(stageIndex + 1);
          stageIndex++;
          updateStage();
        }, loadingStages[stageIndex].duration);
      }
    };
    
    updateStage();
    
    // Update estimated time countdown
    const timeInterval = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [isLoading]);

  if (error) {
    return (
      <Card className="text-center py-8 border-error-300 bg-error-50">
        <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Try Again
          </button>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Animated logo/icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-600 animate-pulse" />
            </div>
            <div className="absolute top-0 left-0 w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-neutral-800" />
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (7 - estimatedTime / 5) * 14.3)}%` }}
            />
          </div>
          
          {/* Current stage */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-primary-800 mb-2">
              Creating Your Perfect Day
            </h3>
            <p className="text-neutral-600 min-h-[1.5rem] transition-all duration-300 text-lg">
              {loadingStages[messageIndex]?.message || "Almost ready..."}
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Estimated time: ~{estimatedTime} seconds
            </p>
          </div>

          {/* Preferences summary */}
          {preferences && (
            <div className="w-full bg-white/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-primary-700 mb-3">Your Preferences:</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {preferences.startLocation && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                    <span className="truncate">{preferences.startLocation}</span>
                  </div>
                )}
                {preferences.groupSize && (
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1 text-primary-500" />
                    <span>{preferences.groupSize} {preferences.groupSize === 1 ? 'person' : 'people'}</span>
                  </div>
                )}
                {preferences.budgetRange && (
                  <div className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1 text-primary-500" />
                    <span className="capitalize">{preferences.budgetRange.replace('-', ' ')}</span>
                  </div>
                )}
                {preferences.planDate && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-primary-500" />
                    <span>{new Date(preferences.planDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fun facts carousel */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-3 w-full">
            <p className="text-sm text-accent-800 text-center">
              💡 <strong>Did you know?</strong> {quickFacts[messageIndex % quickFacts.length]}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default OptimizedItineraryGenerator;