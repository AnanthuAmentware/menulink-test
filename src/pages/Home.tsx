
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isAdmin, isOwner } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-restaurant-burgundy to-restaurant-burgundy/80 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Create Beautiful Digital Menus for Your Restaurant
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A simple and elegant way to manage and showcase your restaurant's menu with QR codes. Get started in minutes!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated && (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-restaurant-burgundy hover:bg-restaurant-cream">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-restaurant-burgundy">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            {isOwner && (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-restaurant-burgundy hover:bg-restaurant-cream">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button size="lg" className="bg-white text-restaurant-burgundy hover:bg-restaurant-cream">
                  Go to Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-restaurant-cream/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-center mb-12 text-restaurant-burgundy">
            Everything You Need for Your Restaurant Menu
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="restaurant-card">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-restaurant-burgundy">✏️</div>
                <h3 className="text-xl font-bold mb-2">Easy Menu Builder</h3>
                <p className="text-gray-600">
                  Create and organize your menu items into sections with our intuitive interface.
                </p>
              </CardContent>
            </Card>
            
            <Card className="restaurant-card">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-restaurant-burgundy">📱</div>
                <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Your customers can easily view your menu on any device.
                </p>
              </CardContent>
            </Card>
            
            <Card className="restaurant-card">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-restaurant-burgundy">🔄</div>
                <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">
                  Update your menu instantly without reprinting physical menus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-6 text-restaurant-burgundy">Ready to Digitize Your Menu?</h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of restaurants that have already simplified their menu management with MenuBuilder.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="bg-restaurant-burgundy hover:bg-restaurant-burgundy/90">
                Create Your Menu Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
