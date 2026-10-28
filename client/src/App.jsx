import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Starfield from './components/layout/Starfield';
import Cursor from './components/layout/Cursor';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Route-level code splitting: each page is its own chunk
const HomePage = lazy(() => import('./pages/HomePage'));
const TrackerPage = lazy(() => import('./pages/TrackerPage'));
const LaunchesPage = lazy(() => import('./pages/LaunchesPage'));
const NasaExplorerPage = lazy(() => import('./pages/NasaExplorerPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader message="Establishing uplink..." />
  </div>
);

// Same routes as before, wrapped in a fade/slide transition keyed by path
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
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
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <MotionConfig reducedMotion="user">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:px-4 focus:py-2 focus:bg-signal focus:text-black focus:font-mono focus:text-xs focus:uppercase focus:tracking-label"
            >
              Skip to content
            </a>
            <Starfield />
            <div className="grain" aria-hidden="true" />
            <Cursor />
            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </MotionConfig>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
