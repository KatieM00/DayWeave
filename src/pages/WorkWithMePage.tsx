import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Zap, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  Heart,
  Send
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const WorkWithMePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    investmentType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const metrics = [
    { label: "Market Size", value: "£47B", subtitle: "UK leisure industry" },
    { label: "Planning Time Saved", value: "3+ hours", subtitle: "vs manual research" },
    { label: "AI Response Time", value: "30 seconds", subtitle: "complete itinerary" },
    { label: "Target Users", value: "Everyone", subtitle: "who wants to adventure" }
  ];

  const keyFeatures = [
    "AI-powered serendipity engine discovering hidden gems",
    "Multi-API orchestration with real-time data fusion",
    "Progressive mystery reveals for surprise experiences",
    "Scalable freemium model with B2B opportunities"
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-800 mb-4">Thank You!</h1>
          <p className="text-neutral-600 mb-6">
            We've received your message and will get back to you within 24 hours to discuss 
            how we can work together to revolutionize day planning.
          </p>
          <div className="space-y-3">
            <Link to="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline">Learn More About DayWeave</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to DayWeave
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-800 mb-4">
              Let's Build the Future of Travel Together
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Join us in transforming the £47 billion UK leisure industry through intelligent experience curation
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Value Proposition */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-accent-100 text-accent-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Built for the World's Largest Hackathon
          </div>
          
          <h2 className="text-3xl font-bold text-primary-800 mb-6">
            From 3+ Hours of Planning to 30 Seconds of Magic
          </h2>
          
          <p className="text-lg text-neutral-600 max-w-4xl mx-auto mb-8">
            DayWeave doesn't just solve decision fatigue—it creates serendipitous experiences through AI-powered discovery. 
            We're not another booking platform; we're pioneering intelligent experience curation.
          </p>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <Card key={index} className="text-center p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">{metric.value}</div>
                <div className="font-medium text-primary-800 mb-1">{metric.label}</div>
                <div className="text-sm text-neutral-600">{metric.subtitle}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Investment Opportunities */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-accent-500" />
              Investment Opportunity
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <Target className="w-5 h-5 text-accent-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary-800">Seed Stage</h4>
                  <p className="text-neutral-600">Seeking strategic partners to scale across the UK and expand internationally</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <BarChart3 className="w-5 h-5 text-accent-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary-800">Proven Product-Market Fit</h4>
                  <p className="text-neutral-600">Live platform with real users experiencing the magic of AI-powered discovery</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-accent-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary-800">Scalable Architecture</h4>
                  <p className="text-neutral-600">Built on Supabase with multi-API orchestration, ready for global expansion</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 p-6 rounded-xl border border-primary-200">
              <h4 className="font-semibold text-primary-800 mb-3">Why Now?</h4>
              <ul className="space-y-2 text-sm text-primary-700">
                <li>• Post-pandemic travel boom with demand for unique experiences</li>
                <li>• AI technology mature enough for consumer applications</li>
                <li>• Decision fatigue epidemic in choice-rich environments</li>
                <li>• Shift from transactional to experiential travel spending</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-accent-500" />
              Partnership Opportunities
            </h3>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h4 className="font-semibold text-primary-800 mb-3">Tourism Boards</h4>
                <p className="text-neutral-600 mb-4">
                  White-label our discovery engine to promote local hidden gems and distribute tourism more evenly across regions.
                </p>
                <div className="text-sm text-accent-600 font-medium">B2B Revenue Opportunity</div>
              </Card>
              
              <Card className="p-6">
                <h4 className="font-semibold text-primary-800 mb-3">Hospitality Partners</h4>
                <p className="text-neutral-600 mb-4">
                  Integrate with hotels and travel companies to provide guests with curated local experiences beyond typical tourist attractions.
                </p>
                <div className="text-sm text-accent-600 font-medium">Revenue Share Model</div>
              </Card>
              
              <Card className="p-6">
                <h4 className="font-semibold text-primary-800 mb-3">Technology Partners</h4>
                <p className="text-neutral-600 mb-4">
                  Collaborate on AI advancement, data partnerships, or integration opportunities with complementary platforms.
                </p>
                <div className="text-sm text-accent-600 font-medium">Strategic Partnership</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="bg-white rounded-2xl p-8 mb-16 border border-neutral-200">
          <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
            Technical Innovation That Sets Us Apart
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-primary-800 mb-4">Core Technology</h4>
              <ul className="space-y-3">
                {keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary-800 mb-4">Tech Stack Highlights</h4>
              <div className="space-y-3 text-neutral-700">
                <p><strong>Frontend:</strong> React + TypeScript, deployed on Netlify</p>
                <p><strong>Backend:</strong> Supabase with Edge Functions</p>
                <p><strong>AI:</strong> Google Gemini AI for intelligent curation</p>
                <p><strong>APIs:</strong> Multi-service orchestration (Maps, Weather, Places)</p>
                <p><strong>Domain:</strong> Custom domain via IONOS (dayweave.com)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-4">Ready to Work Together?</h3>
            <p className="text-neutral-600">
              Whether you're an investor, potential partner, or just want to learn more, we'd love to hear from you.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  icon={<Users className="w-5 h-5 text-neutral-400" />}
                  fullWidth
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  icon={<Mail className="w-5 h-5 text-neutral-400" />}
                  fullWidth
                  required
                />
              </div>
              
              <Input
                type="text"
                placeholder="Company/Organization"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                fullWidth
              />
              
              <select
                value={formData.investmentType}
                onChange={(e) => handleInputChange('investmentType', e.target.value)}
                className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">I'm interested in...</option>
                <option value="investment">Investment Opportunity</option>
                <option value="partnership">Strategic Partnership</option>
                <option value="b2b">B2B Collaboration</option>
                <option value="acquisition">Acquisition Discussion</option>
                <option value="other">Other</option>
              </select>
              
              <textarea
                placeholder="Tell us about your interest in DayWeave and how you'd like to work together..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={5}
                className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                required
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={isSubmitting}
                icon={<Send className="w-5 h-5" />}
              >
                {isSubmitting ? 'Sending Message...' : 'Start the Conversation'}
              </Button>
            </form>
          </Card>

          {/* Direct Contact */}
          <div className="text-center mt-8 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-4">
              Prefer to reach out directly?
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm">
              <a 
                href="mailto:hello@dayweave.com" 
                className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                hello.dayweave@gmail.com
              </a>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600">Oxford, England</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWithMePage;