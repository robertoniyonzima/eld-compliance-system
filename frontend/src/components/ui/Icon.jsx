// Professional Icon Component
import * as LucideIcons from 'lucide-react';

const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  strokeWidth = 2,
  ...props 
}) => {
  const IconComponent = LucideIcons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
};

export default Icon;
