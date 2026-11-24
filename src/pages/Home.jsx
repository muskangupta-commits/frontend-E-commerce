import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import HeroBanner from '../components/HeroBanner';
import TrustStrip from '../components/TrustStrip';
import CategorySection from '../components/CategorySection';
import ProductSection from '../components/ProductSection';
import PromoBanner from '../components/PromoBanner';
import { Sparkles, Flame, Tag, Clock } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.getProducts({ limit: 100 });
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Filter sections preserving backend ranking logic (PDF Section 13)
  const bestDeals = products
    .filter((p) => p.original_price && p.original_price > p.price)
    .slice(0, 10);

  const featured = products.slice(0, 10);

  const trending = products
    .filter((p) => (p.rating || 0) >= 4.5)
    .slice(0, 10);

  const newArrivals = products.slice(10, 20);

  return (
    <div className="homepage-wrapper">
      <div className="container" style={{ paddingTop: '0.5rem' }}>
        {/* 1. HERO AND CATEGORY DISCOVERY (PDF Section 8 & 9) */}
        <section className="hero-discovery-layout">
          <CategorySidebar />
          <div className="hero-banner-main-col">
            <HeroBanner />
          </div>
        </section>

        {/* 2. TRUST AND SERVICE BENEFITS STRIP (PDF Section 10) */}
        <TrustStrip />

        {/* 3. SHOP BY CATEGORY SECTION (PDF Section 11) */}
        <CategorySection />

        {/* 4. BEST DEALS & DISCOUNTS (PDF Section 13) */}
        <ProductSection
          title="Best Deals & Discounts"
          description="Limited-time price drops on verified electronics, kitchen tools, and essentials"
          products={bestDeals}
          viewAllLink="/products"
          loading={loading}
          badgeText="Up to 65% OFF"
          icon={Tag}
        />

        {/* 5. PROMOTIONAL BANNERS (PDF Section 14) */}
        <PromoBanner />

        {/* 6. FEATURED PRODUCTS (PDF Section 13) */}
        <ProductSection
          title="Featured Products"
          description="Hand-picked flagship gadgets and premium recommendations for everyday lifestyle"
          products={featured}
          viewAllLink="/products"
          loading={loading}
          badgeText="Curated Quality"
          icon={Sparkles}
        />

        {/* 7. TRENDING NOW (PDF Section 13) */}
        <ProductSection
          title="Trending Now"
          description="Customer favorites with verified 4.5+ star ratings and outstanding reviews"
          products={trending}
          viewAllLink="/products"
          loading={loading}
          badgeText="Top Rated"
          icon={Flame}
        />

        {/* 8. NEW ARRIVALS (PDF Section 13) */}
        <ProductSection
          title="New Arrivals"
          description="Explore fresh stock, seasonal fashion additions, and next-gen electronic devices"
          products={newArrivals}
          viewAllLink="/products"
          loading={loading}
          badgeText="Fresh In Stock"
          icon={Clock}
        />
      </div>
    </div>
  );
};

export default Home;
