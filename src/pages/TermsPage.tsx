import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Card from '../components/common/Card';

const TermsPage: React.FC = () => {
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
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Terms of Service</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Please read these terms carefully before using DayWeave
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
              <h2 className="text-xl font-semibold text-primary-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-neutral-700 mb-4">
                By accessing and using DayWeave, you accept and agree to be bound by the terms and conditions of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">2. Service Description</h2>
              <p className="text-neutral-700 mb-4">
                DayWeave is a prototype day planning application that uses AI to generate personalized itineraries. 
                This is a demonstration service and should not be used for critical travel planning.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-neutral-700 space-y-2">
                <li>Provide accurate information when using our services</li>
                <li>Verify all venue information independently before visiting</li>
                <li>Use the service responsibly and in accordance with applicable laws</li>
                <li>Respect the intellectual property rights of DayWeave and third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">4. Disclaimers</h2>
              <div className="bg-warning-light p-4 rounded-lg border border-warning-default mb-4">
                <p className="text-warning-dark font-medium">
                  ⚠️ Important: DayWeave is a prototype application. All recommendations are AI-generated and may be inaccurate.
                </p>
              </div>
              <p className="text-neutral-700 mb-4">
                We make no warranties about the accuracy, reliability, or suitability of venue information, 
                opening hours, prices, or availability. Users must verify all information independently.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">5. Limitation of Liability</h2>
              <p className="text-neutral-700 mb-4">
                DayWeave shall not be liable for any inconvenience, costs, or issues arising from the use of 
                our generated itineraries. Use of this service is at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">6. Service Availability</h2>
              <p className="text-neutral-700 mb-4">
                As a prototype service, DayWeave may be unavailable, modified, or discontinued at any time 
                without notice. User accounts and data may be deleted as part of development processes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">7. Contact Information</h2>
              <p className="text-neutral-700">
                If you have questions about these Terms of Service, please contact us at{' '}
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

export default TermsPage;