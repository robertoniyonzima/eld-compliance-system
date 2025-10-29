// WhatsApp Style Background Pattern - Full Page Objects
import { 
  Truck, Car, Home, Watch, Tablet, Headphones, Smartphone, 
  Laptop, MapPin, Route, Navigation, Gauge, Clock, Map,
  Package, ShoppingBag, Coffee, Music, Camera, Briefcase
} from 'lucide-react';

const BackgroundPattern = () => {
  // Array of objects with random positions
  const objects = [
    // Row 1 - Top
    { Icon: Truck, size: 45, top: '5%', left: '8%', delay: 0 },
    { Icon: Watch, size: 35, top: '8%', left: '25%', delay: 1 },
    { Icon: Home, size: 40, top: '6%', left: '45%', delay: 2 },
    { Icon: Tablet, size: 38, top: '7%', left: '65%', delay: 0.5 },
    { Icon: Car, size: 42, top: '9%', left: '85%', delay: 1.5 },
    
    // Row 2
    { Icon: Headphones, size: 36, top: '18%', left: '12%', delay: 2 },
    { Icon: Smartphone, size: 34, top: '20%', left: '32%', delay: 0.8 },
    { Icon: MapPin, size: 38, top: '19%', left: '52%', delay: 1.2 },
    { Icon: Laptop, size: 40, top: '21%', left: '72%', delay: 0.3 },
    { Icon: Package, size: 37, top: '17%', left: '90%', delay: 1.8 },
    
    // Row 3
    { Icon: Route, size: 39, top: '32%', left: '6%', delay: 1 },
    { Icon: Coffee, size: 35, top: '34%', left: '22%', delay: 0.5 },
    { Icon: Gauge, size: 38, top: '33%', left: '40%', delay: 1.5 },
    { Icon: ShoppingBag, size: 36, top: '35%', left: '58%', delay: 0.2 },
    { Icon: Music, size: 37, top: '31%', left: '78%', delay: 1.3 },
    { Icon: Truck, size: 41, top: '36%', left: '94%', delay: 0.7 },
    
    // Row 4
    { Icon: Camera, size: 38, top: '46%', left: '10%', delay: 1.2 },
    { Icon: Clock, size: 36, top: '48%', left: '28%', delay: 0.4 },
    { Icon: Navigation, size: 37, top: '47%', left: '46%', delay: 1.6 },
    { Icon: Briefcase, size: 39, top: '49%', left: '64%', delay: 0.9 },
    { Icon: Map, size: 40, top: '45%', left: '82%', delay: 1.1 },
    
    // Row 5
    { Icon: Home, size: 38, top: '60%', left: '14%', delay: 0.6 },
    { Icon: Car, size: 40, top: '62%', left: '34%', delay: 1.4 },
    { Icon: Watch, size: 35, top: '61%', left: '52%', delay: 0.3 },
    { Icon: Tablet, size: 37, top: '63%', left: '70%', delay: 1.7 },
    { Icon: Headphones, size: 36, top: '59%', left: '88%', delay: 0.8 },
    
    // Row 6 - Bottom
    { Icon: Smartphone, size: 34, top: '74%', left: '8%', delay: 1.3 },
    { Icon: Package, size: 38, top: '76%', left: '26%', delay: 0.5 },
    { Icon: Coffee, size: 35, top: '75%', left: '44%', delay: 1.8 },
    { Icon: Truck, size: 42, top: '77%', left: '62%', delay: 0.2 },
    { Icon: Laptop, size: 39, top: '73%', left: '80%', delay: 1.5 },
    
    // Row 7 - Very Bottom
    { Icon: Music, size: 36, top: '88%', left: '12%', delay: 0.9 },
    { Icon: MapPin, size: 37, top: '90%', left: '32%', delay: 1.2 },
    { Icon: Gauge, size: 38, top: '89%', left: '52%', delay: 0.4 },
    { Icon: ShoppingBag, size: 35, top: '91%', left: '72%', delay: 1.6 },
    { Icon: Camera, size: 37, top: '87%', left: '90%', delay: 0.7 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-indigo-950/10" />
      
      {/* All Objects - WhatsApp Style */}
      {objects.map((obj, index) => {
        const { Icon, size, top, left, delay } = obj;
        const animationClass = index % 3 === 0 ? 'animate-float' : index % 3 === 1 ? 'animate-float-delayed' : 'animate-float-slow';
        
        return (
          <div
            key={index}
            className={`absolute opacity-[0.04] dark:opacity-[0.08] ${animationClass}`}
            style={{ 
              top, 
              left,
              animationDelay: `${delay}s`
            }}
          >
            <Icon 
              size={size} 
              className="text-blue-600 dark:text-blue-400" 
              strokeWidth={1.5} 
            />
          </div>
        );
      })}
      
      {/* Very Subtle Dot Grid - Full Page */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1" fill="currentColor" className="text-blue-600 dark:text-blue-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
};

export default BackgroundPattern;
