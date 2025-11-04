// src/App.jsx - WITH EMAIL VERIFICATION
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DriverDashboard from './pages/dashboard/DriverDashboard';
import ELDLogs from './pages/ELDLogs';
import TripPlanner from './pages/TripPlanner';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import LoadingSpinner from './components/ui/LoadingSpinner';
import BackgroundPattern from './components/ui/BackgroundPattern';
import './styles/globals.css';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
// Pages dashboard
// const ManagerDashboard = () => (
//   <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
//     <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h1>
//     <p className="text-slate-600 dark:text-slate-400">Manager interface</p>
//   </div>
// );

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.user_type !== requiredRole) {
    const userDashboard = getUserDashboardRoute(user.user_type);
    return <Navigate to={userDashboard} replace />;
  }
  
  return children;
};

const getUserDashboardRoute = (userType) => {
  switch (userType) {
    case 'admin': return '/admin';
    case 'manager': return '/manager';
    case 'driver': 
    default: return '/driver';
  }
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const dashboardRoute = getUserDashboardRoute(user.user_type);
  return <Navigate to={dashboardRoute} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<DashboardRedirect />} />
      
      <Route 
        path="/driver" 
        element={
          <ProtectedRoute>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/logs" 
        element={
          <ProtectedRoute>
            <ELDLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trips" 
        element={
          <ProtectedRoute>
            <TripPlanner />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  // Determine basename based on environment
  const getBasename = () => {
    // Only use basename on Vercel production
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return '/frontendELDsystem';
    }
    // Local development - no basename
    return '/';
  };

  return (
    <Router basename={getBasename()}>
      <ThemeProvider>
        <AuthProvider>
          {/* ⭐ BACKGROUND WITH PROFESSIONAL PATTERN */}
          <div className="min-h-screen relative">
            {/* Background Pattern - Always visible behind everything */}
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
              <BackgroundPattern />
            </div>
            
            {/* Content - Above background */}
            <div className="relative">
              <AppRoutes />
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;