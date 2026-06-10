import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage';
import { AdminProductsPage } from './admin/pages/AdminProductsPage';
import { LoginPage } from './auth/pages/LoginPage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { useAuthStore } from './auth/store/authStore';
import { CartPage } from './cart/pages/CartPage';
import { CheckoutPage } from './checkout/pages/CheckoutPage';
import { OrderDetailPage } from './orders/pages/OrderDetailPage';
import { OrderDisputePage } from './orders/pages/OrderDisputePage';
import { OrdersPage } from './orders/pages/OrdersPage';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './products/pages/CatalogPage';
import { ProductDetailPage } from './products/pages/ProductDetailPage';
import { Layout } from './shared/components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/producto/:slug" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos/:id/incidencia"
          element={
            <ProtectedRoute>
              <OrderDisputePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Navigate to="/admin/discos" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/discos"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
