
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-restaurant-cream/10">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-restaurant-burgundy font-display mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          We couldn't find the page you were looking for. 
          The page may have been moved, or you might have mistyped the URL.
        </p>
        <Link to="/">
          <Button className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
