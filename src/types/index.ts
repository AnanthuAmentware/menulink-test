
export type PriceVariation = {
  name: string;  // e.g., "Quarter", "Half", "Full"
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isDisabled?: boolean;
  outOfStock?: boolean;
  priceVariations?: PriceVariation[];
};

export type MenuSection = {
  id: string;
  name: string;
  items: MenuItem[];
  isDisabled?: boolean;
};

export type Restaurant = {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  contact: string;
  description: string;
  email: string;
  isPublic: boolean;
  isBlocked: boolean;
  createdAt: any; // Timestamp
  menuSections: MenuSection[];
  theme?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
    };
    currencySymbol?: string;
  };
};

export type RestaurantSummary = {
  id: string;
  name: string;
  location: string;
  isPublic: boolean;
  isBlocked: boolean;
};
