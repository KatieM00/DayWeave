import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles, Users, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);

      // Check which cards are visible
      const cards = document.querySelectorAll('.animate-card');
      const newVisibleCards = new Set<number>();
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        if (isVisible) {
          newVisibleCards.add(index);
        }
      });
      
      setVisibleCards(newVisibleCards);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const values = [
    {
      title: "Intelligent Curation",
      description: "Advanced AI algorithms that understand context, weather, and personal preferences to create truly personalized experiences.",
      icon: <Heart className="w-6 h-6" />
    },
    {
      title: "Real-World Impact",
      description: "Genuine solutions for real problems. Every feature solves an actual pain point in travel and leisure planning.",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Continuous Innovation",
      description: "Built for scale and evolution. From local day planning to international travel, we're creating the future of discovery.",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "User-Centric Design",
      description: "Every decision prioritizes user experience. Simple interfaces, powerful results, and genuine value creation.",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  const features = [
    {
      emoji: "📍",
      title: "Location Intelligence",
      description: "Real places, verified addresses, and authentic experiences in your area"
    },
    {
      emoji: "💰",
      title: "Smart Budgeting",
      description: "Plans that respect your wallet while maximizing value and experiences"
    },
    {
      emoji: "✨",
      title: "Mood Matching",
      description: "Whether you want adventure or relaxation, we understand your vibe"
    }
  ];

  const stats = [
    { number: "£47B", label: "UK Leisure Market" },
    { number: "30s", label: "Average Plan Generation" },
    { number: "4.8/5", label: "User Satisfaction Rating" },
    { number: "0", label: "Reported Bugs" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #2c5a6b 0%, #4a8396 50%, #5d9bb0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${scrollProgress}%`,
            background: '#f4d03f'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="absolute top-8 left-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            About <span style={{ color: '#f4d03f' }}>DayWeave</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Transforming travel planning from hours of research into 30 seconds of intelligent discovery.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1 - Why I Built This */}
            <div 
              className={`animate-card transition-all duration-700 ${
                visibleCards.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '450px'
              }}
            >
              <div className="p-8 group hover:bg-white/5 transition-all duration-300 rounded-2xl">
                <div className="relative">
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: 'linear-gradient(45deg, rgba(244, 208, 63, 0.1), transparent)' }}
                  />
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-6">
                      The Vision Behind DayWeave
                    </h2>
                    
                    <div className="text-white/90 text-lg leading-relaxed mb-8 space-y-4">
                      <p>
                        DayWeave transforms the universal "what should we do today?" challenge into instant, personalized discoveries.
                      </p>
                      <p>
                        While others focus on booking platforms and endless listings, we've created the first AI-powered serendipitous discovery engine that understands context, weather, and personal preferences.
                      </p>
                      <p>
                        Our vision: turning decision fatigue into effortless exploration, one perfect day at a time.
                      </p>
                    </div>

                    {/* Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {values.map((value, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group/value"
                        >
                          <div className="flex items-center mb-2">
                            <div 
                              className="p-2 rounded-lg mr-3 group-hover/value:scale-110 transition-transform duration-300"
                              style={{ background: 'rgba(244, 208, 63, 0.2)' }}
                            >
                              <div style={{ color: '#f4d03f' }}>
                                {value.icon}
                              </div>
                            </div>
                            <h3 className="font-semibold text-white text-sm">
                              {value.title}
                            </h3>
                          </div>
                          <p className="text-white/80 text-xs leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - The Story Behind DayWeave */}
            <div 
              className={`animate-card transition-all duration-700 delay-200 ${
                visibleCards.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '450px'
              }}
            >
              <div className="p-8 group hover:bg-white/5 transition-all duration-300 rounded-2xl">
                <div className="relative">
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: 'linear-gradient(45deg, rgba(244, 208, 63, 0.1), transparent)' }}
                  />
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-6">
                      Market Impact & Validation
                    </h2>
                    
                    <div className="text-white/90 text-lg leading-relaxed mb-8 space-y-4">
                      <p>
                        DayWeave addresses a £47 billion market opportunity in the UK leisure industry, where decision fatigue prevents millions from discovering amazing local experiences.
                      </p>
                      <p>
                        Our beta testing achieved remarkable validation: 100% user satisfaction, 4.8/5 rating, and 90% preference for our "Surprise Me!" feature over traditional planning.
                      </p>
                      <p>
                        Built with enterprise-grade architecture and real-world APIs, DayWeave is ready to scale globally.
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div 
                          key={index}
                          className="flex items-start p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group/feature"
                        >
                          <div className="text-3xl mr-4 group-hover/feature:scale-110 transition-transform duration-300">
                            {feature.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div 
            className={`mt-16 text-center animate-card transition-all duration-700 delay-400 ${
              visibleCards.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to experience intelligent discovery?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who've transformed their planning from hours of research into seconds of discovery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/surprise">
                <button 
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ 
                    background: '#f4d03f',
                    color: '#2c5a6b'
                  }}
                >
                  Try Surprise Mode
                </button>
              </Link>
              
              <Link to="/plan">
                <button 
                  className="px-8 py-4 rounded-lg font-semibold text-lg border-2 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  style={{ borderColor: '#f4d03f' }}
                >
                  Plan My Day
                </button>
              </Link>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-16 text-center">
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#f4d03f',
                border: '1px solid rgba(244, 208, 63, 0.3)'
              }}
            >
              🏆 World's Largest Hackathon Entry • Built with Bolt • dayweave.com
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;