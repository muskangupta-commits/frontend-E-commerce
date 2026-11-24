import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';

const POPULAR_SUGGESTIONS = [
  'Mixer Grinders',
  'iPhone 15 Pro',
  'Cotton Shirts',
  'Wireless Headphones',
  'Smartwatches',
  'Laptops',
];

const SearchBar = ({ onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const urlSearch = new URLSearchParams(location.search).get('search') || '';
  const [query, setQuery] = useState(urlSearch);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    setShowDropdown(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      if (trimmed) {
        navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      } else {
        navigate('/products');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <div ref={wrapperRef} className="search-bar-outer" style={{ position: 'relative', width: '100%' }}>
      <form className="header-search" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search products, brands and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            aria-label="Search products, brands and more"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="search-clear-btn"
              title="Clear search"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.2rem',
                marginRight: '0.4rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </div>
      </form>

      {/* SEARCH SUGGESTIONS DROPDOWN */}
      {showDropdown && (
        <div className="search-suggestions-dropdown">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.5rem 0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Trending Searches
          </div>
          {POPULAR_SUGGESTIONS.map((sug) => (
            <div
              key={sug}
              className="search-suggestion-item"
              onMouseDown={() => {
                setQuery(sug);
                executeSearch(sug);
              }}
            >
              <TrendingUp size={14} color="var(--primary)" />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
