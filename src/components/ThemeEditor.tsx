
import React, { useState, useEffect } from 'react';
import { useTheme, themePresets, type RestaurantTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { isColorLight, getContrastColor } from '@/lib/theme-utils';
import { Save, Pipette, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ThemeEditor = () => {
  const { theme, setTheme, availablePresets } = useTheme();
  const [workingTheme, setWorkingTheme] = useState<RestaurantTheme>({ ...theme });
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState<keyof typeof workingTheme.colors | null>(null);
  const [openColorPicker, setOpenColorPicker] = useState(false);

  // Reset working theme when the actual theme changes
  useEffect(() => {
    setWorkingTheme({ ...theme });
    setHasChanges(false);
    
    // Check if the current theme matches any preset
    const presetMatch = Object.entries(availablePresets).find(([_, preset]) => {
      return JSON.stringify(preset.colors) === JSON.stringify(theme.colors) && 
             JSON.stringify(preset.fonts) === JSON.stringify(theme.fonts) &&
             preset.borderRadius === theme.borderRadius &&
             preset.isDark === theme.isDark;
    });
    
    if (presetMatch) {
      setSelectedPreset(presetMatch[0]);
    } else {
      setSelectedPreset("custom");
    }
  }, [theme, availablePresets]);

  const handleColorChange = (colorKey: keyof typeof workingTheme.colors, value: string) => {
    setWorkingTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
    setSelectedPreset("custom");
    setHasChanges(true);
  };

  const handleFontChange = (fontKey: keyof typeof workingTheme.fonts, value: string) => {
    setWorkingTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value
      }
    }));
    setSelectedPreset("custom");
    setHasChanges(true);
  };

  const handleBorderRadiusChange = (value: string) => {
    setWorkingTheme(prev => ({
      ...prev,
      borderRadius: value
    }));
    setSelectedPreset("custom");
    setHasChanges(true);
  };

  const handleDarkModeChange = (isDark: boolean) => {
    setWorkingTheme(prev => ({
      ...prev,
      isDark
    }));
    setSelectedPreset("custom");
    setHasChanges(true);
  };

  const handlePresetSelect = (presetName: keyof typeof availablePresets) => {
    setSelectedPreset(presetName);
    setWorkingTheme({ ...availablePresets[presetName] });
    setHasChanges(true);
  };

  const saveTheme = async () => {
    setIsSaving(true);
    await setTheme(workingTheme);
    setHasChanges(false);
    setIsSaving(false);
  };

  const openColorPickerDialog = (colorKey: keyof typeof workingTheme.colors) => {
    setActiveColorKey(colorKey);
    setOpenColorPicker(true);
  };

  const FontPreview = ({ fontFamily }: { fontFamily: string }) => (
    <span style={{ fontFamily }}>
      {fontFamily}
    </span>
  );

  const ColorSwatch = ({ color, label, onChange, colorKey }: { 
    color: string, 
    label: string, 
    onChange: (value: string) => void,
    colorKey: keyof typeof workingTheme.colors
  }) => {
    const textColor = isColorLight(color) ? '#000' : '#fff';
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <Label htmlFor={`color-${label}`}>{label}</Label>
        <div className="relative flex items-center">
          <div
            className="w-12 h-12 rounded-md border shadow-sm cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: color, color: textColor }}
            onClick={() => openColorPickerDialog(colorKey)}
          >
            <Pipette className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Theme Editor</CardTitle>
        <CardDescription>Customize your restaurant's appearance</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="presets">Theme Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography & Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(availablePresets).map(([presetKey, preset]) => (
                <div 
                  key={presetKey}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPreset === presetKey ? 'ring-2 ring-primary bg-primary/10' : 'hover:shadow-md'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{preset.name}</div>
                    {selectedPreset === presetKey ? (
                      <Button 
                        className="bg-black text-white hover:bg-black/80" 
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-1" /> Selected
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePresetSelect(presetKey as keyof typeof availablePresets)}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.colors.primary }} title="Primary color" />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.colors.secondary }} title="Secondary color" />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.colors.accent }} title="Accent color" />
                  </div>
                  <div className="text-sm">
                    <span style={{ fontFamily: preset.fonts.headingFont }}>Heading: {preset.fonts.headingFont}</span>
                    <br />
                    <span style={{ fontFamily: preset.fonts.bodyFont }}>Body: {preset.fonts.bodyFont}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="colors">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <ColorSwatch color={workingTheme.colors.primary} label="Primary" onChange={(val) => handleColorChange('primary', val)} colorKey="primary" />
                <ColorSwatch color={workingTheme.colors.secondary} label="Secondary" onChange={(val) => handleColorChange('secondary', val)} colorKey="secondary" />
                <ColorSwatch color={workingTheme.colors.accent} label="Accent" onChange={(val) => handleColorChange('accent', val)} colorKey="accent" />
                <ColorSwatch color={workingTheme.colors.background} label="Background" onChange={(val) => handleColorChange('background', val)} colorKey="background" />
                <ColorSwatch color={workingTheme.colors.text} label="Text" onChange={(val) => handleColorChange('text', val)} colorKey="text" />
                <ColorSwatch color={workingTheme.colors.heading} label="Heading" onChange={(val) => handleColorChange('heading', val)} colorKey="heading" />
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="dark-mode" 
                    checked={workingTheme.isDark}
                    onCheckedChange={handleDarkModeChange}
                  />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Preview</h3>
                <div 
                  className="p-4 rounded-lg shadow-sm" 
                  style={{ 
                    backgroundColor: workingTheme.colors.background,
                    color: workingTheme.colors.text,
                    borderRadius: workingTheme.borderRadius
                  }}
                >
                  <h4 style={{ 
                    color: workingTheme.colors.heading, 
                    fontFamily: workingTheme.fonts.headingFont 
                  }} className="text-xl font-bold mb-2">
                    Menu Preview
                  </h4>
                  
                  {/* Menu Item Preview Example */}
                  <div className="mb-4 border rounded-md p-3" style={{ borderColor: workingTheme.colors.secondary }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 style={{ 
                          color: workingTheme.colors.heading,
                          fontFamily: workingTheme.fonts.headingFont 
                        }} className="font-bold">
                          Italian Pizza
                        </h5>
                        <p style={{ fontFamily: workingTheme.fonts.bodyFont }} className="text-sm mt-1">
                          Fresh tomato sauce, mozzarella, basil, olive oil
                        </p>
                      </div>
                      <div style={{ 
                        color: workingTheme.colors.primary,
                        fontFamily: workingTheme.fonts.headingFont,
                        fontWeight: "bold" 
                      }}>
                        {workingTheme.currencySymbol || "₹"}12.99
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="typography">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <RadioGroup 
                    value={workingTheme.fonts.headingFont}
                    onValueChange={(val) => handleFontChange('headingFont', val)}
                    className="space-y-2"
                  >
                    {['Playfair Display', 'Montserrat', 'Merriweather', 'Roboto Slab', 'Oswald'].map(font => (
                      <div key={font} className="flex items-center space-x-2">
                        <RadioGroupItem value={font} id={`heading-${font}`} />
                        <Label htmlFor={`heading-${font}`} className="font-normal cursor-pointer">
                          <FontPreview fontFamily={font} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <RadioGroup 
                    value={workingTheme.fonts.bodyFont}
                    onValueChange={(val) => handleFontChange('bodyFont', val)}
                    className="space-y-2"
                  >
                    {['Lato', 'Open Sans', 'Roboto', 'Source Sans Pro', 'Nunito'].map(font => (
                      <div key={font} className="flex items-center space-x-2">
                        <RadioGroupItem value={font} id={`body-${font}`} />
                        <Label htmlFor={`body-${font}`} className="font-normal cursor-pointer">
                          <FontPreview fontFamily={font} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {['0', '0.25rem', '0.5rem', '0.75rem', '1rem'].map(radius => (
                    <div
                      key={radius}
                      className={`border p-3 text-center cursor-pointer rounded transition-all hover:border-primary flex items-center justify-center ${workingTheme.borderRadius === radius ? 'ring-2 ring-primary' : ''}`}
                      style={{ borderRadius: radius }}
                      onClick={() => handleBorderRadiusChange(radius)}
                    >
                      <span className="truncate text-sm">
                        {radius === '0' ? 'None' : radius}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setWorkingTheme({ ...theme });
            setHasChanges(false);
          }}
          disabled={isSaving}
        >
          Discard Changes
        </Button>
        <Button 
          onClick={saveTheme} 
          className={`${!hasChanges ? 'bg-gray-400 hover:bg-gray-500' : 'bg-black hover:bg-black/90'} text-white flex items-center gap-2`}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⟳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Apply Theme
            </>
          )}
        </Button>
      </CardFooter>

      {/* Color Picker Dialog */}
      <Dialog open={openColorPicker} onOpenChange={setOpenColorPicker}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Select Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="color-input">Choose a color</Label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-10 h-10 rounded border" 
                  style={{ backgroundColor: activeColorKey ? workingTheme.colors[activeColorKey] : '#000000' }}
                />
                <Input 
                  id="color-input"
                  type="color"
                  value={activeColorKey ? workingTheme.colors[activeColorKey] : '#000000'}
                  onChange={(e) => {
                    if (activeColorKey) {
                      handleColorChange(activeColorKey, e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Button 
                className="w-full bg-black text-white" 
                onClick={() => setOpenColorPicker(false)}
              >
                <Check className="mr-2 h-4 w-4" />
                Apply Color
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ThemeEditor;
