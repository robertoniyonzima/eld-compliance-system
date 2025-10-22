// src/components/ui/GlassCard.jsx
const GlassCard = ({ children, className = '', hover = true, variant = 'default' }) => {
  const variants = {
    default: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-lg shadow-black/5',
    elevated: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-slate-600/50 shadow-2xl shadow-black/10',
    subtle: 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-white/30 dark:border-slate-700/30 shadow-md shadow-black/5'
  };

  return (
    <div className={`
      ${variants[variant]}
      rounded-2xl
      transition-all duration-500
      ${hover ? 'hover:bg-white/80 hover:dark:bg-slate-800/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;