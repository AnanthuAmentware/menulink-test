
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/types';
import { Edit, Eye, QrCode, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentUser) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', currentUser.uid));
        
        if (restaurantDoc.exists()) {
          setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant);
        } else {
          toast({
            title: "Restaurant not found",
            description: "Please complete your restaurant profile.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load your restaurant information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [currentUser, toast]);

  const menuItemsCount = restaurant?.menuSections?.reduce(
    (total, section) => total + (section?.items?.length || 0), 
    0
  ) || 0;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading your restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-4xl font-bold font-display mb-8 text-primary">Restaurant Dashboard</h1>
      
      {restaurant ? (
        <div className="dashboard-container">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                <CardDescription>
                  {restaurant.location || "No location set"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.isPublic 
                        ? "bg-green-500/30 backdrop-blur-sm text-green-800" 
                        : "bg-amber-500/30 backdrop-blur-sm text-amber-800"
                    }`}>
                      {restaurant.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Menu Sections:</span>
                    <span>{restaurant.menuSections?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Menu Items:</span>
                    <span>{menuItemsCount}</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Description:</p>
                    <p className="text-sm">
                      {restaurant.description || "No description available."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Contact:</p>
                    <p className="text-sm">
                      {restaurant.contact || "No contact information provided."}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
                <Button 
                  variant="outline"
                  className="flex items-center w-full sm:w-auto border-white/30 bg-white/10 backdrop-blur-sm"
                  onClick={() => navigate('/edit-profile')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center w-full sm:w-auto border-white/30 bg-white/10 backdrop-blur-sm"
                  onClick={() => navigate(`/menu/${restaurant.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Menu
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-primary/80 hover:bg-primary backdrop-blur-sm"
                  onClick={() => navigate('/menu-builder')}
                >
                  Edit Menu
                </Button>
                <Button 
                  className="w-full border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20" 
                  variant="outline"
                  onClick={() => navigate('/qr-code')}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Complete your restaurant profile</li>
                  <li>Create menu sections for different categories</li>
                  <li>Add menu items with descriptions and prices</li>
                  <li>Generate a QR code for your customers</li>
                  <li>Set your menu as public when ready</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 glass-card p-10">
          <h2 className="text-2xl font-semibold">Restaurant Not Found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find your restaurant information. Please complete your profile.
          </p>
          <Button 
            className="mt-4 bg-primary/80 hover:bg-primary backdrop-blur-sm"
            onClick={() => navigate('/edit-profile')}
          >
            Create Restaurant Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
