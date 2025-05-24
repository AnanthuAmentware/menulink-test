
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MenuBuilder from "./pages/MenuBuilder";
import QRCodePage from "./pages/QRCode";
import EditProfile from "./pages/EditProfile";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";
import NotFound from "./pages/NotFound";

// Components
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Wrapper component to conditionally render Navigation
const AppContent = () => {
  const location = useLocation();
  // Don't show navigation on menu pages
  const isMenuPage = location.pathname.includes('/menu/');

  return (
    <div className="min-h-screen flex flex-col">
      {!isMenuPage && <Navigation />}
      <div className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          
          {/* Restaurant owner routes */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu-builder" element={<MenuBuilder />} />
            <Route path="/qr-code" element={<QRCodePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit/:restaurantId" element={<AdminEdit />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
