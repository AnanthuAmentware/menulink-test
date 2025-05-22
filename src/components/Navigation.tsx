
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-restaurant-burgundy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-display text-xl font-bold">MenuBuilder</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/register') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  Register
                </Link>
              </>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/menu-builder" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/menu-builder') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  Menu Builder
                </Link>
                <Link 
                  to="/qr-code" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/qr-code') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                >
                  QR Code
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
              >
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="border-white hover:bg-white hover:text-restaurant-burgundy" 
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
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-restaurant-burgundy/50 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-restaurant-burgundy/95 fixed inset-0 z-50 flex flex-col pt-16">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              className="absolute top-4 right-4 text-white" 
              onClick={closeMenu}
            >
              <X className="h-6 w-6" />
            </button>
            
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/login') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/register') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
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
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/menu-builder" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/menu-builder') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                  onClick={closeMenu}
                >
                  Menu Builder
                </Link>
                <Link 
                  to="/qr-code" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/qr-code') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                  onClick={closeMenu}
                >
                  QR Code
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin') ? 'bg-restaurant-burgundy/80' : 'hover:bg-restaurant-burgundy/50'}`}
                onClick={closeMenu}
              >
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="w-full border-white hover:bg-white hover:text-restaurant-burgundy mt-4" 
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
