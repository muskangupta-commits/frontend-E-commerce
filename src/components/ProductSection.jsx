import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ArrowRight, PackageX } from 'lucide-react';

const ProductSection = ({
  title,
  description,
  products = [],
  viewAllLink,
  loading = false,
  badgeText,
  icon: Icon,
}) => {
  return (
    <section className="product-section-wrapper">
      <div className="section-header-row">
        <div>
          {badgeText && (
            <span className="section-badge-pill">
              {Icon && <Icon size={13} style={{ marginRight: '4px' }} />}
              {badgeText}
            </span>
          )}
          <h2 className="section-main-heading">{title}</h2>
          {description && <p className="section-sub-desc">{description}</p>}
        </div>

        {viewAllLink && (
          <Link to={viewAllLink} className="section-view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="product-card skeleton-card">
              <div className="skeleton-image" />
              <div style={{ padding: '1rem' }}>
                <div className="skeleton-line" style={{ width: '40%', height: '12px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '85%', height: '18px', marginBottom: '12px' }} />
                <div className="skeleton-line" style={{ width: '50%', height: '20px', marginBottom: '16px' }} />
                <div className="skeleton-line" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="section-empty-box">
          <PackageX size={36} color="var(--text-muted)" />
          <p>No products currently available in this section.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSection;
