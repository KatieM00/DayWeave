import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Pages
import HomePage from './pages/HomePage';
import SurprisePlanPage from './pages/SurprisePlanPage';
import DetailedPlanPage from './pages/DetailedPlanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPlansPage from './pages/MyPlansPage';
import AccountPage from './pages/AccountPage';
import SharedPlanPage from './pages/SharedPlanPage';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component - NO AUTOMATIC REDIRECTS
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Always render the children - no automatic redirects
  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/surprise" element={<SurprisePlanPage />} />
          <Route path="/plan" element={<DetailedPlanPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          
          {/* Shared plan route - public access */}
          <Route path="/share/:shareableLinkId" element={<SharedPlanPage />} />
          
          {/* Public routes - NO automatic redirects */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/my-plans" 
            element={
              <ProtectedRoute>
                <MyPlansPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AppContent />
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;