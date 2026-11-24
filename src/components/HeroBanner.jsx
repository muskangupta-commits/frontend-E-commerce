import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Sparkles, Star } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'slide_1',
    badge: 'Mega Festive Deals • Up to 65% OFF',
    title: 'Smart Shopping, Curated for You',
    description: 'Explore verified electronics, flagship smartphones, mixer grinders, and men’s fashion with fast Cash on Delivery.',
    ctaText: 'Shop All Deals',
    ctaLink: '/products',
    secondaryCtaText: 'Kitchen & Mixers',
    secondaryCtaLink: '/products?category=Home+%26+Kitchen',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    productName: 'iPhone 15 Pro (Natural Titanium)',
    productPrice: '₹1,27,990',
    originalPrice: '₹1,34,900',
    rating: '4.8',
  },
  {
    id: 'slide_2',
    badge: 'Home & Kitchen Bonanza • Special Discount',
    title: 'High-Power Kitchen Mixers & Tools',
    description: 'Upgrade your culinary setup with 750W high-torque motor mixer grinders and multi-utility stainless steel jars.',
    ctaText: 'Explore Kitchen Deals',
    ctaLink: '/products?category=Home+%26+Kitchen',
    secondaryCtaText: 'Browse Appliances',
    secondaryCtaLink: '/products?search=mixer',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    productName: 'Bajaj Rex 500W Mixer Grinder',
    productPrice: '₹2,199',
    originalPrice: '₹3,499',
    rating: '4.6',
  },
  {
    id: 'slide_3',
    badge: 'New Season Wardrobe • Fresh Arrivals',
    title: 'Men’s Urban Shirts & Everyday Style',
    description: 'Breathe easy in 100% pure linen casual shirts, check patterns, and versatile apparel crafted for maximum comfort.',
    ctaText: 'Shop Men’s Fashion',
    ctaLink: '/products?category=Fashion',
    secondaryCtaText: 'View Collections',
    secondaryCtaLink: '/products?search=shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    productName: 'Allen Solly Cotton Casual Shirt',
    productPrice: '₹1,499',
    originalPrice: '₹2,299',
    rating: '4.5',
  },
  {
    id: 'slide_4',
    badge: 'Audio & Wearables • Top Rated',
    title: 'Immersive Sound & Smart Wearables',
    description: 'Industry-leading noise cancelling headphones, GPS fitness watches, and high-fidelity wireless audio accessories.',
    ctaText: 'Explore Audio & Wearables',
    ctaLink: '/products?category=Electronics',
    secondaryCtaText: 'View Smartwatches',
    secondaryCtaLink: '/products?category=Accessories',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productName: 'Sony WH-1000XM5 Wireless Audio',
    productPrice: '₹24,990',
    originalPrice: '₹34,990',
    rating: '4.9',
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div
      className="modern-hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Showcase"
    >
      <div className="hero-content-col">
        <span className="hero-badge-chip">
          <Zap size={14} />
          <span>{slide.badge}</span>
        </span>

        <h1 className="hero-main-title">{slide.title}</h1>

        <p className="hero-main-desc">{slide.description}</p>

        <div className="hero-actions-row">
          <Link to={slide.ctaLink} className="btn btn-primary btn-lg hero-cta-btn">
            <span>{slide.ctaText}</span>
            <ArrowRight size={18} />
          </Link>
          {slide.secondaryCtaText && (
            <Link to={slide.secondaryCtaLink} className="btn btn-secondary btn-lg hero-secondary-btn">
              <span>{slide.secondaryCtaText}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="hero-image-col">
        <div className="hero-spotlight-card">
          <span className="hero-product-badge">
            <Sparkles size={13} /> Spotlight Deal
          </span>
          <div className="hero-product-img-box">
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.productName}
              className="hero-product-img"
            />
          </div>
          <div className="hero-product-details">
            <h4 className="hero-product-name">{slide.productName}</h4>
            <div className="hero-product-price-row">
              <span className="hero-price-now">{slide.productPrice}</span>
              <span className="hero-price-orig">{slide.originalPrice}</span>
              <span className="hero-rating-badge">
                <Star size={12} fill="#F59E0B" color="#F59E0B" /> {slide.rating}
              </span>
            </div>
            <Link to={slide.ctaLink} className="btn btn-primary btn-sm btn-block" style={{ marginTop: '0.4rem' }}>
              View Deal
            </Link>
          </div>
        </div>
      </div>

      {/* CAROUSEL CONTROLS */}
      <div className="hero-controls-bar">
        <div className="hero-dots-wrap">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot-btn ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="hero-arrows-wrap">
          <button
            type="button"
            className="hero-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="hero-arrow-btn"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
