// src/components/ui/ThemeToggle.jsx
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full p-1 transition-all duration-500 hover:scale-105 hover:shadow-lg group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Piste du toggle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 to-orange-300 dark:from-blue-400 dark:to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      {/* Bouton circulaire */}
      <div className={`
        relative w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center
        ${isDark ? 'translate-x-6' : 'translate-x-0'}
      `}>
        {/* Icône soleil/light */}
        <div className={`absolute transition-all duration-500 ${
          isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}>
          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Icône lune/dark */}
        <div className={`absolute transition-all duration-500 ${
          isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}>
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>

      {/* Étoiles pour l'effet dark mode */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isDark ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
        <div className="absolute bottom-2 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;