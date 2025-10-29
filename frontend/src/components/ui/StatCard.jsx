// Professional Stat Card Component
import Icon from './Icon';

const StatCard = ({ icon, title, value, subtitle, color = 'from-blue-500 to-indigo-600', iconName }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          {iconName ? (
            <Icon name={iconName} size={24} className="text-white" strokeWidth={2.5} />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
