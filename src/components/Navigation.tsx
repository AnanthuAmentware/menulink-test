
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  // Determine where logo should link to
  const logoDestination = isAuthenticated ? "/dashboard" : "/";

  return (
    <nav className="bg-white text-black shadow-md z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={logoDestination} className="flex-shrink-0 flex items-center">
              <span className="font-display text-xl font-bold text-primary">MenuBuilder</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/register') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <User className="h-4 w-4" />
                  Register
                </Link>
              </>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/menu-builder" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/menu-builder') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <MenuIcon className="h-4 w-4" />
                  Menu Builder
                </Link>
                <Link 
                  to="/qr-code" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/qr-code') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 flex items-center gap-2 transition-colors" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <MobileDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
