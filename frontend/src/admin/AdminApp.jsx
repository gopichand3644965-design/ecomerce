import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './AuthContext';
import Products from './pages/Products';
import ProductEdit from './pages/ProductEdit';
import AdminLogin from './pages/AdminLogin';
import AdminProtectedLayout from './AdminProtectedLayout';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminProtectedLayout />}>
          <Route index element={<Products />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="products/new" element={<ProductEdit />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
