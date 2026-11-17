import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('campusrag_theme');
    // Ensure crisp white light mode is default
    if (!saved || saved === 'dark') {
      try {
        localStorage.setItem('campusrag_theme', 'light');
      } catch (e) {}
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
      }
      return false;
    }
    return false; // Default: Pure White Light Mode
  });

  // Apply immediately on mount to be 100% sure documentElement has the class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Synchronous, zero-lag theme toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.classList.contains('dark');
    const willBeDark = !currentlyDark;

    // 1. Direct synchronous DOM manipulation for 0ms instantaneous response
    if (willBeDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('campusrag_theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('campusrag_theme', 'light');
      } catch (e) {}
    }

    // 2. Update React state for icons and components
    setIsDarkMode(willBeDark);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
