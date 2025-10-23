// src/hooks/useTheme.js - VERSION DEBUG
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem('eld-theme');
    if (saved !== null) {
      console.log('📁 Theme from localStorage:', saved);
      return saved === 'dark';
    }
    
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('💻 System theme preference:', systemDark ? 'dark' : 'light');
    return systemDark;
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('🎨 ThemeProvider mounted, initial theme:', isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    
    console.log('🔄 Applying theme:', isDark ? 'dark' : 'light');
    
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      console.log('✅ Dark mode applied');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      console.log('✅ Light mode applied');
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('eld-theme', isDark ? 'dark' : 'light');
    console.log('💾 Theme saved to localStorage');
    
  }, [isDark, isMounted]);

  // Écouter les changements de préférence système
  useEffect(() => {
    if (!isMounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const saved = localStorage.getItem('eld-theme');
      if (!saved) {
        console.log('🖥️ System theme changed to:', e.matches ? 'dark' : 'light');
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMounted]);

  const toggleTheme = () => {
    console.log('🔄 Toggling theme from:', isDark ? 'dark' : 'light', 'to:', !isDark ? 'dark' : 'light');
    setIsDark(prev => !prev);
  };

  const value = {
    isDark,
    toggleTheme,
    currentTheme: isDark ? 'dark' : 'light',
    setTheme: (theme) => {
      console.log('🎨 Setting theme to:', theme);
      setIsDark(theme === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};