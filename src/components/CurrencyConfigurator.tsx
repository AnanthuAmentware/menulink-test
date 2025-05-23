
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COMMON_CURRENCIES = [
  { symbol: '$', name: 'USD - Dollar' },
  { symbol: '€', name: 'EUR - Euro' },
  { symbol: '£', name: 'GBP - Pound' },
  { symbol: '¥', name: 'JPY - Yen' },
  { symbol: '₹', name: 'INR - Rupee' },
  { symbol: '₽', name: 'RUB - Ruble' },
  { symbol: '₿', name: 'BTC - Bitcoin' },
];

const CurrencyConfigurator = () => {
  const { theme, setCurrencySymbol } = useTheme();
  const [customSymbol, setCustomSymbol] = useState('');

  const handleSetCurrency = (symbol: string) => {
    setCurrencySymbol(symbol);
  };

  const handleSetCustomCurrency = () => {
    if (customSymbol.trim()) {
      setCurrencySymbol(customSymbol);
      setCustomSymbol('');
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
            <p className="text-sm mb-2 font-medium">Current currency: <span className="font-bold text-primary">{theme.currencySymbol || '$'}</span></p>
            <p className="text-sm text-gray-500">Select from common currencies or enter your own custom symbol.</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {COMMON_CURRENCIES.map((currency) => (
              <Button
                key={currency.symbol}
                variant="outline"
                size="sm"
                className={`border-white/30 ${theme.currencySymbol === currency.symbol ? 'bg-primary/20 border-primary' : 'bg-white/10'}`}
                onClick={() => handleSetCurrency(currency.symbol)}
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
    </Card>
  );
};

export default CurrencyConfigurator;
