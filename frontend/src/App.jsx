// src/App.jsx - SIMPLIFIÉ
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/dashboard/DriverDashboard';
import ELDLogs from './pages/ELDLogs';
import TripPlanner from './pages/TripPlanner';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './styles/globals.css';


// Pages dashboard
const ManagerDashboard = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h1>
    <p className="text-slate-600 dark:text-slate-400">Manager interface</p>
  </div>
);

const AdminDashboard = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
    <p className="text-slate-600 dark:text-slate-400">Administration panel</p>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.user_type !== requiredRole) {
    // Rediriger vers le dashboard approprié selon le rôle
    const userDashboard = getUserDashboardRoute(user.user_type);
    return <Navigate to={userDashboard} replace />;
  }
  
  return children;
};

// Fonction utilitaire pour les routes de dashboard
const getUserDashboardRoute = (userType) => {
  switch (userType) {
    case 'admin': return '/admin';
    case 'manager': return '/manager';
    case 'driver': 
    default: return '/driver';
  }
};

// Composant de redirection automatique
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
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Route racine - redirection automatique */}
      <Route path="/" element={<DashboardRedirect />} />
      
      {/* Dashboards par rôle */}
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
      
      {/* Routes fonctionnelles */}
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
      
      {/* Fallback pour routes inexistantes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          {/* Supprime la classe ici, laisse le thème gérer le background */}
          <div className="App min-h-screen">
            <AppRoutes />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;