import React from 'react';
import { Activity } from 'lucide-react';

interface DetailedFormProps {
  step: number;
}

export default function DetailedForm({ step }: DetailedFormProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex mb-8">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div 
            key={stepNumber}
            className="flex-1 relative"
          >
            <div className="flex flex-col items-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center relative z-10
                  ${step === stepNumber ? 'bg-primary-600 text-white' : 
                    step > stepNumber ? 'bg-primary-400 text-white' : 'bg-neutral-200 text-neutral-500'}
                `}
              >
                {step > stepNumber ? (
                  <Activity className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              
              <span className="text-xs mt-2 text-center whitespace-nowrap px-1">
                {stepNumber === 1 && "Location"}
                {stepNumber === 2 && "Time & People"}
                {stepNumber === 3 && "Travel"}
                {stepNumber === 4 && "Activities"}
                {stepNumber === 5 && "Preferences"}
              </span>
            </div>

            {stepNumber < 5 && (
              <div 
                className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                  step > stepNumber ? 'bg-primary-400' : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Form content will go here */}
    </div>
  );
}