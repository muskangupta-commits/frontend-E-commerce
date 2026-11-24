import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck, Plus } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <ShoppingCart className="empty-state-icon" />
          <h3>Your Shopping Cart is Empty</h3>
          <p>Explore thousands of trending items across electronics, fashion, and essentials.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Shopping Cart</h1>
          <p className="section-subtitle">
            {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        <Link to="/products" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <div className="cart-layout">
        <div className="cart-items-panel">
          {cart.items.map((item) => {
            const product = item.product || {};
            return (
              <div key={item.product_id} className="cart-item-row">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                  alt={product.name}
                  className="cart-item-thumb"
                />

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {product.category}
                  </span>
                  <Link to={`/products/${item.product_id}`}>
                    <h4 className="cart-item-name">{product.name}</h4>
                  </Link>
                  <div className="cart-item-price">
                    ₹{product.price?.toLocaleString()} {item.quantity > 1 ? <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(₹{product.price?.toLocaleString()} each)</span> : null}
                  </div>
                  {product.stock <= 5 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
                      Only {product.stock} left in stock
                    </span>
                  )}
                </div>

                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    title="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    disabled={item.quantity >= (product.stock || 999)}
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    ₹{(product.price * item.quantity).toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', padding: '0.3rem 0.6rem' }}
                    title="Remove product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '1.25rem', textAlign: 'left' }}>
            <Link
              to="/products"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
            >
              <Plus size={16} /> Add More Items
            </Link>
          </div>
        </div>

        <aside className="cart-summary-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Order Summary</h3>

          <div className="summary-row">
            <span>Items Subtotal:</span>
            <span>₹{cart.subtotal.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Charges:</span>
            <span>
              {cart.delivery_charge === 0 ? (
                <strong style={{ color: 'var(--success)' }}>FREE</strong>
              ) : (
                `₹${cart.delivery_charge}`
              )}
            </span>
          </div>

          {cart.delivery_charge > 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Add items worth ₹{(500 - cart.subtotal).toFixed(0)} more for FREE delivery.
            </p>
          )}

          <div className="summary-row total-row">
            <span>Total Payable:</span>
            <span style={{ color: 'var(--primary)' }}>₹{cart.total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '1.5rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.2rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--success)" /> Safe and Secure Checkout
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="var(--primary)" /> Cash on Delivery Available
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
