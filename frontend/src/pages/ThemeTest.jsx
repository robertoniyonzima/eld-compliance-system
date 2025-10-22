import { useTheme } from '../hooks/useTheme';

const ThemeTest = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Theme Test Page
        </h1>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl">
          <p className="text-slate-900 dark:text-white mb-4">
            Current mode: <strong>{isDark ? 'Dark' : 'Light'}</strong>
          </p>
          
          <button
            onClick={toggleTheme}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Toggle to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded">Red</div>
          <div className="p-4 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded">Green</div>
          <div className="p-4 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">Blue</div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;