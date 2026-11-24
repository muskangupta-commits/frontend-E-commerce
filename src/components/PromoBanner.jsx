import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

const PromoBanner = () => {
  return (
    <div className="promo-banner-split-row" aria-label="Featured Promotions">
      {/* BANNER 1: HOME & KITCHEN */}
      <div className="promo-banner-card promo-card-kitchen">
        <div className="promo-card-content">
          <span className="promo-badge-tag">
            <Zap size={13} /> Kitchen Appliances
          </span>
          <h3 className="promo-heading">Mixers, Grinders & Juicers</h3>
          <p className="promo-paragraph">
            High-torque 750W copper motors with multi-utility jars. Save up to 45% today.
          </p>
          <Link to="/products?category=Home+%26+Kitchen" className="promo-cta-btn">
            <span>Explore Kitchen Deals</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="promo-card-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80"
            alt="Mixer Grinders & Kitchen Appliances"
            className="promo-image"
            loading="lazy"
          />
        </div>
      </div>

      {/* BANNER 2: FASHION & LIFESTYLE */}
      <div className="promo-banner-card promo-card-fashion">
        <div className="promo-card-content">
          <span className="promo-badge-tag" style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', color: 'var(--color-accent-purple)', borderColor: 'rgba(124, 58, 237, 0.25)' }}>
            <Sparkles size={13} /> Trending Wardrobe
          </span>
          <h3 className="promo-heading">Men's Shirts & Urban Wear</h3>
          <p className="promo-paragraph">
            Breathable premium cotton linen, check styles & smart casuals.
          </p>
          <Link to="/products?category=Fashion" className="promo-cta-btn">
            <span>Browse Apparel</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="promo-card-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80"
            alt="Men's Casual Shirts & Fashion"
            className="promo-image"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
