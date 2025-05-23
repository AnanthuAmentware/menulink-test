
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Home />;
};

export default Index;
