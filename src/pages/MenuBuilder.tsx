
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, getDoc, updateDoc } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuSection, MenuItem, PriceVariation } from "@/types";
import { Plus, Trash2, MoveVertical, Save, Edit, RefreshCcw, AlertCircle, XCircle, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIsMobile } from "@/hooks/use-mobile";

// Component for a draggable menu item
const SortableMenuItem = ({ 
  item, 
  onEdit, 
  onDelete,
  onStatusChange,
  currencySymbol
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void; 
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  currencySymbol: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const isMobile = useIsMobile();
  
  const getItemStatus = (): 'active' | 'disabled' | 'outOfStock' => {
    if (item.isDisabled) return 'disabled';
    if (item.outOfStock) return 'outOfStock';
    return 'active';
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`glass-card mb-2 p-3 flex items-center justify-between ${item.isDisabled ? 'opacity-50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div className="font-medium truncate flex items-center gap-2">
            {item.name}
            {item.outOfStock && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">Out of Stock</span>
            )}
            {item.isDisabled && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">Disabled</span>
            )}
          </div>
          <div className="text-primary font-bold">
            {item.priceVariations && item.priceVariations.length > 0 ? (
              <span>{`${currencySymbol}${item.priceVariations[0].price.toFixed(2)}+`}</span>
            ) : (
              item.price ? <span>{currencySymbol}{item.price.toFixed(2)}</span> : <span>-</span>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-400 truncate">{item.description}</div>
      </div>
      
      <div className={`flex items-center ml-4 ${isMobile ? 'flex-col gap-1' : 'space-x-2'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost"
              className="hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onStatusChange(item.id, 'active')}
              className={getItemStatus() === 'active' ? 'bg-primary/10 font-medium' : ''}
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusChange(item.id, 'outOfStock')}
              className={getItemStatus() === 'outOfStock' ? 'bg-primary/10 font-medium' : ''}
            >
              Out of Stock
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusChange(item.id, 'disabled')}
              className={getItemStatus() === 'disabled' ? 'bg-primary/10 font-medium' : ''}
            >
              Disabled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="hover:bg-white/10">
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)} className="hover:bg-white/10">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
        <div {...listeners} className="cursor-move p-1">
          <MoveVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// Component for a draggable menu section
