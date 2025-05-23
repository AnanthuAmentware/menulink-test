
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save } from 'lucide-react';

const COMMON_CURRENCIES = [
  { symbol: '₹', name: 'INR - Rupee' },
  { symbol: '$', name: 'USD - Dollar' },
  { symbol: '€', name: 'EUR - Euro' },
  { symbol: '£', name: 'GBP - Pound' },
  { symbol: '¥', name: 'JPY - Yen' },
  { symbol: '₽', name: 'RUB - Ruble' },
  { symbol: '₿', name: 'BTC - Bitcoin' },
];

const CurrencyConfigurator = () => {
  const { theme, setTheme } = useTheme();
  const [customSymbol, setCustomSymbol] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(theme.currencySymbol || '₹');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update selected symbol when theme changes
  useEffect(() => {
    setSelectedSymbol(theme.currencySymbol || '₹');
    setHasChanges(false);
  }, [theme.currencySymbol]);

  const handleSelectCurrency = (symbol: string) => {
    setSelectedSymbol(symbol);
    setHasChanges(true);
  };

  const handleSetCustomCurrency = () => {
    if (customSymbol.trim()) {
      setSelectedSymbol(customSymbol);
      setCustomSymbol('');
      setHasChanges(true);
    }
  };

  const handleSaveCurrency = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Create a new theme object with the updated currency symbol
      const updatedTheme = {
        ...theme,
        currencySymbol: selectedSymbol
      };
      
      await setTheme(updatedTheme);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving currency:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-card border-white/30">
      <CardHeader>
        <CardTitle>Currency Configuration</CardTitle>
        <CardDescription>
          Choose the currency symbol that will be shown on your menu
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2 font-medium">Current currency: <span className="font-bold text-primary">{theme.currencySymbol || '₹'}</span></p>
            <p className="text-sm mb-2 font-medium">Selected currency: <span className="font-bold text-accent">{selectedSymbol}</span></p>
            <p className="text-sm text-gray-500">Select from common currencies or enter your own custom symbol.</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {COMMON_CURRENCIES.map((currency) => (
              <Button
                key={currency.symbol}
                variant="outline"
                size="sm"
                className={`border-white/30 ${selectedSymbol === currency.symbol ? 'bg-primary/20 border-primary' : 'bg-white/10'}`}
                onClick={() => handleSelectCurrency(currency.symbol)}
              >
                <span className="mr-1 font-bold">{currency.symbol}</span>
                <span className="text-xs">{currency.name}</span>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="text-sm font-medium mb-2 block">Custom currency symbol</label>
            <div className="flex space-x-2">
              <Input
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="Enter custom symbol"
                maxLength={3}
                className="bg-white/10 border-white/30"
              />
              <Button 
                onClick={handleSetCustomCurrency}
                disabled={!customSymbol.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end pt-4">
        <Button
          onClick={handleSaveCurrency}
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
              Save Currency
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CurrencyConfigurator;
