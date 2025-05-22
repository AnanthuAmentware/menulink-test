
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, doc, getDoc, updateDoc } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MenuSection, MenuItem } from "@/types";
import { Plus, Trash2, MoveVertical, Save, Edit, RefreshCcw } from "lucide-react";
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

// Component for a draggable menu item
const SortableMenuItem = ({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void; 
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="glass-card mb-2 p-3 flex items-center justify-between"
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div className="font-medium truncate">{item.name}</div>
          <div className="text-primary font-bold">${item.price.toFixed(2)}</div>
        </div>
        <div className="text-sm text-gray-400 truncate">{item.description}</div>
      </div>
      
      <div className="flex items-center ml-4 space-x-2">
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
  onItemsReorder
}: { 
  section: MenuSection;
  onEdit: (section: MenuSection) => void;
  onDelete: (id: string) => void;
  onAddItem: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: MenuItem) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onItemsReorder: (sectionId: string, items: MenuItem[]) => void;
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
      className="menu-section glass-card mb-6 last:mb-0 border-l-4 border-primary/50"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-xl font-bold">{section.name}</h3>
          <div {...listeners} className="cursor-move p-1 ml-2">
            <MoveVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
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
        items: []
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
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (sectionId: string, item: MenuItem) => {
    setCurrentSectionId(sectionId);
    setCurrentItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemImageUrl(item.imageUrl || "");
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

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    const sectionIndex = menuSections.findIndex(section => section.id === currentSectionId);
    if (sectionIndex === -1) return;

    const updatedSections = [...menuSections];
    const section = { ...updatedSections[sectionIndex] };

    if (currentItem) {
      // Edit existing item
      const updatedItems = section.items.map(item =>
        item.id === currentItem.id
          ? {
              ...item,
              name: itemName,
              description: itemDescription,
              price,
              imageUrl: itemImageUrl || undefined
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
        price,
        imageUrl: itemImageUrl || undefined
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
            className="flex items-center bg-primary/80 hover:bg-primary backdrop-blur-sm"
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
                  onItemsReorder={handleItemsReorder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="glass-dialog">
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
              className="bg-primary/80 hover:bg-primary"
            >
              {currentSection ? "Update Section" : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="glass-dialog sm:max-w-[500px]">
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
            
            <div className="space-y-2">
              <label htmlFor="item-price" className="text-sm font-medium">
                Price
              </label>
              <Input
                id="item-price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
              />
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
                className="border border-white/30 bg-white/10 backdrop-blur-sm resize-none focus:border-white/50 focus:bg-white/20"
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
              <p className="text-xs text-gray-400">
                For best results, use square images (1:1 aspect ratio)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)} className="border-white/30 bg-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem}
              className="bg-primary/80 hover:bg-primary"
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
