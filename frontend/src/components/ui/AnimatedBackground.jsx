// src/components/ui/AnimatedBackground.jsx
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient de base sophistiqué */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/10"></div>
      
      {/* Éléments géométriques animés */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-violet-500/5 to-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Pattern de grille subtil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>
    </div>
  );
};

export default AnimatedBackground;