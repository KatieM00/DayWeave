import React, { useState } from 'react';
import { Home } from 'lucide-react';
import Button from './Button';

interface HomeButtonProps {
  isSurpriseMode?: boolean;
  currentLocation?: string;
  endLocation?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({
  isSurpriseMode = false,
  currentLocation,
  endLocation
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleHomeClick = () => {
    if (isSurpriseMode && !endLocation) {
      alert("Complete your journey first to see the way home!");
      return;
    }
    setShowConfirmation(true);
  };

  const handleNavigateHome = () => {
    const destination = endLocation || "home";
    const origin = currentLocation || "";
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
      '_blank'
    );
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleHomeClick}
        className="fixed bottom-8 right-8 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow group z-40"
      >
        <div className="relative">
          <Home className="w-6 h-6 text-primary-600" />
          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity -top-8">
            Take me home!
          </span>
        </div>
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full animate-fadeIn">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">
              Home time already?
            </h3>
            <p className="text-neutral-600 mb-6">
              Don't worry, you can still access these plans another day!
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Adventure more!
              </Button>
              <Button
                variant="primary"
                onClick={handleNavigateHome}
              >
                Home time
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeButton;