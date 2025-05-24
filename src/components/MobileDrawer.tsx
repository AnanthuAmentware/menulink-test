
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, X } from 'lucide-react';

const MobileDrawer = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const closeDrawer = () => setIsOpen(false);

  const logoDestination = isAuthenticated ? "/dashboard" : "/";

  const navigationItems = [
    ...(isAuthenticated ? [] : [
      { to: "/", label: "Home", icon: Home },
      { to: "/login", label: "Login", icon: User },
      { to: "/register", label: "Register", icon: User },
    ]),
    ...(isOwner ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/menu-builder", label: "Menu Builder", icon: MenuIcon },
      { to: "/qr-code", label: "QR Code", icon: QrCode },
    ] : []),
    ...(isAdmin ? [
      { to: "/admin", label: "Admin Panel", icon: Settings },
    ] : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold text-primary">MenuBuilder</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full pt-6">
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {isAuthenticated && (
            <div className="border-t pt-4 mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  closeDrawer();
                }}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileDrawer;
