
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
};

export type MenuSection = {
  id: string;
  name: string;
  items: MenuItem[];
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
};

export type RestaurantSummary = {
  id: string;
  name: string;
  location: string;
  isPublic: boolean;
  isBlocked: boolean;
};
