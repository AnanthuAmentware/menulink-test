
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/types';
import { Edit, Eye, QrCode, RefreshCcw, Menu as MenuIcon, Users, BarChart3, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StatsCard from '@/components/StatsCard';
import MenuItemsChart from '@/components/MenuItemsChart';
import QRScanChart from '@/components/QRScanChart';

const Dashboard = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
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

  const sectionsCount = restaurant?.menuSections?.length || 0;
  const totalViews = restaurant?.viewCount || 0;
  const isPublic = restaurant?.isPublic || false;

  // Create chart data for menu sections
  const chartData = restaurant?.menuSections?.map(section => ({
    name: section.name.length > 10 ? section.name.substring(0, 10) + '...' : section.name,
    items: section.items?.length || 0
  })) || [];

  // Generate QR scan data from restaurant's dailyViews
  const generateQRScanData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Use real data from restaurant.dailyViews if available
      const scans = restaurant?.dailyViews?.[dateString] || 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: scans
      });
    }
    
    return data;
  };

  const qrScanData = generateQRScanData();

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading your restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-display text-black">Restaurant Dashboard</h1>
        <Button 
          className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          onClick={() => navigate('/menu-builder')}
        >
          <MenuIcon className="h-4 w-4" />
          Edit Menu
        </Button>
      </div>
      
      {restaurant ? (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Menu Sections"
              value={sectionsCount}
              description="Active menu categories"
              icon={BarChart3}
            />
            <StatsCard
              title="Menu Items"
              value={menuItemsCount}
              description="Total items in menu"
              icon={MenuIcon}
            />
            <StatsCard
              title="Status"
              value={isPublic ? "Public" : "Private"}
              description="Menu visibility"
              icon={Eye}
            />
            <StatsCard
              title="Total Views"
              value={totalViews}
              description="Menu views"
              icon={QrCode}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Restaurant Info Card */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl flex items-center gap-2 text-black">
                    <Users className="h-6 w-6" />
                    {restaurant.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {restaurant.location || "No location set"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-gray-600">Description</p>
                      <p className="text-sm text-black">
                        {restaurant.description || "No description available."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-gray-600">Contact</p>
                      <p className="text-sm text-black">
                        {restaurant.contact || "No contact information provided."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isPublic 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {isPublic ? "✓ Public Menu" : "⏸ Private Menu"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {menuItemsCount} Items
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {sectionsCount} Sections
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
                  <Button 
                    variant="outline"
                    className="flex items-center w-full sm:w-auto border-gray-300 bg-white hover:bg-gray-50 text-black gap-2"
                    onClick={() => navigate('/edit-profile')}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center w-full sm:w-auto border-gray-300 bg-white hover:bg-gray-50 text-black gap-2"
                    onClick={() => navigate(`/menu/${restaurant.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview Menu
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Star className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800 flex items-center gap-2"
                    onClick={() => navigate('/menu-builder')}
                  >
                    <MenuIcon className="h-4 w-4" />
                    Edit Menu
                  </Button>
                  <Button 
                    className="w-full border-gray-300 bg-white hover:bg-gray-50 text-black flex items-center gap-2" 
                    variant="outline"
                    onClick={() => navigate('/qr-code')}
                  >
                    <QrCode className="h-4 w-4" />
                    Generate QR Code
                  </Button>
                  <Button 
                    className="w-full border-gray-300 bg-white hover:bg-gray-50 text-black flex items-center gap-2" 
                    variant="outline"
                    onClick={() => navigate('/edit-profile')}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-black">
                    <li>Complete your restaurant profile</li>
                    <li>Create menu sections for categories</li>
                    <li>Add items with descriptions & prices</li>
                    <li>Generate QR code for customers</li>
                    <li>Set menu as public when ready</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chart Section - Half size and side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData.length > 0 && (
              <div className="h-[300px]">
                <MenuItemsChart data={chartData} />
              </div>
            )}
            <div className="h-[300px]">
              <QRScanChart data={qrScanData} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg p-10">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-black">Restaurant Not Found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find your restaurant information. Please complete your profile.
          </p>
          <Button 
            className="mt-4 bg-black text-white hover:bg-gray-800 flex items-center gap-2 mx-auto"
            onClick={() => navigate('/edit-profile')}
          >
            <Edit className="h-4 w-4" />
            Create Restaurant Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
