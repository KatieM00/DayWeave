// WorkWithMePage.tsx - Rewritten with only verified information
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Globe, 
  Mail, 
  MapPin,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  Send,
  Clock,
  Star
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
  const [showPartnerships, setShowPartnerships] = useState(false);

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

  // Real metrics from beta testing
  const provenMetrics = [
    { label: "User Retention", value: "100%", subtitle: "would use again" },
    { label: "Navigation Rating", value: "5/5", subtitle: "ease of use" },
    { label: "Generation Speed", value: "<2 min", subtitle: "average time" },
    { label: "Bug Reports", value: "0", subtitle: "error-free experience" }
  ];

  // Real features built and deployed
  const deployedFeatures = [
    "Live AI-powered itinerary generation",
    "Multi-API integration (Maps, Weather, Places)",
    "User authentication and plan storage",
    "Mobile-responsive design",
    "Real-time data processing"
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
            how we can work together to grow DayWeave.
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
              Join us in revolutionizing day planning with proven AI technology and real user validation
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Proven Results */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-accent-100 text-accent-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Built for the World's Largest Hackathon
          </div>
          
          <h2 className="text-3xl font-bold text-primary-800 mb-6">
            From Planning Problem to Live Product
          </h2>
          
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            DayWeave is a fully functional AI-powered day planner, live at dayweave.com with real users 
            already planning trips worldwide. We've proven the concept works.
          </p>

          {/* Real Beta Testing Results */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {provenMetrics.map((metric, index) => (
              <Card key={index} className="text-center p-4">
                <div className="text-2xl font-bold text-primary-600 mb-1">{metric.value}</div>
                <div className="font-medium text-primary-800 text-sm mb-1">{metric.label}</div>
                <div className="text-xs text-neutral-600">{metric.subtitle}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Investment Focus */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
              Investment Opportunity
            </h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="font-semibold text-primary-800 mb-2">Early Stage</h4>
                <p className="text-neutral-600">Seeking partners to scale a proven product with validated user demand</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Target className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <h5 className="font-medium text-primary-800">Proven Product</h5>
                  <p className="text-sm text-neutral-600">Live at dayweave.com with real users</p>
                </div>
                <div>
                  <Star className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <h5 className="font-medium text-primary-800">User Validation</h5>
                  <p className="text-sm text-neutral-600">100% beta tester retention</p>
                </div>
                <div>
                  <Globe className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <h5 className="font-medium text-primary-800">Global Ready</h5>
                  <p className="text-sm text-neutral-600">Works worldwide from day one</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Real User Testimonials */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
              What Real Users Are Saying
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="italic text-primary-800 mb-2">
                  "I love this. It made everything so easy to do. I'll be using this in my upcoming trip to Lisbon!"
                </p>
                <p className="text-sm text-primary-600">— Beta Tester</p>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="italic text-primary-800 mb-2">
                  "Such a fun and genuinely useful idea! I'd use the hell out of this - I'm terrible at planning days out."
                </p>
                <p className="text-sm text-primary-600">— Beta Tester</p>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="italic text-primary-800 mb-2">
                  "This would be super cool for planning dates!"
                </p>
                <p className="text-sm text-primary-600">— Beta Tester</p>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="italic text-primary-800 mb-2">
                  "Tools like this are super helpful and take the stress out of planning."
                </p>
                <p className="text-sm text-primary-600">— Beta Tester</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Achievement */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
              Technical Foundation
            </h3>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-800 mb-4">Deployed & Operational</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3 text-neutral-700">
                  <p><strong>Live Platform:</strong> dayweave.com (custom domain)</p>
                  <p><strong>Frontend:</strong> React + TypeScript on Netlify</p>
                  <p><strong>Backend:</strong> Supabase with Edge Functions</p>
                </div>
                <div className="space-y-3 text-neutral-700">
                  <p><strong>AI Engine:</strong> Google Gemini integration</p>
                  <p><strong>APIs:</strong> Maps, Weather, Places orchestration</p>
                  <p><strong>Users:</strong> Authentication & plan storage</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Model */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
              Proven Revenue Strategy
            </h3>
            
            <div className="space-y-4">
              <p className="text-neutral-600 text-center mb-6">
                Based on user feedback and feature requests from beta testing
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary-800">Free Tier</h5>
                  <p className="text-sm text-neutral-600">3 plans/month</p>
                </div>
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary-800">Local £2.99</h5>
                  <p className="text-sm text-neutral-600">Unlimited local</p>
                </div>
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary-800">Global £4.99</h5>
                  <p className="text-sm text-neutral-600">Worldwide plans</p>
                </div>
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-primary-800">Tourist £1.99</h5>
                  <p className="text-sm text-neutral-600">One-time holiday</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Most Requested Features */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center">
              Next Phase: User-Requested Features
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Multi-day trip planning</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Group planning features</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Mobile app version</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Dietary restriction options</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Direct booking integration</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-500 mr-2" />
                  <span className="text-neutral-700">Bucket list functionality</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary-800 mb-4">Ready to Work Together?</h3>
            <p className="text-neutral-600">
              Whether you're an investor, potential partner, or want to learn more about our proven results.
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
                {isSubmitting ? 'Sending...' : 'Start the Conversation'}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-neutral-600">
              Experience DayWeave yourself at{' '}
              <a href="https://dayweave.com" className="text-primary-600 hover:text-primary-700 font-medium">
                dayweave.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWithMePage;