import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../lib/firebase';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw } from 'lucide-react';

interface RestaurantData {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  menuSections: any[];
  currencySymbol?: string; // Make currency configurable
  [key: string]: any;
}

const Menu = () => {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setError('Restaurant ID is missing');
        setLoading(false);
        return;
      }

      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as RestaurantData;
          
          if (!data.isPublic) {
            setError('This menu is not available to the public');
            setLoading(false);
            return;
          }
          
          // Load restaurant theme if available
          if (data.theme) {
            // Apply the restaurant's theme
            const { loadThemeForRestaurant } = useTheme();
            await loadThemeForRestaurant(restaurantId);
          }
          
          setRestaurant({ id: restaurantDoc.id, ...data });
        } else {
          setError('Restaurant not found');
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get currency symbol from restaurant data or theme, defaulting to $
  const currencySymbol = restaurant?.currencySymbol || theme?.currencySymbol || '$';

  return (
    <div className="min-h-screen">
      {/* Restaurant Header */}
      <div 
        className="bg-primary/80 text-white py-8 px-4 text-center"
        style={{ 
          backgroundColor: theme ? `hsla(${theme.colors.primary}, 0.8)` : undefined,
          color: theme ? theme.colors.text : undefined
        }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: theme ? theme.fonts.headingFont : undefined }}>
          {restaurant?.name}
        </h1>
        {restaurant?.description && (
          <p className="max-w-2xl mx-auto opacity-90" style={{ fontFamily: theme ? theme.fonts.bodyFont : undefined }}>
            {restaurant.description}
          </p>
        )}
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {restaurant?.menuSections?.length > 0 ? (
          restaurant.menuSections.map((section: any) => (
            <div key={section.id} className="mb-10">
              <h2 
                className="text-2xl font-bold mb-4 pb-2 border-b"
                style={{ 
                  color: theme ? theme.colors.heading : undefined,
                  fontFamily: theme ? theme.fonts.headingFont : undefined,
                  borderColor: theme ? `hsla(${theme.colors.primary}, 0.3)` : undefined
                }}
              >
                {section.name}
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {section.items?.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                    style={{ 
                      borderRadius: theme ? theme.borderRadius : undefined,
                      backgroundColor: theme ? theme.colors.background : undefined,
                    }}
                  >
                    <div className="flex p-4">
                      {item.imageUrl && (
                        <div className="flex-shrink-0 mr-4">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded"
                            style={{ borderRadius: theme ? theme.borderRadius : undefined }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 
                            className="text-lg font-semibold"
                            style={{ 
                              color: theme ? theme.colors.heading : undefined,
                              fontFamily: theme ? theme.fonts.headingFont : undefined
                            }}
                          >
                            {item.name}
                          </h3>
                          <span 
                            className="font-bold"
                            style={{ color: theme ? theme.colors.primary : undefined }}
                          >
                            {currencySymbol}{item.price.toFixed(2)}
                          </span>
                        </div>
                        {item.description && (
                          <p 
                            className="text-sm"
                            style={{ 
                              color: theme ? theme.colors.text : undefined,
                              fontFamily: theme ? theme.fonts.bodyFont : undefined
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">This menu has no items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
