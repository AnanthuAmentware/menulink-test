
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db, doc, getDoc, updateDoc } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name is required" }),
  location: z.string().optional(),
  contact: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const AdminEdit = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      contact: "",
      description: "",
      isPublic: false,
      isBlocked: false,
    },
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurantId) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
        
        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data();
          setRestaurant({ id: restaurantDoc.id, ...data });
          
          // Set form defaults
          form.reset({
            name: data.name || "",
            location: data.location || "",
            contact: data.contact || "",
            description: data.description || "",
            isPublic: data.isPublic || false,
            isBlocked: data.isBlocked || false,
          });
        } else {
          setError("Restaurant not found");
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        setError("Failed to load restaurant data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [restaurantId, form]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSaving(true);
    
    if (!restaurantId) {
      setError("Restaurant ID is missing");
      setSaving(false);
      return;
    }
    
    try {
      await updateDoc(doc(db, "restaurants", restaurantId), {
        name: data.name,
        location: data.location || "",
        contact: data.contact || "",
        description: data.description || "",
        isPublic: data.isPublic,
        isBlocked: data.isBlocked,
      });
      
      toast({
        title: "Restaurant updated",
        description: "The restaurant profile has been updated successfully.",
      });
      
      navigate("/admin");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      setError("Failed to update restaurant. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading restaurant data...</span>
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="page-container">
        <Alert variant="destructive" className="glass-card mb-6 border-red-300/50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/admin")} className="glass hover:bg-white/30">Back to Admin Panel</Button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-display mb-8 text-primary">
          Edit Restaurant (Admin)
        </h1>
        
        <Card className="border-white/30 bg-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-primary">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="glass-card mb-6 border-red-300/50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Restaurant Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="The Tasty Fork" 
                              {...field} 
                              disabled={saving}
                              className="bg-white/10 border-white/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main St, Anytown, USA" 
                              {...field} 
                              disabled={saving}
                              className="bg-white/10 border-white/30" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Contact Information</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Phone: (123) 456-7890, Email: info@example.com" 
                              {...field} 
                              disabled={saving}
                              className="bg-white/10 border-white/30" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Restaurant Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Restaurant description..." 
                              {...field} 
                              disabled={saving}
                              rows={5}
                              className="bg-white/10 border-white/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-6">
                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/30 bg-white/10 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Public Status</FormLabel>
                              <FormDescription className="text-sm text-muted-foreground">
                                Make this restaurant menu visible to the public
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={saving}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isBlocked"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-300/30 bg-red-50/10 p-4 mt-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Block Restaurant</FormLabel>
                              <FormDescription className="text-sm text-muted-foreground">
                                Prevent restaurant owner access and hide the menu
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={saving}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/admin")}
                    disabled={saving}
                    className="bg-white/10 border-white/30 hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary/70 hover:bg-primary/90 backdrop-blur-sm text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEdit;
