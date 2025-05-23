
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

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
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/register') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Register
                </Link>
              </>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/menu-builder" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/menu-builder') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Menu Builder
                </Link>
                <Link 
                  to="/qr-code" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/qr-code') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  QR Code
                </Link>
                <Link 
                  to="/theme" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/theme') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                >
                  Theme
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
              >
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white" 
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary/10 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Changed to solid white background with no transparency */}
      {isOpen && (
        <div className="md:hidden bg-white fixed inset-0 z-50 flex flex-col pt-16">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <button 
              className="absolute top-4 right-4 text-black" 
              onClick={closeMenu}
            >
              <X className="h-6 w-6" />
            </button>
            
            <Link 
              to={logoDestination} 
              className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/register') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/menu-builder" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/menu-builder') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  Menu Builder
                </Link>
                <Link 
                  to="/qr-code" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/qr-code') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  QR Code
                </Link>
                <Link 
                  to="/theme" 
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/theme') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                  onClick={closeMenu}
                >
                  Theme
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-black hover:bg-primary/5 hover:text-primary'}`}
                onClick={closeMenu}
              >
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary font-bold hover:bg-primary hover:text-white mt-4" 
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
