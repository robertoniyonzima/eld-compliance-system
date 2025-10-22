// src/hooks/useTheme.js
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
  // Initialisation synchrone pour éviter le flash
  const [isDark, setIsDark] = useState(() => {
    // Vérifier localStorage d'abord
    const saved = localStorage.getItem('eld-theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Sinon, utiliser la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Appliquer ou retirer la classe 'dark'
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('eld-theme', isDark ? 'dark' : 'light');
    
    console.log('🎨 Theme applied:', isDark ? 'dark' : 'light');
    console.log('📋 HTML classes:', root.className);
  }, [isDark]);

  // Écouter les changements de préférence système (optionnel)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Ne changer que si l'utilisateur n'a pas de préférence sauvegardée
      const saved = localStorage.getItem('eld-theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const value = {
    isDark,
    toggleTheme,
    currentTheme: isDark ? 'dark' : 'light',
    setTheme: (theme) => setIsDark(theme === 'dark')
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};