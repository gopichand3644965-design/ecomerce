import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import WishlistDrawer from './components/WishlistDrawer';

// Lazy load pages for smaller bundle chunks
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function RouteFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm text-slate-500 animate-pulse">Loading page...</p>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Search state (persisted in localStorage)
  const [searchQuery, setSearchQuery] = useState(() => {
    const stored = localStorage.getItem('searchQuery');
    return stored || '';
  });

  // Persist search query
  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  // Drawer state
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const openWishlist = () => setWishlistOpen(true);
  const closeWishlist = () => setWishlistOpen(false);

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header
        onMenuClick={toggleSidebar}
        onWishlistClick={openWishlist}
        query={searchQuery}
        setQuery={setSearchQuery}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div className="max-w-7xl mx-auto w-full">
        <main className="flex-1 p-3 sm:p-4 overflow-x-hidden">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Home searchQuery={searchQuery} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <WishlistDrawer isOpen={isWishlistOpen} onClose={closeWishlist} />
    </div>
  );
}
