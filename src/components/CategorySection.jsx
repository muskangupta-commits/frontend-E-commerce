import React from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  BookOpen,
  Trophy,
  Watch,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Electronics',
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mobiles',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fashion',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Home & Kitchen',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beauty',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Books',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports',
    icon: Trophy,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=240&auto=format&fit=crop&q=80',
  },
  {
    name: 'Accessories',
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop&q=80',
  },
];

const CategorySection = () => {
  return (
    <section className="section" style={{ paddingTop: '0.75rem', paddingBottom: '1.75rem' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore hand-picked collections across trending departments</p>
        </div>
        <Link to="/products" className="btn btn-secondary btn-sm">
          <span>Browse All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => {
          const FallbackIcon = cat.icon;
          return (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
              title={`Shop ${cat.name}`}
            >
              <div className="category-img-wrapper">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="category-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement.querySelector('.category-icon-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="category-icon-fallback" style={{ display: 'none' }}>
                  <FallbackIcon size={26} />
                </div>
              </div>
              <span className="category-card-name">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySection;
