import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import TrackerPage from './pages/TrackerPage';
import LaunchesPage from './pages/LaunchesPage';
import NasaExplorerPage from './pages/NasaExplorerPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tracker" element={<TrackerPage />} />
                <Route path="/launches" element={<LaunchesPage />} />
                <Route path="/nasa" element={<NasaExplorerPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
