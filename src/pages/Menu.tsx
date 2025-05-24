
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Restaurant } from '@/types';
import { Phone, MapPin, RefreshCcw, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Menu = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Get the restaurant document
        const restaurantDoc = doc(db, 'restaurants', restaurantId);
        const restaurantSnap = await getDoc(restaurantDoc);

        if (!restaurantSnap.exists()) {
          console.error("Restaurant not found:", restaurantId);
          setError("Restaurant not found");
          setLoading(false);
          return;
        }

        const restaurantData = { 
          id: restaurantSnap.id, 
          ...restaurantSnap.data() 
        } as Restaurant;
        
        // Check if the restaurant is private
        if (restaurantData.isPublic === false) {
          console.error("Restaurant is private:", restaurantId);
          setError("This menu is private");
          setLoading(false);
          return;
        }
        
        console.log("Restaurant data loaded:", restaurantData);

        setRestaurant(restaurantData);

        // Apply theme variables
        const root = document.documentElement;
        if (restaurantData.theme) {
          // Colors
          root.style.setProperty('--restaurant-burgundy', restaurantData.theme.colors.primary);
          root.style.setProperty('--restaurant-cream', restaurantData.theme.colors.secondary);
          root.style.setProperty('--restaurant-gold', restaurantData.theme.colors.accent);
          root.style.setProperty('--restaurant-dark', restaurantData.theme.colors.text);
          root.style.setProperty('--restaurant-light', restaurantData.theme.colors.background);
          
          // Currency symbol
          if (restaurantData.theme.currencySymbol) {
            root.style.setProperty('--currency-symbol', `"${restaurantData.theme.currencySymbol}"`);
          } else {
            root.style.setProperty('--currency-symbol', '"₹"'); // Default to Rupees
          }
        }

      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurantId]);

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
        <Card className="w-full max-w-md text-center p-8 glass-card">
          <h2 className="text-2xl font-bold font-display mb-4 text-restaurant-burgundy">Menu Unavailable</h2>
          <p className="text-gray-600 mb-6">{error || "Menu could not be loaded"}</p>
          {error === "This menu is private" && (
            <div className="flex flex-col items-center justify-center gap-2">
              <Lock className="h-10 w-10 text-gray-500" />
              <p className="text-gray-500">The restaurant owner has set this menu to private.</p>
            </div>
          )}
          <pre className="text-sm text-gray-500 whitespace-pre-wrap">
            Restaurant ID: {restaurantId || 'Not provided'}
          </pre>
        </Card>
      </div>
    );
  }

  // Filter out disabled sections
  const visibleSections = restaurant?.menuSections?.filter(section => !section.isDisabled) || [];
  
  // Get currency symbol from theme or use default
  const currencySymbol = restaurant?.theme?.currencySymbol || '₹';

  return (
    <div className="min-h-screen bg-restaurant-cream/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Restaurant Header */}
        <div className="glass-card shadow-lg rounded-lg p-6 mb-8 border-t-4" style={{borderTopColor: 'var(--restaurant-burgundy)'}}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2 text-restaurant-burgundy">
            {restaurant.name}
          </h1>
          
          <div className="flex flex-wrap gap-2 text-sm mb-4 text-restaurant-dark">
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
            <p className="text-restaurant-dark">
              {restaurant.description}
            </p>
          )}
        </div>

        {/* Menu Sections */}
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => (
            <div key={section.id} className="menu-section mb-8">
              <h2 className="text-2xl font-bold section-header mb-4 text-restaurant-burgundy">
                {section.name}
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {section.items && section.items.length > 0 ? (
                  // Filter out disabled items
                  section.items
                    .filter(item => !item.isDisabled)
                    .map((item) => (
                    <Card 
                      key={item.id} 
                      className="menu-item-card overflow-hidden glass-card"
                    >
                      <CardContent className="p-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-restaurant-dark">
                                {item.name}
                                {item.outOfStock && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                    Out of Stock
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm mt-1 text-restaurant-dark">
                                {item.description}
                              </p>
                            </div>
                            <div className="font-bold text-restaurant-burgundy">
                              {item.priceVariations && item.priceVariations.length > 0 ? (
                                <span>{currencySymbol}{item.priceVariations[0].price.toFixed(2)}</span>
                              ) : (
                                <span>{currencySymbol}{item.price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Display price variations if available */}
                          {item.priceVariations && item.priceVariations.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.priceVariations.map((variation, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-restaurant-dark">{variation.name}</span>
                                  <span className="font-medium text-restaurant-burgundy">
                                    {currencySymbol}{variation.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Only show image if imageUrl exists and is not empty */}
                          {item.imageUrl && item.imageUrl.trim() !== '' && (
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
                  ))
                ) : (
                  <p className="text-center py-4 italic glass-card p-6 col-span-2 text-restaurant-dark">
                    No items in this section
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-card rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2 text-restaurant-burgundy">
              Menu Coming Soon
            </h2>
            <p className="text-restaurant-dark">
              This restaurant is still setting up their digital menu.
            </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm mt-12 mb-6 text-restaurant-dark">
          <p>Menu powered by MenuBuilder</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
