import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, ExternalLink } from 'lucide-react';
import Card from '../components/common/Card';

const PrivacyPage: React.FC = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Privacy Policy</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            How we collect, use, and protect your information
          </p>
        </div>

        <Card>
          <div className="prose prose-neutral max-w-none">
            <div className="text-sm text-neutral-500 mb-6">
              Last updated: {new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-primary-700 mb-2">Account Information</h3>
                  <ul className="list-disc list-inside text-neutral-700 space-y-1">
                    <li>Email address and password</li>
                    <li>Profile information you provide</li>
                    <li>Preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-primary-700 mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside text-neutral-700 space-y-1">
                    <li>Day plans you create and save</li>
                    <li>Search locations and preferences</li>
                    <li>App usage patterns and interactions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-neutral-700 space-y-2">
                <li>Generate personalized day plans and recommendations</li>
                <li>Save and manage your created itineraries</li>
                <li>Improve our AI algorithms and service quality</li>
                <li>Communicate with you about your account and our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">3. Third-Party Services</h2>
              <p className="text-neutral-700 mb-4">
                DayWeave integrates with third-party services to provide our functionality:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-800 mb-2">Google Services</h4>
                  <p className="text-sm text-neutral-600 mb-2">Maps, Places API, and AI services</p>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-800 mb-2">Supabase</h4>
                  <p className="text-sm text-neutral-600 mb-2">Database and authentication services</p>
                  <a 
                    href="https://supabase.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 underline inline-flex items-center"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">4. Data Security</h2>
              <p className="text-neutral-700 mb-4">
                We implement appropriate security measures to protect your personal information. However, 
                as a prototype application, please be aware that security measures may be limited.
              </p>
              <div className="bg-warning-light p-4 rounded-lg border border-warning-default">
                <p className="text-warning-dark font-medium">
                  ⚠️ Prototype Notice: As this is a demonstration application, please do not share sensitive personal information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">5. Data Retention</h2>
              <p className="text-neutral-700 mb-4">
                As a prototype service, data retention policies may change. User accounts and data may be 
                deleted without notice as part of development and testing processes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">6. Your Rights</h2>
              <p className="text-neutral-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-neutral-700 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Request information about how your data is used</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">7. Contact Us</h2>
              <p className="text-neutral-700">
                If you have questions about this Privacy Policy or your data, please contact us at{' '}
                <a href="mailto:hello.dayweave@gmail.com" className="text-primary-600 hover:text-primary-700 underline">
                  hello.dayweave@gmail.com
                </a>
              </p>
            </section>
          </div>
        </Card>

        {/* Back to Home */}
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

export default PrivacyPage;