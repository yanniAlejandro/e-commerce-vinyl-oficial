import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { useCartStore } from '../../cart/store/cartStore';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="layout">
      <header className={`header ${isHome ? 'header--home' : ''}`}>
        <div className="header__inner container">
          <Link to="/" className="logo" aria-label="qtb — inicio">
            qtb
          </Link>

          <nav className="nav" aria-label="Navegación principal">
            <Link to="/catalogo" className={location.pathname.startsWith('/catalogo') ? 'active' : ''}>
              Shop
            </Link>
            {user && (
              <Link to="/pedidos" className={location.pathname.startsWith('/pedidos') ? 'active' : ''}>
                Pedidos
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/discos" className={location.pathname.startsWith('/admin/discos') ? 'active' : ''}>
                  Admin discos
                </Link>
                <Link to="/admin/pedidos" className={location.pathname.startsWith('/admin/pedidos') ? 'active' : ''}>
                  Admin pedidos
                </Link>
              </>
            )}
          </nav>

          <div className="header__actions">
            <Link
              to="/carrito"
              className="header__cart"
              aria-label={`Carrito, ${itemCount} artículos`}
            >
              Carrito{itemCount > 0 && <span className="header__cart-count">({itemCount})</span>}
            </Link>

            {user ? (
              <div className="user-menu">
                <span className="user-name">{user.full_name.split(' ')[0]}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                  Salir
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link-sm">Entrar</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__top">
            <p className="footer__brand">qtb</p>
            <p className="footer__tagline">Disquera · Ediciones en vinilo</p>
          </div>
          <div className="footer__links">
            <Link to="/catalogo">Shop</Link>
            <Link to="/carrito">Carrito</Link>
            {!user && <Link to="/registro">Cuenta</Link>}
          </div>
          <p className="footer__copy">© {new Date().getFullYear()} qtb</p>
        </div>
      </footer>
    </div>
  );
}
