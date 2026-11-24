import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Filter, RotateCcw, PackageSearch, Search } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Mobiles',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Books',
  'Sports',
  'Accessories',
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [fallbackProducts, setFallbackProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort_by') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({
          search,
          category: category === 'All' ? '' : category,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          sort_by: sortBy,
          limit: 100,
        });
        setProducts(res.products || []);
        setTotal(res.total || 0);

        // If search returned 0 results, also load all catalog items as helpful suggestions
        if (search && (!res.products || res.products.length === 0)) {
          const allRes = await api.getProducts({ limit: 40 });
          setFallbackProducts(allRes.products || []);
        } else {
          setFallbackProducts([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sortBy, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleInPageSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      next.set('search', localSearch.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('min_price', localMin);
    else next.delete('min_price');

    if (localMax) next.set('max_price', localMax);
    else next.delete('max_price');

    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalMin('');
    setLocalMax('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container section">
      <div className="section-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="section-title">
            {search ? `Search results for "${search}"` : category !== 'All' ? `${category}` : 'All Products & Materials'}
          </h1>
          <p className="section-subtitle">
            {products.length > 0
              ? 'Showing verified products ready for fast delivery'
              : 'Browse our complete catalog of materials and products'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleInPageSearch} style={{ display: 'flex', gap: '0.4rem' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                placeholder="Search catalog..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.88rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={15} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort_by', e.target.value)}
              style={{ minWidth: '160px', padding: '0.5rem 0.75rem' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-catalog-layout">
        <aside
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} />
              Filters
            </h3>
            {(category !== 'All' || search || minPrice || maxPrice || sortBy !== 'newest') && (
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary btn-sm"
                title="Reset all filters"
                style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  style={{
                    textAlign: 'left',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: category === cat ? 700 : 500,
                    backgroundColor: category === cat ? 'var(--primary-light)' : 'transparent',
                    color: category === cat ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{cat}</span>
                  {category === cat && <span style={{ fontSize: '0.75rem' }}>●</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Price Range (₹)
            </h4>
            <form onSubmit={handleApplyPriceFilter}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm btn-block">
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        <main>
          {loading ? (
            <div className="loading-spinner" />
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div>
              <div className="empty-state" style={{ marginBottom: '2.5rem' }}>
                <PackageSearch className="empty-state-icon" />
                <h3>No exact match found for "{search}"</h3>
                <p>We couldn't find items matching your exact query. Try another keyword or browse all materials below.</p>
                <button onClick={handleClearFilters} className="btn btn-primary">
                  View All Materials & Products
                </button>
              </div>

              {fallbackProducts.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800 }}>
                    Popular Products You Might Like:
                  </h3>
                  <div className="product-grid">
                    {fallbackProducts.slice(0, 12).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
