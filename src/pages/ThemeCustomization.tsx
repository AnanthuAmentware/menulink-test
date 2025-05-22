
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeEditor from '@/components/ThemeEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ThemeCustomization = () => {
  const { theme, resetToDefaultTheme } = useTheme();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Customize Your Restaurant Theme</h1>
        
        <Alert className="mb-6">
          <AlertTitle>Theme Settings</AlertTitle>
          <AlertDescription>
            Customize your restaurant's appearance by selecting colors, fonts, and other styling options. 
            Changes will be applied to your menu and all customer-facing pages.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="editor">
          <TabsList className="mb-6">
            <TabsTrigger value="editor">Theme Editor</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <ThemeEditor />
          </TabsContent>
          
          <TabsContent value="export">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Export Theme</h2>
                <p className="text-gray-600 mb-4">Save your current theme settings to use on another restaurant or to back up your configuration.</p>
                <Button onClick={() => {
                  const themeString = JSON.stringify(theme, null, 2);
                  const blob = new Blob([themeString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `restaurant-theme-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}>
                  Export Theme JSON
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-2">Import Theme</h2>
                <p className="text-gray-600 mb-4">Import a previously saved theme configuration.</p>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('theme-import')?.click()}
                  >
                    Select Theme File
                  </Button>
                  <input
                    id="theme-import"
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const themeData = JSON.parse(event.target?.result as string);
                            // Implementation would validate and apply the theme
                            alert('Theme import functionality would be implemented here');
                          } catch (error) {
                            console.error('Error parsing theme file:', error);
                            alert('Invalid theme file format');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-2">Reset to Default</h2>
                <p className="text-gray-600 mb-4">Restore the default theme settings.</p>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset to the default theme? All your customizations will be lost.')) {
                      resetToDefaultTheme();
                    }
                  }}
                >
                  Reset Theme
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThemeCustomization;
