import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-secondary-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Plan Your Perfect Day with <span className="text-accent-300">DayWeave</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-neutral-100">
            Create beautiful day plans and discover new experiences tailored just for you.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Button 
              variant="accent" 
              size="lg"
              onClick={() => navigate('/surprise')}
              className="px-8"
            >
              Surprise Me!
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/plan')}
              className="border-white text-white hover:bg-white hover:text-primary-700 px-8"
            >
              Help Me Plan
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-primary-50 rounded-lg">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-800">Choose Your Style</h3>
              <p className="text-neutral-700">
                Select between a surprise adventure or a detailed planning mode based on your preferences.
              </p>
            </div>
            
            <div className="text-center p-6 bg-secondary-50 rounded-lg">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-800">Tell Us Your Preferences</h3>
              <p className="text-neutral-700">
                Answer a few questions about what you enjoy, your budget, and travel preferences.
              </p>
            </div>
            
            <div className="text-center p-6 bg-accent-50 rounded-lg">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-accent-800">Get Your Perfect Plan</h3>
              <p className="text-neutral-700">
                We'll create a customized itinerary with activities, times, and all the details you need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-secondary-100 to-primary-50 flex-grow relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-8">
            Whether you want a completely spontaneous day or a meticulously planned itinerary, DayWeave has you covered.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/surprise')}
            >
              Try a Surprise Day
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/plan')}
            >
              Create Detailed Plan
            </Button>
          </div>
        </div>
        
        {/* Built in Bolt Badge */}
        <div className="absolute top-20 right-6">
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-all duration-300 hover:scale-105 hover:shadow-lg"
            aria-label="Built with Bolt - Visit bolt.new"
          >
            <img
              src="/white_circle_360x360.png"
              alt="Built with Bolt"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;