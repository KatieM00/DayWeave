import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-4">DayWeave</h3>
            <p className="text-neutral-300 max-w-md">
              Your personal day planner that helps you create perfect itineraries
              based on your preferences and real-time data.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-accent-300 font-medium mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-neutral-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="/my-plans" className="text-neutral-300 hover:text-white transition-colors">My Plans</a></li>
                <li><a href="/about" className="text-neutral-300 hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-300 font-medium mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/terms" className="text-neutral-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="text-neutral-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-300 font-medium mb-3">Contact</h4>
              <ul className="space-y-2">
                <li><a href="mailto:hello@dayweave.com" className="text-neutral-300 hover:text-white transition-colors">hello@dayweave.com</a></li>
                <li><a href="https://twitter.com/dayweave" className="text-neutral-300 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://instagram.com/dayweave" className="text-neutral-300 hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-700 text-center text-neutral-400 text-sm">
          <p>© {currentYear} DayWeave. All rights reserved.</p>
          <p className="mt-1">Information provided may not be accurate at time of plan generation. Please double-check all details before your planned day.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;