import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Star, ShoppingCart, Zap, Check, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getProductById(id);
        setProduct(data.product);
        setRelated(data.related || []);
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h3>Product Not Found</h3>
          <p>The product you are looking for does not exist or has been removed.</p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    setErrorMsg('');
    const res = await addToCart(product, quantity);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="container section">
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="product-details-container">
        <div className="details-image-box">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.name}
            className="details-image"
          />
        </div>

        <div className="details-info">
          <span className="details-category">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>

          {product.brand && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Brand: <strong style={{ color: 'var(--text-main)' }}>{product.brand}</strong>
            </p>
          )}

          <div className="details-meta-row">
            {product.rating && (
              <div className="product-rating" style={{ margin: 0 }}>
                <Star size={16} className="rating-star-icon" />
                <span style={{ fontSize: '0.95rem' }}>{product.rating}</span>
                <span style={{ color: 'var(--text-muted)' }}>(Customer Rating)</span>
              </div>
            )}
            <span
              className={`badge ${isOutOfStock ? 'badge-stock-out' : 'badge-stock'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
            >
              {isOutOfStock ? 'Out of Stock' : `${product.stock} Units Available`}
            </span>
          </div>

          <div className="details-price-row">
            <span className="details-price">₹{(product.price * quantity).toLocaleString()}</span>
            {product.original_price && (
              <span className="original-price" style={{ fontSize: '1.15rem' }}>
                ₹{(product.original_price * quantity).toLocaleString()}
              </span>
            )}
            {discountPercent && (
              <span className="badge badge-discount" style={{ fontSize: '0.85rem' }}>
                {discountPercent}% OFF
              </span>
            )}
            {quantity > 1 && (
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                (₹{product.price.toLocaleString()} each)
              </span>
            )}
          </div>

          <p className="details-description">{product.description}</p>

          {!isOutOfStock && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', maxWidth: '300px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Quantity:
                </label>
                {quantity > 1 && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ₹{product.price.toLocaleString()} × {quantity}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {quantity > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                    }}
                  >
                    <span>Total:</span>
                    <span>₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: 'var(--danger)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="details-cta-buttons">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`btn btn-lg ${added ? 'btn-secondary' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {added ? (
                <>
                  <Check size={20} color="var(--success)" />
                  <span style={{ color: 'var(--success)' }}>Added ({quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>
                    {adding
                      ? 'Adding...'
                      : `Add to Cart • ₹${(product.price * quantity).toLocaleString()}`}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn btn-secondary btn-lg"
              style={{ flex: 1, borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <Zap size={20} />
              <span>Buy Now • ₹{(product.price * quantity).toLocaleString()}</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--primary)" /> Fast Delivery across India
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--secondary)" /> 1 Year Manufacturer Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} color="var(--warning)" /> 7 Days Easy Return Policy
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Similar Items You Might Like</h2>
              <p className="section-subtitle">More popular choices from {product.category}</p>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
