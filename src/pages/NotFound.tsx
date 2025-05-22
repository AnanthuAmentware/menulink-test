
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-10 text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-primary font-display mb-4">404</h1>
        <p className="text-2xl mb-8">Oops! Page not found</p>
        <p className="text-gray-500 mx-auto mb-8">
          We couldn't find the page you were looking for. 
          The page may have been moved, or you might have mistyped the URL.
        </p>
        <Link to="/">
          <Button className="bg-primary/70 hover:bg-primary/90 backdrop-blur-sm text-white">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
