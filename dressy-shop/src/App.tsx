import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect } from 'react';
import ReactGA from 'react-ga4';
import './i18n';

import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { CompareProvider } from './context/CompareContext';

// Shop
import Navbar      from './components/Navbar';
import Footer      from './components/Footer';
import CompareBar  from './components/CompareBar';
import Home        from './pages/Home';
import Catalog     from './pages/Catalog';
import DressDetail from './pages/DressDetail';
import Branches    from './pages/Branches';
import Contact     from './pages/Contact';
import Wishlist    from './pages/Wishlist';
import Compare     from './pages/Compare';
import NotFound    from './pages/NotFound';

// Admin
import AdminLogin     from './admin/AdminLogin';
import AdminLayout    from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import DressList        from './admin/DressList';
import DressForm        from './admin/DressForm';
import BulkAvailability from './admin/BulkAvailability';

// ── GA4 page tracker ────────────────────────────────────────────────────────
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    // Skip admin pages — only track public shop traffic
    if (!location.pathname.startsWith('/admin')) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);
  return null;
}

// ── Auth guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// ── Page transition wrapper ─────────────────────────────────────────────────
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// ── Shop routes ─────────────────────────────────────────────────────────────
function ShopRoutes() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <CompareBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<PageTransition><Home /></PageTransition>} />
          <Route path="/catalog"   element={<PageTransition><Catalog /></PageTransition>} />
          <Route path="/dress/:slug" element={<PageTransition><DressDetail /></PageTransition>} />
          <Route path="/wishlist"  element={<PageTransition><Wishlist /></PageTransition>} />
          <Route path="/compare"   element={<PageTransition><Compare /></PageTransition>} />
          <Route path="/branches"  element={<PageTransition><Branches /></PageTransition>} />
          <Route path="/contact"   element={<PageTransition><Contact /></PageTransition>} />
          <Route path="*"          element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
    <RouteTracker />
    <Routes>
      {/* Admin login — no layout */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin section */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index                  element={<AdminDashboard />} />
        <Route path="dresses"         element={<DressList />} />
        <Route path="dresses/new"      element={<DressForm />} />
        <Route path="dresses/:id/edit" element={<DressForm />} />
        <Route path="bulk-avail"       element={<BulkAvailability />} />
      </Route>

      {/* Public shop */}
      <Route path="/*" element={<ShopRoutes />} />
    </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
        <RecentlyViewedProvider>
        <CompareProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-ivory flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-rose border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AppRoutes />
        </Suspense>
        </CompareProvider>
        </RecentlyViewedProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
