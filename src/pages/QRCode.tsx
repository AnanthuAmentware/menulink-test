
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, getDoc } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateDoc } from '../lib/firebase';
import { Download, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QRCodePage = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const { currentUser } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const menuUrl = currentUser ? `${baseUrl}/menu/${currentUser.uid}` : '';

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentUser) return;
      
      try {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', currentUser.uid));
        
        if (restaurantDoc.exists()) {
          setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });
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
          title: "Error loading data",
          description: "Could not load your restaurant information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [currentUser, toast]);

  const handlePublicToggle = async () => {
    if (!currentUser || !restaurant) return;
    
    setToggleLoading(true);
    
    try {
      const newStatus = !restaurant.isPublic;
      
      await updateDoc(doc(db, 'restaurants', currentUser.uid), {
        isPublic: newStatus
      });
      
      setRestaurant({
        ...restaurant,
        isPublic: newStatus
      });
      
      toast({
        title: newStatus ? "Menu is now public" : "Menu is now private",
        description: newStatus 
          ? "Customers can now access your menu via QR code" 
          : "Your menu is now hidden from the public",
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error updating menu visibility",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const canvas = document.createElement("canvas");
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg!);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 3;
      canvas.height = img.height * 3;
      
      const context = canvas.getContext("2d")!;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      if (restaurant?.name) {
        context.font = "bold 24px Playfair Display, serif";
        context.textAlign = "center";
        context.fillStyle = "#000000";
        context.fillText(restaurant.name, canvas.width / 2, canvas.height + 40);
        
        const newCanvas = document.createElement("canvas");
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height + 60;
        
        const newContext = newCanvas.getContext("2d")!;
        newContext.fillStyle = "#ffffff";
        newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);
        newContext.drawImage(canvas, 0, 0);
        
        newContext.font = "bold 24px Playfair Display, serif";
        newContext.textAlign = "center";
        newContext.fillStyle = "#000000";
        newContext.fillText(restaurant.name, newCanvas.width / 2, canvas.height + 40);
        
        const link = document.createElement("a");
        link.download = `${restaurant.name.replace(/\s/g, "-")}-menu-qr.png`;
        link.href = newCanvas.toDataURL("image/png");
        link.click();
      } else {
        const link = document.createElement("a");
        link.download = "menu-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading QR code generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-4xl font-bold font-display mb-8 text-black">QR Code Generator</h1>
      
      {restaurant ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Menu QR Code</CardTitle>
                <CardDescription className="text-gray-600">
                  {restaurant.isPublic 
                    ? "Your menu is public and accessible via this QR code" 
                    : "Your menu is private. Make it public to allow customers to access it"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div 
                  ref={qrRef}
                  className={`p-6 bg-white rounded-lg border border-gray-200 ${restaurant.isPublic ? "" : "opacity-50"}`}
                >
                  <QRCodeSVG
                    value={menuUrl}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={true}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2 w-full bg-gray-50 p-2 rounded-md">
                  <Switch
                    checked={restaurant.isPublic}
                    onCheckedChange={handlePublicToggle}
                    disabled={toggleLoading}
                    className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-400"
                  />
                  <Label htmlFor="public-mode" className="text-black font-medium">
                    {restaurant.isPublic ? "Menu is Public" : "Menu is Private"}
                  </Label>
                </div>
                
                <Button
                  onClick={downloadQRCode}
                  disabled={!restaurant.isPublic}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Menu URL</CardTitle>
                <CardDescription className="text-gray-600">
                  Share this link directly with your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-md overflow-x-auto">
                  <code className="text-sm break-all text-black">{menuUrl}</code>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 bg-white hover:bg-gray-50 text-black"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    toast({
                      title: "URL copied to clipboard",
                      description: "You can now paste and share it anywhere",
                    });
                  }}
                >
                  Copy Link
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-black">
                  <li>Make your menu public using the toggle switch</li>
                  <li>Download the QR code image</li>
                  <li>Print and place the QR code on your restaurant tables</li>
                  <li>Customers can scan the code to view your digital menu</li>
                  <li>Update your menu anytime without reprinting QR codes</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-black">Restaurant Not Found</h2>
          <p className="mt-2 text-gray-600">
            You need to set up your restaurant profile before generating a QR code.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodePage;
