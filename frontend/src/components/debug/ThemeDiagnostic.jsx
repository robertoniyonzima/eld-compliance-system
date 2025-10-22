// src/components/debug/ThemeDiagnostic.jsx
import { useTheme } from '../../hooks/useTheme';
import { useEffect, useState } from 'react';

const ThemeDiagnostic = () => {
  const { isDark, toggleTheme, currentTheme } = useTheme();
  const [diagnostics, setDiagnostics] = useState({});

  useEffect(() => {
    const runDiagnostics = () => {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      setDiagnostics({
        htmlClasses: root.className || '(empty)',
        htmlDataTheme: root.getAttribute('data-theme') || '(none)',
        darkClassPresent: root.classList.contains('dark'),
        localStorage: localStorage.getItem('eld-theme') || '(empty)',
        bodyBgColor: window.getComputedStyle(document.body).backgroundColor,
        rootBgColor: computedStyle.backgroundColor,
        prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
        tailwindVersion: 'v4.1.12',
      });
    };

    runDiagnostics();
    // Re-run diagnostics after theme changes
    const interval = setInterval(runDiagnostics, 500);
    return () => clearInterval(interval);
  }, [isDark]);

  const forceToggleDark = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    console.log('🔧 Force toggled dark class:', root.classList.contains('dark'));
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('eld-theme');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          🔍 Theme Diagnostics
        </h3>
      </div>

      {/* Diagnostics */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto text-xs">
        {/* Status actuel */}
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <p className="font-bold text-slate-900 dark:text-white mb-2">📊 Current State</p>
          <div className="space-y-1">
            <DiagLine label="Theme Context" value={currentTheme} />
            <DiagLine label="isDark" value={String(isDark)} />
            <DiagLine label="HTML has 'dark'" value={String(diagnostics.darkClassPresent)} />
          </div>
        </div>

        {/* DOM State */}
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <p className="font-bold text-slate-900 dark:text-white mb-2">🌐 DOM State</p>
          <div className="space-y-1">
            <DiagLine label="HTML classes" value={diagnostics.htmlClasses} mono />
            <DiagLine label="data-theme" value={diagnostics.htmlDataTheme} />
            <DiagLine label="Body bg-color" value={diagnostics.bodyBgColor} mono />
          </div>
        </div>

        {/* Storage & Prefs */}
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <p className="font-bold text-slate-900 dark:text-white mb-2">💾 Storage & Prefs</p>
          <div className="space-y-1">
            <DiagLine label="localStorage" value={diagnostics.localStorage} />
            <DiagLine label="System prefers dark" value={String(diagnostics.prefersDark)} />
            <DiagLine label="Tailwind version" value={diagnostics.tailwindVersion} />
          </div>
        </div>

        {/* Visual Test */}
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <p className="font-bold text-slate-900 dark:text-white mb-2">🎨 Visual Test</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded flex items-center justify-center text-slate-900 dark:text-white text-xs">
              Light/Dark
            </div>
            <div className="h-12 bg-blue-500 dark:bg-blue-700 rounded flex items-center justify-center text-white text-xs">
              Blue Variant
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            🔄 Toggle Theme (Hook)
          </button>
          
          <button 
            onClick={forceToggleDark}
            className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
          >
            ⚡ Force Toggle (DOM)
          </button>

          <button 
            onClick={clearLocalStorage}
            className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            🗑️ Clear Storage & Reload
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
          <p className="font-bold text-yellow-800 dark:text-yellow-200 mb-1 text-xs">
            📝 What to check:
          </p>
          <ul className="text-yellow-700 dark:text-yellow-300 text-xs space-y-1 list-disc list-inside">
            <li>HTML classes should show "dark" or be empty</li>
            <li>Body bg-color should change</li>
            <li>If Force Toggle works but Hook doesn't → Hook issue</li>
            <li>If neither works → Tailwind config issue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DiagLine = ({ label, value, mono = false }) => (
  <div className="flex justify-between text-slate-700 dark:text-slate-300">
    <span className="font-medium">{label}:</span>
    <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
  </div>
);

export default ThemeDiagnostic;