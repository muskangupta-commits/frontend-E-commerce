import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNavigation = () => {
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Grid size={20} />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <Heart size={20} />
          {wishlistCount > 0 && (
            <span className="mobile-nav-badge">{wishlistCount}</span>
          )}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {cart.item_count > 0 && (
            <span className="mobile-nav-badge">{cart.item_count}</span>
          )}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/orders' : '/login'}
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>{isAuthenticated ? 'Account' : 'Login'}</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNavigation;
