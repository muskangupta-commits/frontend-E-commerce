import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Star, ShoppingCart, Check, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const isFavorited = isInWishlist(product.id || product._id);

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    setErrorMsg('');
    const res = await addToCart(product, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setErrorMsg(res.error || 'Could not add');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${product.id || product._id}`} className="product-image-link">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        </Link>

        {/* TOP-LEFT: DISCOUNT BADGE (Section 12: #DCFCE7 bg, #166534 text) */}
        <div className="product-badge-overlay">
          {discountPercent && (
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--color-success-light, #DCFCE7)',
                color: 'var(--color-success-dark, #166534)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm, 6px)',
              }}
            >
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="badge badge-stock-out">
              Out of Stock
            </span>
          )}
        </div>

        {/* TOP-RIGHT: WISHLIST BUTTON (Section 12: Does not open product details) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`product-wishlist-btn ${isFavorited ? 'active' : ''}`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isFavorited ? 'In Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            size={18}
            fill={isFavorited ? 'var(--color-error, #DC2626)' : 'none'}
            color={isFavorited ? 'var(--color-error, #DC2626)' : 'var(--text-muted)'}
          />
        </button>
      </div>

      <div className="product-info">
        <span className="product-category-tag">{product.category}</span>
        <Link to={`/products/${product.id || product._id}`} title={product.name}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {product.rating && (
          <div className="product-rating">
            <Star size={14} fill="var(--color-star, #F59E0B)" color="var(--color-star, #F59E0B)" />
            <span>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Verified)</span>
          </div>
        )}

        <div className="product-pricing">
          <span className="current-price">₹{product.price?.toLocaleString()}</span>
          {product.original_price && (
            <span className="original-price">₹{product.original_price?.toLocaleString()}</span>
          )}
        </div>

        {isOutOfStock && (
          <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>
            Currently Out of Stock
          </div>
        )}

        {errorMsg && (
          <div style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>
            {errorMsg}
          </div>
        )}

        <div className="product-card-actions">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={`btn btn-primary btn-block ${added ? 'btn-success' : ''}`}
            style={{
              minHeight: '44px', // Section 12: Minimum touch target height: 44px
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
            title={isOutOfStock ? 'Out of stock' : 'Add to shopping cart'}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>Added to Cart</span>
              </>
            ) : adding ? (
              <span>Adding...</span>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
