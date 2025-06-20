import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Mail, BookOpen, Zap, MapPin, Users, Settings, ArrowLeft } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const supportSections = [
    {
      id: 1,
      title: "Getting Started",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          question: "How do I create my first DayWeave plan?",
          answer: "Simply click the 'Surprise Me!' button on the homepage, enter your starting location, and follow our 6-step guided process. Within 30 seconds, you'll have a personalized itinerary!"
        },
        {
          question: "Do I need to create an account?",
          answer: "You can try DayWeave without an account, but creating one lets you save plans, access them later, and get personalized recommendations based on your preferences."
        },
        {
          question: "Is DayWeave free to use?",
          answer: "Yes! Our core planning features are completely free. We're currently in beta, so you get full access to our AI-powered day planning without any charges."
        }
      ]
    },
    {
      id: 2,
      title: "Planning Features",
      icon: <Zap className="w-5 h-5" />,
      items: [
        {
          question: "What's the difference between 'Surprise Me!' and 'Help Me Plan'?",
          answer: "'Surprise Me!' uses our AI to discover hidden gems and create serendipitous experiences. 'Help Me Plan' gives you more control over specific activities and locations you want to include."
        },
        {
          question: "How does the AI choose activities?",
          answer: "Our AI considers your location, weather conditions, group size, budget, selected vibe, and local insights to curate activities that match your preferences while discovering unique spots you might not find otherwise."
        },
        {
          question: "Can I modify my plan after it's generated?",
          answer: "Absolutely! You can edit times, skip activities, add new stops, or regenerate parts of your plan. Your itinerary is flexible and designed to adapt to your needs."
        },
        {
          question: "What if the weather changes?",
          answer: "DayWeave automatically factors in real-time weather when generating plans. If conditions change dramatically, you can regenerate your plan for weather-appropriate alternatives."
        }
      ]
    },
    {
      id: 3,
      title: "Locations & Travel",
      icon: <MapPin className="w-5 h-5" />,
      items: [
        {
          question: "Which areas does DayWeave cover?",
          answer: "We currently focus on the UK, with extensive coverage of major cities and towns. We're expanding our database regularly to include more locations and hidden gems."
        },
        {
          question: "How accurate are the travel times?",
          answer: "Travel times are calculated using real-time traffic data and public transport schedules. We build in buffer time to ensure you're not rushing between activities."
        },
        {
          question: "Can I plan activities in multiple cities?",
          answer: "Currently, each plan focuses on one area to ensure realistic travel times. For multi-city trips, we recommend creating separate plans for each destination."
        }
      ]
    },
    {
      id: 4,
      title: "Account & Settings",
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          question: "How do I save my plans?",
          answer: "Once you create an account, all your generated plans are automatically saved to your 'My Plans' section. You can access them anytime, even offline."
        },
        {
          question: "Can I share my plans with friends?",
          answer: "Yes! Each saved plan has a share button that creates a link you can send to friends and family. They can view your itinerary and even make a copy to their own account."
        },
        {
          question: "How do I delete my account?",
          answer: "You can delete your account from your profile settings. This will permanently remove all your saved plans and personal data from our servers."
        }
      ]
    },
    {
      id: 5,
      title: "Technical Support",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          question: "The app isn't loading properly",
          answer: "Try refreshing your browser or clearing your cache. DayWeave works best on modern browsers. If problems persist, contact our support team."
        },
        {
          question: "I'm getting location errors",
          answer: "Ensure your browser has location permissions enabled, or manually enter your starting point. We use Google Maps for accurate location services."
        },
        {
          question: "Plans aren't generating",
          answer: "This might be due to high demand or API limits. Wait a moment and try again. If the issue continues, try with a different location or contact support."
        }
      ]
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return supportSections;
    
    return supportSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0);
  }, [searchQuery]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/" 
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DayWeave
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-800">Help & Support</h1>
            </div>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-4">
              Everything you need to know to weave your perfect day. Find answers to common questions below.
            </p>
            
            {/* Beta Notice */}
            <div className="inline-flex items-center bg-accent-50 border border-accent-200 rounded-lg px-4 py-2 text-sm">
              <div className="w-2 h-2 bg-accent-400 rounded-full mr-2"></div>
              <span className="text-accent-800">
                <strong>Beta Project:</strong> DayWeave is currently in development - you may encounter occasional hiccups!
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search support docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 outline-none transition-all text-neutral-700 placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Support Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="text-primary-600 mr-3">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-800">{section.title}</h2>
                  <span className="ml-3 bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium">
                    {section.items.length}
                  </span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <div className="border-t border-neutral-100">
                  {section.items.map((item, index) => (
                    <div key={index} className="px-6 py-4 border-b border-neutral-50 last:border-b-0">
                      <h3 className="font-medium text-neutral-800 mb-2">{item.question}</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No results found</h3>
            <p className="text-neutral-600">Try adjusting your search terms or browse all categories above.</p>
          </div>
        )}

        {/* Tiny Contact Footer */}
        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm mb-2">
            Still stuck? Drop us a line:
          </p>
          <a 
            href="mailto:hello@dayweave.com" 
            className="text-primary-600 hover:text-primary-700 text-sm transition-colors"
          >
            hello.dayweave@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;