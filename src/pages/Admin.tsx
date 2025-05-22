
import { useEffect, useState } from 'react';
import { db, collection, getDocs, doc, updateDoc } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RestaurantSummary } from '@/types';
import { Label } from '@/components/ui/label';
import { Edit, ExternalLink, Search, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
      const restaurantsList = restaurantsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          location: data.location || '',
          isPublic: data.isPublic || false,
          isBlocked: data.isBlocked || false
        } as RestaurantSummary;
      });
      
      setRestaurants(restaurantsList);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublicStatus = async (restaurantId: string, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [`public_${restaurantId}`]: true }));
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        isPublic: !currentStatus
      });
      
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, isPublic: !currentStatus } 
            : restaurant
        )
      );
      
      toast({
        title: 'Success',
        description: `Restaurant is now ${!currentStatus ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`public_${restaurantId}`]: false }));
    }
  };

  const toggleBlockedStatus = async (restaurantId: string, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [`blocked_${restaurantId}`]: true }));
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        isBlocked: !currentStatus
      });
      
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, isBlocked: !currentStatus } 
            : restaurant
        )
      );
      
      toast({
        title: 'Success',
        description: `Restaurant is now ${!currentStatus ? 'blocked' : 'unblocked'}`,
      });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`blocked_${restaurantId}`]: false }));
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <h1 className="text-4xl font-bold font-display mb-8 text-restaurant-burgundy">Admin Panel</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Restaurant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              onClick={fetchRestaurants} 
              variant="outline"
              className="flex items-center"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-restaurant-burgundy" />
          <p className="mt-4">Loading restaurants...</p>
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-restaurant-burgundy/30">
                <th className="text-left p-3 font-display">Name</th>
                <th className="text-left p-3 font-display">Location</th>
                <th className="text-left p-3 font-display">Public</th>
                <th className="text-left p-3 font-display">Blocked</th>
                <th className="text-left p-3 font-display">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map(restaurant => (
                <tr key={restaurant.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-medium">{restaurant.name}</td>
                  <td className="p-3">{restaurant.location || '—'}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Switch
                        checked={restaurant.isPublic}
                        onCheckedChange={() => togglePublicStatus(restaurant.id, restaurant.isPublic)}
                        disabled={actionLoading[`public_${restaurant.id}`]}
                      />
                      <Label className="ml-2">
                        {restaurant.isPublic ? 'Yes' : 'No'}
                      </Label>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Switch
                        checked={restaurant.isBlocked}
                        onCheckedChange={() => toggleBlockedStatus(restaurant.id, restaurant.isBlocked)}
                        disabled={actionLoading[`blocked_${restaurant.id}`]}
                      />
                      <Label className="ml-2">
                        {restaurant.isBlocked ? 'Yes' : 'No'}
                      </Label>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/edit/${restaurant.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/menu/${restaurant.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No restaurants found</h2>
          {searchTerm ? (
            <p>No restaurants match your search criteria</p>
          ) : (
            <p>There are no restaurants in the system yet</p>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-restaurant-cream/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Restaurants</p>
                <p className="text-2xl font-bold text-restaurant-burgundy">{restaurants.length}</p>
              </div>
              <div className="bg-restaurant-cream/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Public Menus</p>
                <p className="text-2xl font-bold text-restaurant-burgundy">
                  {restaurants.filter(r => r.isPublic).length}
                </p>
              </div>
              <div className="bg-restaurant-cream/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Blocked Restaurants</p>
                <p className="text-2xl font-bold text-restaurant-burgundy">
                  {restaurants.filter(r => r.isBlocked).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
