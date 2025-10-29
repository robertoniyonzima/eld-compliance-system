// src/components/ui/GlassCard.jsx - PROFESSIONAL LIGHT MODE
const GlassCard = ({ children, className = '', hover = true, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
    elevated: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md',
    subtle: 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm'
  };

  return (
    <div className={`
      ${variants[variant]}
      rounded-2xl
      transition-all duration-200
      ${hover ? 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;