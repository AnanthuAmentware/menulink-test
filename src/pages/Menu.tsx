import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '@/lib/firebase';
import { Restaurant, MenuSection } from '@/types';
import { useQRTracking } from '@/hooks/useQRTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MapPin, Phone, Globe, Star } from 'lucide-react';

const Menu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackQRScan } = useQRTracking();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setError('Restaurant ID not provided');
        setLoading(false);
        return;
      }

      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as Restaurant;
          const restaurantData = { id: restaurantDoc.id, ...data };
          
          // Check if menu is private
          if (!restaurantData.isPublic) {
            setError('This menu is private and not available for public viewing');
            setLoading(false);
            return;
          }
          
          setRestaurant(restaurantData);
          
          // Only track QR scan if user is not the owner
          if (!currentUser || currentUser.uid !== restaurantData.ownerId) {
            await trackQRScan(restaurantId);
          }
        } else {
          setError('Restaurant not found');
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, trackQRScan, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Available</h1>
          <p className="text-gray-600">{error || 'The requested menu could not be found.'}</p>
        </div>
      </div>
    );
  }

  const currencySymbol = "₹"; // Default currency symbol
  const primaryColor = "#8B2635"; // Default primary color
  const secondaryColor = "#F5F5F5"; // Default secondary color
  const accentColor = "#FFD700"; // Default accent color
  const textColor = "#333333"; // Default text color
  const backgroundColor = "#FFFFFF"; // Default background color

  const menuSections = restaurant.menuSections || [];
  const activeMenuSections = menuSections.filter((section: MenuSection) => !section.isDisabled);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor 
      }}
    >
      {/* Header */}
      <div 
        className="relative py-12 px-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl mx-auto">
              {restaurant.description}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {restaurant.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.location}</span>
              </div>
            )}
            {restaurant.contact && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant.contact}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeMenuSections.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Menu Coming Soon</h2>
            <p className="text-gray-600">We're working on our menu. Please check back later!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {activeMenuSections.map((section: MenuSection) => {
              const activeItems = section.items.filter(item => !item.isDisabled);
              
              if (activeItems.length === 0) return null;
              
              return (
                <div key={section.id} className="mb-12">
                  <h2 
                    className="text-3xl font-bold mb-8 pb-3 border-b-2"
                    style={{ 
                      color: primaryColor,
                      borderColor: accentColor 
                    }}
                  >
                    {section.name}
                  </h2>
                  
                  <div className="grid gap-4">
                    {activeItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              {item.imageUrl && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                                    {item.name}
                                  </h3>
                                  {item.outOfStock && (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                                
                                {item.description && (
                                  <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                                
                                {item.priceVariations && item.priceVariations.length > 0 ? (
                                  <div className="space-y-1">
                                    {item.priceVariations.map((variation, index) => (
                                      <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{variation.name}</span>
                                        <span 
                                          className="font-semibold"
                                          style={{ color: primaryColor }}
                                        >
                                          {currencySymbol}{variation.price.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  item.price && item.price > 0 && (
                                    <div className="text-right">
                                      <span 
                                        className="text-xl font-bold"
                                        style={{ color: primaryColor }}
                                      >
                                        {currencySymbol}{item.price.toFixed(2)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="text-center py-8 mt-16"
        style={{ backgroundColor: secondaryColor }}
      >
        <p className="text-gray-600">
          Powered by MenuBuilder
        </p>
      </div>
    </div>
  );
};

export default Menu;
