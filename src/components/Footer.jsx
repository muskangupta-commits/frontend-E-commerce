import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '10px', borderRadius: '50%' }}>
              <Truck size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Free Delivery</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On orders over ₹500</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ color: 'var(--secondary)', background: 'var(--success-light)', padding: '10px', borderRadius: '50%' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Genuine Products</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100% authentic curated items</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ color: 'var(--warning)', background: 'var(--warning-light)', padding: '10px', borderRadius: '50%' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Easy Returns</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>7-day hassle-free returns</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '10px', borderRadius: '50%' }}>
              <Headphones size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.92rem', fontWeight: 700 }}>24/7 Support</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dedicated customer care</p>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand-logo" style={{ marginBottom: '0.85rem' }}>
              <img src="/cartify-icon.png" alt="Cartify" className="brand-logo-img" />
              <span>Cartify</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Your premium destination for electronics, fashion, lifestyle, and home essentials.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> <a href="mailto:muskanguptasukrit@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>muskanguptasukrit@gmail.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} /> <a href="tel:+919696466613" style={{ color: 'inherit', textDecoration: 'none' }}>+91 96964 66613</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> Indore, Madhya Pradesh, India
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=Electronics">Electronics</Link></li>
              <li><Link to="/products?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Mobiles">Smartphones</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/orders">My Orders & Tracking</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><a href="#shipping">Shipping Policy</a></li>
              <li><a href="#returns">Returns & Refunds</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Cartify Assurance</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Your verified destination for 100% genuine electronics, fashion, home essentials, and lifestyle products with express delivery.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Cartify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
