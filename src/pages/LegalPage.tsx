import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, AlertTriangle, FileText, Globe } from 'lucide-react';
import Card from '../components/common/Card';

const LegalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Legal Information</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Important legal information, disclaimers, and privacy details for DayWeave users
          </p>
        </div>

        <div className="space-y-8">
          {/* Prototype Disclaimer */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-warning-default" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800 mb-3">Prototype & Demonstration Notice</h2>
                <div className="text-neutral-700 space-y-3">
                  <p>
                    <strong>DayWeave is a prototype application</strong> developed for demonstration purposes. 
                    This application is not a commercial service and should be used for testing and evaluation only.
                  </p>
                  <p>
                    All recommendations, venue information, and itineraries are generated using AI and may not be 
                    accurate, current, or suitable for actual travel planning. Users should verify all information 
                    independently before making any bookings or travel decisions.
                  </p>
                  <div className="bg-warning-light p-4 rounded-lg border border-warning-default">
                    <p className="text-warning-dark font-medium">
                      ⚠️ Important: Always verify venue opening hours, prices, availability, and booking requirements 
                      before visiting any location suggested by DayWeave.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Terms of Use */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800 mb-3">Terms of Use</h2>
                <div className="text-neutral-700 space-y-3">
                  <p>
                    By using DayWeave, you acknowledge and agree that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>This is a prototype application for demonstration purposes only</li>
                    <li>All content and recommendations are AI-generated and may be inaccurate</li>
                    <li>You will verify all information independently before making travel decisions</li>
                    <li>DayWeave is not responsible for any inconvenience, costs, or issues arising from using generated itineraries</li>
                    <li>The service may be unavailable, modified, or discontinued at any time without notice</li>
                    <li>You use the application at your own risk and discretion</li>
                  </ul>
                  <p>
                    <strong>No Warranty:</strong> DayWeave is provided "as is" without any warranties, express or implied. 
                    We make no guarantees about the accuracy, reliability, or suitability of any information provided.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy & Data Information */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800 mb-3">Privacy & Data Storage</h2>
                <div className="text-neutral-700 space-y-4">
                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Data Storage & Processing</h3>
                    <p>
                      DayWeave uses <strong>Supabase</strong> for secure data storage and user authentication. 
                      Your data is stored in accordance with Supabase's privacy and security standards.
                    </p>
                    <div className="mt-2">
                      <a 
                        href="https://supabase.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 underline"
                      >
                        View Supabase Privacy Policy <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Information We Collect</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Account information (email address, name) for authentication</li>
                      <li>Location preferences and travel plans you create</li>
                      <li>Usage analytics to improve the application</li>
                      <li>Temporary session data for application functionality</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Third-Party Services</h3>
                    <p>DayWeave integrates with several third-party services:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">Google Services</h4>
                        <p className="text-sm text-neutral-600 mt-1">Maps, Places API, and AI services</p>
                        <a 
                          href="https://policies.google.com/privacy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">OpenWeatherMap</h4>
                        <p className="text-sm text-neutral-600 mt-1">Weather forecast data</p>
                        <a 
                          href="https://openweathermap.org/privacy-policy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Data Retention</h3>
                    <p>
                      As a prototype application, data retention policies may change. User accounts and data 
                      may be deleted without notice as part of development and testing processes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI & Content Disclaimer */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800 mb-3">AI-Generated Content Disclaimer</h2>
                <div className="text-neutral-700 space-y-3">
                  <p>
                    DayWeave uses artificial intelligence (Google Gemini AI) to generate travel recommendations 
                    and itineraries. Please be aware that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>AI-generated content may be inaccurate:</strong> Venue names, addresses, opening hours, and prices may be incorrect or outdated</li>
                    <li><strong>Recommendations are not personalized advice:</strong> AI suggestions are based on general patterns and may not suit your specific needs</li>
                    <li><strong>Real-time information is not guaranteed:</strong> Venue availability, weather conditions, and local events may differ from AI predictions</li>
                    <li><strong>Safety considerations:</strong> Always research local safety conditions and travel advisories independently</li>
                    <li><strong>Accessibility needs:</strong> AI may not account for specific accessibility requirements</li>
                  </ul>
                  
                  <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                    <p className="text-accent-800 font-medium">
                      🤖 AI Recommendation: Always verify venue details, make reservations directly with providers, 
                      and check local conditions before traveling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* UK Compliance & Resources */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-success-default" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800 mb-3">UK Compliance & Resources</h2>
                <div className="text-neutral-700 space-y-4">
                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Data Protection</h3>
                    <p>
                      DayWeave respects UK data protection laws. As a prototype application, we follow 
                      best practices for data handling and user privacy.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary-700 mb-2">Useful UK Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">ICO (Data Protection)</h4>
                        <a 
                          href="https://ico.org.uk/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          Information Commissioner's Office <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">UK GDPR Guidance</h4>
                        <a 
                          href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          GDPR Guidelines <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">Consumer Rights</h4>
                        <a 
                          href="https://www.gov.uk/consumer-protection-rights" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          UK Consumer Rights <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <h4 className="font-medium text-neutral-800">Travel Advice</h4>
                        <a 
                          href="https://www.gov.uk/foreign-travel-advice" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center mt-1"
                        >
                          Foreign Travel Advice <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary-800 mb-3">Contact Information</h2>
              <div className="text-neutral-700 space-y-2">
                <p>
                  For questions about this legal information or DayWeave:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a 
                    href="mailto:hello.dayweave@gmail.com" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    hello.dayweave@gmail.com
                  </a>
                  <span className="hidden sm:block text-neutral-400">•</span>
                  <a 
                    href="mailto:hello.dayweave@gmail.com" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    hello.dayweave@gmail.com
                  </a>
                </div>
                <p className="text-sm text-neutral-500 mt-4">
                  This legal information was last updated: {new Date().toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Service Provider Links */}
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">Service Provider Information</h2>
              <p className="text-neutral-700 mb-4">
                DayWeave is built using the following trusted service providers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary-700 mb-2">Hosting & Database</h3>
                  <a 
                    href="https://supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline inline-flex items-center"
                  >
                    Supabase <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary-700 mb-2">Frontend Hosting</h3>
                  <a 
                    href="https://netlify.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline inline-flex items-center"
                  >
                    Netlify <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary-700 mb-2">AI & Maps</h3>
                  <a 
                    href="https://cloud.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline inline-flex items-center"
                  >
                    Google Cloud <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Return to DayWeave Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;