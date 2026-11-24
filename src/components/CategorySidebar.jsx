import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  BookOpen,
  Trophy,
  Watch,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'Electronics', slug: 'Electronics', icon: Laptop },
  { name: 'Mobiles', slug: 'Mobiles', icon: Smartphone },
  { name: 'Fashion', slug: 'Fashion', icon: Shirt },
  { name: 'Home & Kitchen', slug: 'Home & Kitchen', icon: Home },
  { name: 'Beauty', slug: 'Beauty', icon: Sparkles },
  { name: 'Books', slug: 'Books', icon: BookOpen },
  { name: 'Sports', slug: 'Sports', icon: Trophy },
  { name: 'Accessories', slug: 'Accessories', icon: Watch },
];

const CategorySidebar = () => {
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get('category') || '';

  return (
    <aside className="desktop-category-sidebar" aria-label="Product Categories">
      <div className="sidebar-header">
        <LayoutGrid size={18} color="var(--color-primary)" />
        <h3 className="sidebar-title">All Categories</h3>
      </div>
      <ul className="sidebar-category-list">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentCategory === item.name;

          return (
            <li key={item.name} className="sidebar-category-li">
              <Link
                to={`/products?category=${encodeURIComponent(item.name)}`}
                className={`sidebar-category-link ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-cat-left">
                  <span className="sidebar-cat-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sidebar-cat-name">{item.name}</span>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
