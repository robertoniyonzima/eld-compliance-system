// src/components/ui/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'medium', className = '', text = '' }) => {
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-3 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;