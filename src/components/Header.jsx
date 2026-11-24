import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import {
  ShoppingCart,
  Heart,
  User,
  Package,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  BookOpen,
  Trophy,
  Watch
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: Laptop },
  { name: 'Mobiles', icon: Smartphone },
  { name: 'Fashion', icon: Shirt },
  { name: 'Home & Kitchen', icon: Home },
  { name: 'Beauty', icon: Sparkles },
  { name: 'Books', icon: BookOpen },
  { name: 'Sports', icon: Trophy },
  { name: 'Accessories', icon: Watch },
];

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-top">
          <button
            className="header-btn show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{ padding: '0.4rem', marginRight: '0.25rem' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="brand-logo" onClick={closeMenu}>
            <img src="/cartify-icon.png" alt="Cartify" className="brand-logo-img" />
            <span>Cartify</span>
          </Link>

          <div className="hide-on-mobile" style={{ flex: 1, maxWidth: '560px', margin: '0 1.5rem' }}>
            <SearchBar />
          </div>

          <div className="header-actions">
            <ThemeToggle />

            {isAuthenticated && (
              <Link to="/orders" className="header-btn hide-on-mobile" title="My Orders">
                <Package size={18} />
                <span>My Orders</span>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="header-btn hide-on-mobile" title="Admin Dashboard" style={{ color: 'var(--primary)' }}>
                <ShieldAlert size={18} />
                <span>Admin</span>
              </Link>
            )}

            <Link to="/wishlist" className="header-btn hide-on-mobile" title="Wishlist">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="cart-badge" style={{ backgroundColor: 'var(--color-primary)' }}>{wishlistCount}</span>
                )}
              </div>
              <span>Wishlist</span>
            </Link>

            <Link to="/cart" className="header-btn" title="Shopping Cart">
              <ShoppingCart size={20} />
              <span className="hide-on-mobile">Cart</span>
              {cart.item_count > 0 && (
                <span className="cart-badge">{cart.item_count}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="header-btn hide-on-mobile" style={{ cursor: 'default' }}>
                  <User size={18} />
                  <span style={{ fontWeight: 600 }}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="header-btn"
                  title="Logout"
                  style={{ color: 'var(--danger)', padding: '0.4rem' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                <User size={16} />
                <span className="hide-on-mobile">Login</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mobile-search-row show-on-mobile">
          <SearchBar />
        </div>
      </div>

      <nav className="category-nav-bar">
        <div className="container">
          <ul className="category-nav-list">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected =
                location.pathname === '/products' &&
                new URLSearchParams(location.search).get('category') === cat.name;

              return (
                <li key={cat.name}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className={`category-nav-item ${isSelected ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-logo">
                <img src="/cartify-icon.png" alt="Cartify" className="brand-logo-img" />
                <span>Cartify</span>
              </div>
              <button onClick={closeMenu} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {isAuthenticated ? (
                <div className="mobile-user-card">
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {user?.email || user?.phone}
                  </div>
                  {isAdmin && (
                    <span className="badge badge-stock" style={{ marginTop: '0.4rem', width: 'fit-content' }}>
                      Admin Account
                    </span>
                  )}
                </div>
              ) : (
                <Link to="/login" onClick={closeMenu} className="btn btn-primary btn-block" style={{ marginBottom: '1.25rem' }}>
                  <User size={16} /> Login / Register
                </Link>
              )}

              <div className="mobile-drawer-section">
                <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Navigation
                </h4>
                <ul className="mobile-nav-links">
                  <li>
                    <Link to="/" onClick={closeMenu}>Home</Link>
                  </li>
                  <li>
                    <Link to="/products" onClick={closeMenu}>All Products & Materials</Link>
                  </li>
                  <li>
                    <Link to="/cart" onClick={closeMenu}>
                      Shopping Cart ({cart.item_count})
                    </Link>
                  </li>
                  {isAuthenticated && (
                    <li>
                      <Link to="/orders" onClick={closeMenu}>My Orders</Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link to="/admin" onClick={closeMenu} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="mobile-drawer-section" style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Shop by Department
                </h4>
                <ul className="mobile-nav-links">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <li key={cat.name}>
                        <Link to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Icon size={16} color="var(--primary)" />
                          <span>{cat.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {isAuthenticated && (
                <button onClick={handleLogout} className="btn btn-secondary btn-block btn-sm" style={{ marginTop: '1.5rem', color: 'var(--danger)' }}>
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
