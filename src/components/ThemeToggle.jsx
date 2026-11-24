import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="header-btn"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle theme"
      style={{ padding: '0.4rem 0.5rem' }}
    >
      {theme === 'light' ? (
        <>
          <Moon size={18} />
          <span className="hide-on-mobile" style={{ fontSize: '0.85rem' }}>Dark</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span className="hide-on-mobile" style={{ fontSize: '0.85rem' }}>Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
