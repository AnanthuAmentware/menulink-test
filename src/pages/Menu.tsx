
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Restaurant } from '@/types';
import { Phone, MapPin, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Menu = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing");
        setLoading(false);
        return;
      }

      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));

        if (!restaurantDoc.exists()) {
          setError("Restaurant not found");
          setLoading(false);
          return;
        }

        const restaurantData = { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;

        // Check if restaurant is public and not blocked
        if (!restaurantData.isPublic) {
          setError("This menu is currently private");
          setLoading(false);
          return;
        }

        if (restaurantData.isBlocked) {
          setError("This menu is not available");
          setLoading(false);
          return;
        }

        setRestaurant(restaurantData);
      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurantId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-restaurant-cream/10">
        <div className="text-center">
          <RefreshCcw className="h-10 w-10 mx-auto animate-spin text-restaurant-burgundy" />
          <p className="mt-4 text-xl">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-restaurant-cream/10">
        <Card className="w-full max-w-md text-center p-8">
          <h2 className="text-2xl font-bold font-display mb-4 text-restaurant-burgundy">Menu Unavailable</h2>
          <p className="text-gray-600 mb-6">{error || "Menu could not be loaded"}</p>
          <p className="text-sm text-gray-500">Please contact the restaurant for more information</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-restaurant-cream/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Restaurant Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-t-4 border-restaurant-burgundy">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-restaurant-burgundy mb-2">{restaurant.name}</h1>
          
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
            {restaurant.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{restaurant.location}</span>
              </div>
            )}
            {restaurant.contact && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>{restaurant.contact}</span>
              </div>
            )}
          </div>
          
          {restaurant.description && (
            <p className="text-gray-700">{restaurant.description}</p>
          )}
        </div>

        {/* Menu Sections */}
        {restaurant.menuSections && restaurant.menuSections.length > 0 ? (
          restaurant.menuSections.map((section) => (
            <div key={section.id} className="menu-section mb-8">
              <h2 className="text-2xl font-bold font-display section-header">{section.name}</h2>
              
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {section.items.map((item) => (
                  <Card key={item.id} className="menu-item-card overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          </div>
                          <div className="text-restaurant-burgundy font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                        
                        {item.imageUrl && (
                          <div className="mt-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="rounded-md w-full h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {section.items.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">No items in this section</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold font-display mb-2">Menu Coming Soon</h2>
            <p className="text-gray-600">
              This restaurant is still setting up their digital menu.
            </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-12 mb-6">
          <p>Menu powered by MenuBuilder</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
