import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import SurprisePlanPage from './pages/SurprisePlanPage';
import DetailedPlanPage from './pages/DetailedPlanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPlansPage from './pages/MyPlansPage';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/surprise" element={<SurprisePlanPage />} />
              <Route path="/plan" element={<DetailedPlanPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/my-plans" element={<MyPlansPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;