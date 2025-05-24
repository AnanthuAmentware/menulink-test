import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, doc, getDoc, updateDoc } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
};

export type FontSettings = {
  headingFont: string;
  bodyFont: string;
};

export type RestaurantTheme = {
  name: string;
  colors: ColorScheme;
  fonts: FontSettings;
  borderRadius: string;
  isDark: boolean;
  currencySymbol: string;
};

// Default theme presets with currency symbol
export const themePresets = {
  default: {
    name: "Default",
    colors: {
      primary: "#8B2635",
      secondary: "#F5F5DC",
      accent: "#D4AF37",
      background: "#FFFFFF",
      text: "#2D2D2D",
      heading: "#8B2635"
    },
    fonts: {
      headingFont: "Playfair Display",
      bodyFont: "Lato"
    },
    borderRadius: "0.5rem",
    isDark: false,
    currencySymbol: "₹"
  },
  dark: {
    name: "Dark Elegance",
    colors: {
      primary: "#D4AF37",
      secondary: "#2D2D2D",
      accent: "#8B2635",
      background: "#1A1A1A",
      text: "#FFFFFF",
      heading: "#D4AF37"
    },
    fonts: {
      headingFont: "Playfair Display",
      bodyFont: "Lato"
    },
    borderRadius: "0.5rem",
    isDark: true,
    currencySymbol: "₹"
  },
  modern: {
    name: "Modern",
    colors: {
      primary: "#3498DB",
      secondary: "#ECF0F1",
      accent: "#2ECC71",
      background: "#FFFFFF",
      text: "#2C3E50",
      heading: "#2980B9"
    },
    fonts: {
      headingFont: "Montserrat",
      bodyFont: "Open Sans"
    },
    borderRadius: "0.75rem",
    isDark: false,
    currencySymbol: "₹"
  },
  rustic: {
    name: "Rustic",
    colors: {
      primary: "#5D4037",
      secondary: "#EFEBE9",
      accent: "#8D6E63",
      background: "#FBF8F6",
      text: "#3E2723",
      heading: "#5D4037"
    },
    fonts: {
      headingFont: "Merriweather",
      bodyFont: "Roboto"
    },
    borderRadius: "0.25rem",
    isDark: false,
    currencySymbol: "₹"
  },
  elegant: {
    name: "Elegant",
    colors: {
      primary: "#4A148C",
      secondary: "#F3E5F5",
      accent: "#AA00FF",
      background: "#FFFFFF",
      text: "#212121",
      heading: "#4A148C"
    },
    fonts: {
      headingFont: "Playfair Display",
      bodyFont: "Lato"
    },
    borderRadius: "0.5rem",
    isDark: false,
    currencySymbol: "₹"
  },
  bistro: {
    name: "Bistro",
    colors: {
      primary: "#B71C1C",
      secondary: "#FFEBEE",
      accent: "#FF8A80",
      background: "#FFF8E1",
      text: "#3E2723",
      heading: "#B71C1C"
    },
    fonts: {
      headingFont: "Oswald",
      bodyFont: "Source Sans Pro"
    },
    borderRadius: "0.25rem",
    isDark: false,
    currencySymbol: "₹"
  }
};

interface ThemeContextProps {
  theme: RestaurantTheme;
  themeLoading: boolean;
  setTheme: (theme: RestaurantTheme) => Promise<void>;
  resetToDefaultTheme: () => Promise<void>;
  availablePresets: typeof themePresets;
  applyPreset: (presetName: keyof typeof themePresets) => Promise<void>;
  getCssVariable: (name: string) => string;
  loadThemeForRestaurant: (restaurantId: string) => Promise<RestaurantTheme | null>;
  setCurrencySymbol: (symbol: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: themePresets.default,
  themeLoading: true,
  setTheme: async () => {},
  resetToDefaultTheme: async () => {},
  availablePresets: themePresets,
  applyPreset: async () => {},
  getCssVariable: () => '',
  loadThemeForRestaurant: async () => null,
  setCurrencySymbol: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<RestaurantTheme>(themePresets.default);
  const [themeLoading, setThemeLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load theme on auth change
  useEffect(() => {
    const loadTheme = async () => {
      if (currentUser) {
        try {
          const restaurantDoc = doc(db, "restaurants", currentUser.uid);
          const restaurantSnap = await getDoc(restaurantDoc);
          
          if (restaurantSnap.exists() && restaurantSnap.data().theme) {
            const loadedTheme = restaurantSnap.data().theme;
            // Ensure currency symbol exists
            if (!loadedTheme.currencySymbol) {
              loadedTheme.currencySymbol = "₹";
            }
            setThemeState(loadedTheme);
          } else {
            // Use default theme if no theme is saved
            setThemeState(themePresets.default);
          }
        } catch (error) {
          console.error("Error loading theme:", error);
          toast({
            title: "Error loading theme",
            description: "Failed to load your restaurant theme. Using default theme instead.",
            variant: "destructive",
          });
          setThemeState(themePresets.default);
        }
      } else {
        // Use default theme if not authenticated
        setThemeState(themePresets.default);
      }
      setThemeLoading(false);
    };

    loadTheme();
  }, [currentUser, toast]);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS variables based on theme
    const setThemeVariable = (name: string, value: string) => {
      root.style.setProperty(`--${name}`, value);
    };

    // Reset all theme-related variables first
    // Colors
    setThemeVariable('primary', theme.colors.primary);
    setThemeVariable('secondary', theme.colors.secondary);
    setThemeVariable('accent', theme.colors.accent);
    setThemeVariable('background', theme.colors.background);
    setThemeVariable('text', theme.colors.text);
    setThemeVariable('heading', theme.colors.heading);

    // Fonts
    setThemeVariable('heading-font', theme.fonts.headingFont);
    setThemeVariable('body-font', theme.fonts.bodyFont);

    // Other theme properties
    setThemeVariable('border-radius', theme.borderRadius);
    setThemeVariable('currency-symbol', theme.currencySymbol);

    // Set restaurant-specific colors
    setThemeVariable('restaurant-burgundy', theme.colors.primary);
    setThemeVariable('restaurant-cream', theme.colors.secondary);
    setThemeVariable('restaurant-gold', theme.colors.accent);
    setThemeVariable('restaurant-dark', theme.colors.text);
    setThemeVariable('restaurant-light', theme.colors.background);

    // Set data-theme attribute for dark mode
    document.documentElement.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
    
  }, [theme]);

