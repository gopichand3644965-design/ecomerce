import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminProtectedLayout from './AdminProtectedLayout';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Banners = lazy(() => import('./pages/Banners'));
const Settings = lazy(() => import('./pages/Settings'));

function RouteFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm text-slate-500 animate-pulse">Loading admin page...</p>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminProtectedLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />
            <Route path="products/new" element={<ProductEdit />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="banners" element={<Banners />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}
