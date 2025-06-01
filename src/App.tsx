import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import SurprisePlanPage from './pages/SurprisePlanPage';
import DetailedPlanPage from './pages/DetailedPlanPage';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/surprise" element={<SurprisePlanPage />} />
            <Route path="/plan" element={<DetailedPlanPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;