  const setTheme = async (newTheme: RestaurantTheme) => {
    if (!currentUser) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to save theme changes",
        variant: "destructive",
      });
      return;
    }

    try {
      // Preserve currency symbol from current theme if not specified in new theme
      if (!newTheme.currencySymbol && theme.currencySymbol) {
        newTheme.currencySymbol = theme.currencySymbol;
      }
      
      // Update local state first for immediate feedback
      setThemeState(newTheme);
      
      // Save theme to database
      const restaurantRef = doc(db, "restaurants", currentUser.uid);
      await updateDoc(restaurantRef, { 
        theme: newTheme,
        // Ensure these fields exist for restaurant viewing
        isPublic: true,  // Force this to be true to ensure the menu is viewable
        name: (await getDoc(restaurantRef)).data()?.name || "My Restaurant"
      });
      
      toast({
        title: "Theme updated",
        description: "Your restaurant theme has been updated successfully",
      });
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error saving theme",
        description: "Failed to save your restaurant theme",
        variant: "destructive",
      });
    }
  };

  const resetToDefaultTheme = async () => {
    await setTheme(themePresets.default);
  };

  const applyPreset = async (presetName: keyof typeof themePresets) => {
    const preset = themePresets[presetName];
    if (preset) {
      // Preserve currency symbol when applying preset
      const updatedPreset = {
        ...preset,
        currencySymbol: theme.currencySymbol || preset.currencySymbol || "₹"
      };
      await setTheme(updatedPreset);
    }
  };

  const setCurrencySymbol = async (symbol: string) => {
    if (!currentUser) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to save theme changes",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTheme = {
        ...theme,
        currencySymbol: symbol
      };
      
      // Update local state first for immediate feedback
      setThemeState(updatedTheme);
      
      // Save updated theme to database
      const restaurantRef = doc(db, "restaurants", currentUser.uid);
      await updateDoc(restaurantRef, { theme: updatedTheme });
      
      toast({
        title: "Currency updated",
        description: `Currency symbol set to ${symbol}`,
      });
    } catch (error) {
      console.error("Error saving currency symbol:", error);
      toast({
        title: "Error saving currency",
        description: "Failed to update currency symbol",
        variant: "destructive",
      });
    }
  };

  const getCssVariable = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  };

  // Function to load theme for public menu viewing
  const loadThemeForRestaurant = async (restaurantId: string): Promise<RestaurantTheme | null> => {
    try {
      const restaurantDoc = doc(db, "restaurants", restaurantId);
      const restaurantSnap = await getDoc(restaurantDoc);
      
      if (restaurantSnap.exists() && restaurantSnap.data().theme) {
        const restaurantTheme = restaurantSnap.data().theme as RestaurantTheme;
        
        // Ensure the theme has a currency symbol
        if (!restaurantTheme.currencySymbol) {
          restaurantTheme.currencySymbol = "₹";
        }
        
        // Apply theme immediately for menu view
        setThemeState(restaurantTheme);
        return restaurantTheme;
      }
      return themePresets.default;
    } catch (error) {
      console.error("Error loading restaurant theme:", error);
      return null;
    }
  };

  const value = {
    theme,
    themeLoading,
    setTheme,
    resetToDefaultTheme,
    availablePresets: themePresets,
    applyPreset,
    getCssVariable,
    loadThemeForRestaurant,
    setCurrencySymbol,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