const SortableMenuSection = ({ 
  section,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onToggleSectionDisabled,
  onItemsReorder,
  currencySymbol
}: { 
  section: MenuSection;
  onEdit: (section: MenuSection) => void;
  onDelete: (id: string) => void;
  onAddItem: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: MenuItem) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onStatusChange: (sectionId: string, itemId: string, status: 'active' | 'disabled' | 'outOfStock') => void;
  onToggleSectionDisabled: (sectionId: string, disabled: boolean) => void;
  onItemsReorder: (sectionId: string, items: MenuItem[]) => void;
  currencySymbol: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = section.items.findIndex(item => item.id === active.id);
      const newIndex = section.items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(section.items, oldIndex, newIndex);
      onItemsReorder(section.id, newItems);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`menu-section glass-card mb-6 last:mb-0 border-l-4 ${section.isDisabled ? 'border-gray-400 opacity-75' : 'border-primary/50'}`}
    >
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start md:items-center mb-4`}>
        <div className="flex items-center mb-2 md:mb-0">
          <h3 className="text-xl font-bold">{section.name}</h3>
          {section.isDisabled && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">Disabled</span>
          )}
          <div {...listeners} className="cursor-move p-1 ml-2">
            <MoveVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <Label htmlFor={`section-disabled-${section.id}`} className="mr-2">Disabled</Label>
            <Switch 
              id={`section-disabled-${section.id}`} 
              checked={section.isDisabled || false}
              onCheckedChange={(checked) => onToggleSectionDisabled(section.id, checked)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(section)}
            className="border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddItem(section.id)}
            className="border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(section.id)}
            className="border-red-400/30 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={section.items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {section.items.length > 0 ? (
              section.items.map(item => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onEdit={(item) => onEditItem(section.id, item)}
                  onDelete={(itemId) => onDeleteItem(section.id, itemId)}
                  onStatusChange={(itemId, status) => onStatusChange(section.id, itemId, status)}
                  currencySymbol={currencySymbol}
                />
              ))
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md bg-white/5 backdrop-blur-sm">
                <p className="text-gray-400">No items in this section</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-primary"
                  onClick={() => onAddItem(section.id)}
                >
                  Add Item
                </Button>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

// Main MenuBuilder component
const MenuBuilder = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuChanged, setMenuChanged] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  
  // Dialog states
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<MenuSection | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

  // Form states
  const [sectionName, setSectionName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemIsDisabled, setItemIsDisabled] = useState(false);
  const [itemOutOfStock, setItemOutOfStock] = useState(false);
  const [priceVariations, setPriceVariations] = useState<PriceVariation[]>([]);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRestaurantData();
  }, [currentUser]);

  const fetchRestaurantData = async () => {
    if (!currentUser) return;
    
    try {
      const restaurantDoc = await getDoc(doc(db, 'restaurants', currentUser.uid));
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        setRestaurant({ id: restaurantDoc.id, ...data });
        setMenuSections(data.menuSections || []);
        
        // Set currency symbol from restaurant data
        if (data.theme && data.theme.currencySymbol) {
          setCurrencySymbol(data.theme.currencySymbol);
        }
      } else {
        toast({
          title: "Restaurant not found",
          description: "Please complete your restaurant profile first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      toast({
        title: "Error loading menu data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    
    try {
      await updateDoc(doc(db, 'restaurants', currentUser.uid), {
        menuSections
      });
      
      toast({
        title: "Menu saved successfully",
        description: "Your menu changes have been published.",
      });
      
      setMenuChanged(false);
    } catch (error) {
      console.error("Error saving menu:", error);
      toast({
        title: "Error saving menu",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Section handlers
  const openAddSectionDialog = () => {
    setSectionName("");
    setCurrentSection(null);
    setSectionDialogOpen(true);
  };

  const openEditSectionDialog = (section: MenuSection) => {
    setCurrentSection(section);
    setSectionName(section.name);
    setSectionDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (!sectionName.trim()) {
      toast({
        title: "Section name required",
        description: "Please enter a name for this section.",
        variant: "destructive",
      });
      return;
    }

    if (currentSection) {
      // Edit existing section
      const updatedSections = menuSections.map(section =>
        section.id === currentSection.id
          ? { ...section, name: sectionName }
          : section
      );
      
      setMenuSections(updatedSections);
      toast({
        title: "Section updated",
        description: `"${sectionName}" has been updated.`,
      });
    } else {
      // Add new section
      const newSection: MenuSection = {
        id: uuidv4(),
        name: sectionName,
        items: [],
        isDisabled: false
      };
      
      setMenuSections([...menuSections, newSection]);
      toast({
        title: "Section added",
        description: `"${sectionName}" has been added to your menu.`,
      });
    }
    
    setSectionDialogOpen(false);
    setMenuChanged(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this section and all its items?")) {
      const updatedSections = menuSections.filter(section => section.id !== sectionId);
      setMenuSections(updatedSections);
      setMenuChanged(true);
      
      toast({
        title: "Section deleted",
        description: "The section has been removed from your menu.",
      });
    }
  };

  // Item handlers
  const openAddItemDialog = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentItem(null);
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemImageUrl("");
    setItemIsDisabled(false);
    setItemOutOfStock(false);
    setPriceVariations([]);
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (sectionId: string, item: MenuItem) => {
    setCurrentSectionId(sectionId);
    setCurrentItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price ? item.price.toString() : "");
    setItemImageUrl(item.imageUrl || "");
    setItemIsDisabled(item.isDisabled || false);
    setItemOutOfStock(item.outOfStock || false);
    setPriceVariations(item.priceVariations || []);
    setItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter a name for this item.",
        variant: "destructive",
      });
      return;
    }

    // Price is only required if no variations exist
    let price = parseFloat(itemPrice);
    if (!priceVariations.length && (isNaN(price) || price < 0)) {
      toast({
        title: "Valid price required",
        description: "Please enter a valid price or add price variations.",
        variant: "destructive",
      });
      return;
    }

    // If price variations exist, price is optional
    if (priceVariations.length > 0) {
      price = 0; // Set to 0 or undefined when variations exist
    }

    const sectionIndex = menuSections.findIndex(section => section.id === currentSectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };

    // Image URL is optional - if empty, use undefined
    const imageUrl = itemImageUrl.trim() || "";

    if (currentItem) {
      // Edit existing item
      const updatedItems = section.items.map(item =>
        item.id === currentItem.id
          ? {
              ...item,
              name: itemName,
              description: itemDescription,
              price: priceVariations.length > 0 ? 0 : price,
              imageUrl,
              isDisabled: itemIsDisabled,
              outOfStock: itemOutOfStock,
              priceVariations: priceVariations.length > 0 ? [...priceVariations] : undefined
            }
          : item
      );
      
      section.items = updatedItems;
      updatedSections[sectionIndex] = section;
      
      toast({
        title: "Item updated",
        description: `"${itemName}" has been updated.`,
      });
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: uuidv4(),
        name: itemName,
        description: itemDescription,
        price: priceVariations.length > 0 ? 0 : price,
        imageUrl,
        isDisabled: itemIsDisabled,
        outOfStock: itemOutOfStock,
        priceVariations: priceVariations.length > 0 ? [...priceVariations] : undefined
      };
      
      section.items = [...section.items, newItem];
      updatedSections[sectionIndex] = section;
      
      toast({
        title: "Item added",
        description: `"${itemName}" has been added to the menu.`,
      });
    }
    
    setMenuSections(updatedSections);
    setItemDialogOpen(false);
    setMenuChanged(true);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const sectionIndex = menuSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };
    
    section.items = section.items.filter(item => item.id !== itemId);
    updatedSections[sectionIndex] = section;
    
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: "Item deleted",
      description: "The item has been removed from the menu.",
    });
  };

  const handleStatusChange = (sectionId: string, itemId: string, status: 'active' | 'disabled' | 'outOfStock') => {
    const sectionIndex = menuSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };
    
    section.items = section.items.map(item => {
      if (item.id === itemId) {
        switch(status) {
          case 'active':
            return { ...item, isDisabled: false, outOfStock: false };
          case 'disabled':
            return { ...item, isDisabled: true, outOfStock: false };
          case 'outOfStock':
            return { ...item, isDisabled: false, outOfStock: true };
          default:
            return item;
        }
      }
      return item;
    });
    
    updatedSections[sectionIndex] = section;
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: `Item ${status === 'active' ? 'activated' : status === 'disabled' ? 'disabled' : 'marked out of stock'}`,
      description: `The item status has been updated.`,
    });
  };

  const handleToggleSectionDisabled = (sectionId: string, isDisabled: boolean) => {
    const updatedSections = menuSections.map(section =>
      section.id === sectionId ? { ...section, isDisabled } : section
    );
    
    setMenuSections(updatedSections);
    setMenuChanged(true);
    
    toast({
      title: isDisabled ? "Section disabled" : "Section enabled",
      description: `The section has been ${isDisabled ? 'hidden from' : 'shown on'} the menu.`,
    });
  };

  const handleAddVariation = () => {
    setPriceVariations([
      ...priceVariations, 
      { name: "", price: 0 }
    ]);
  };

  const handleUpdateVariation = (index: number, field: keyof PriceVariation, value: string) => {
    const updated = [...priceVariations];
    if (field === 'name') {
      updated[index].name = value;
    } else if (field === 'price') {
      updated[index].price = parseFloat(value) || 0;
    }
    setPriceVariations(updated);
  };

  const handleRemoveVariation = (index: number) => {
    // Don't allow removing the last variation if we're using variations (and no base price)
    const shouldPreventRemoval = priceVariations.length === 1 && !itemPrice;
    
    if (!shouldPreventRemoval) {
      setPriceVariations(priceVariations.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove all variations",
        description: "You must have at least one price option. Add a base price or keep at least one variation.",
        variant: "destructive",
      });
    }
  };

  const handleItemsReorder = (sectionId: string, items: MenuItem[]) => {
    const sectionIndex = menuSections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      items
    };
    
    setMenuSections(updatedSections);
    setMenuChanged(true);
  };

  const handleSectionsReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = menuSections.findIndex(section => section.id === active.id);
      const newIndex = menuSections.findIndex(section => section.id === over.id);
      
      setMenuSections(arrayMove(menuSections, oldIndex, newIndex));
      setMenuChanged(true);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading menu builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-4 md:mb-0 text-primary">Menu Builder</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={openAddSectionDialog}
            className="flex items-center border-white/30 bg-white/10 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          
          <Button
            onClick={handleSaveMenu}
            disabled={saving || !menuChanged}
            className="flex items-center bg-black text-white hover:bg-black/90 backdrop-blur-sm"
          >
            {saving ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Menu
              </>
            )}
          </Button>
        </div>
      </div>

      {menuSections.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-bold mb-4">Your menu is empty</h3>
            <p className="mb-6 text-center max-w-md">
              Start by adding a section to your menu, then add items to each section.
            </p>
            <Button
              onClick={openAddSectionDialog}
              className="flex items-center bg-primary/80 hover:bg-primary backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionsReorder}
        >
          <SortableContext
            items={menuSections.map(section => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {menuSections.map(section => (
                <SortableMenuSection
                  key={section.id}
                  section={section}
                  onEdit={openEditSectionDialog}
                  onDelete={handleDeleteSection}
                  onAddItem={openAddItemDialog}
                  onEditItem={openEditItemDialog}
                  onDeleteItem={handleDeleteItem}
                  onStatusChange={handleStatusChange}
                  onToggleSectionDisabled={handleToggleSectionDisabled}
                  onItemsReorder={handleItemsReorder}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className={`glass-dialog ${isMobile ? 'w-[90vw] max-w-none mx-auto' : ''}`}>
          <DialogHeader>
            <DialogTitle>
              {currentSection ? "Edit Section" : "Add Section"}
            </DialogTitle>
            <DialogDescription>
              {currentSection
                ? "Update the name of this menu section"
                : "Add a new section to organize your menu items"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Section Name
              </label>
              <Input
                id="name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Appetizers, Main Course, Desserts"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)} className="border-white/30 bg-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSection}
              className="bg-black text-white hover:bg-black/90"
            >
              {currentSection ? "Update Section" : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className={`glass-dialog ${isMobile ? 'w-[90vw] max-w-none mx-auto' : 'sm:max-w-[500px]'} max-h-[90vh] overflow-y-auto bg-white text-black`}>
          <DialogHeader>
            <DialogTitle>
              {currentItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {currentItem
                ? "Update details for this menu item"
                : "Add details for your new menu item"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">
                Item Name
              </label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Caesar Salad"
              />
            </div>
            
            <div className={`space-y-2 ${priceVariations.length > 0 ? 'opacity-50' : ''}`}>
              <label htmlFor="item-price" className="text-sm font-medium flex justify-between">
                <span>Base Price {priceVariations.length > 0 && "(Not used with variations)"}</span>
                {priceVariations.length > 0 && 
                  <span className="text-xs text-gray-500">(Optional with variations)</span>
                }
              </label>
              <div className="flex items-center">
                <span className="mr-1">{currencySymbol}</span>
                <Input
                  id="item-price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={priceVariations.length > 0}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Price Variations</label>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddVariation}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Variation
                </Button>
              </div>
              
              {priceVariations.map((variation, index) => (
                <div key={index} className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center space-x-2'}`}>
                  <Input
                    placeholder="Name (e.g., Quarter, Half)"
                    value={variation.name}
                    onChange={(e) => handleUpdateVariation(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    <span className="mr-1">{currencySymbol}</span>
                    <Input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={variation.price}
                      onChange={(e) => handleUpdateVariation(index, 'price', e.target.value)}
                      className={isMobile ? "flex-1" : "w-24"}
                    />
                  </div>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleRemoveVariation(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {priceVariations.length > 0 && 
                <p className="text-xs text-gray-500">
                  When using variations, the base price is optional and won't be displayed.
                </p>
              }
            </div>
            
            <div className="space-y-2">
              <label htmlFor="item-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="item-description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe this item..."
                rows={3}
                className="border border-gray-300 bg-white/90 backdrop-blur-sm resize-none focus:border-black focus:bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="item-image" className="text-sm font-medium">
                Image URL (Optional)
              </label>
              <Input
                id="item-image"
                value={itemImageUrl}
                onChange={(e) => setItemImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Images are optional. For best results, use square images (1:1 aspect ratio)
              </p>
              
              {itemImageUrl && (
                <div className="mt-2 border rounded-md p-2">
                  <p className="text-xs font-medium mb-1">Image Preview:</p>
                  <div className="aspect-square w-24 h-24 overflow-hidden rounded-md bg-gray-100">
                    <img 
                      src={itemImageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/200x200?text=Invalid+Image";
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)} className="border-gray-300 bg-white/90">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem}
              className="bg-black text-white hover:bg-black/90"
            >
              {currentItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuBuilder;
