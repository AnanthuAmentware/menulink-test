import { ColorScheme, RestaurantTheme } from "@/contexts/ThemeContext";

/**
 * Converts HEX color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts RGB values to CSS RGB string
 */
export const rgbToString = (rgb: { r: number; g: number; b: number }): string => {
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
};

/**
 * Generates HSL values from a HEX color
 */
export const hexToHsl = (
  hex: string
): { h: number; s: number; l: number } | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Generates a theme object with HSL values for CSS variables
 */
export const generateThemeColors = (colors: ColorScheme) => {
  const themeColors: Record<string, string> = {};
  
  Object.entries(colors).forEach(([key, hexColor]) => {
    const hsl = hexToHsl(hexColor);
    if (hsl) {
      themeColors[key] = `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`;
    }
  });
  
  return themeColors;
};

/**
 * Determines if a color is light or dark
 */
export const isColorLight = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;

  // Using YIQ formula to determine brightness
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 128;
};

/**
 * Generates a contrasting text color (black or white) for a given background
 */
export const getContrastColor = (backgroundColor: string): string => {
  return isColorLight(backgroundColor) ? "#000000" : "#FFFFFF";
};

/**
 * Creates a custom theme by blending two preset themes
 */
export const blendThemes = (
  baseTheme: RestaurantTheme, 
  accentTheme: RestaurantTheme,
  blendFactor: number = 0.5
): RestaurantTheme => {
  // Helper function to blend two hex colors
  const blendColors = (color1: string, color2: string, factor: number): string => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * (1 - factor) + rgb2.r * factor);
    const g = Math.round(rgb1.g * (1 - factor) + rgb2.g * factor);
    const b = Math.round(rgb1.b * (1 - factor) + rgb2.b * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return {
    name: `${baseTheme.name} + ${accentTheme.name} Blend`,
    colors: {
      primary: blendColors(baseTheme.colors.primary, accentTheme.colors.primary, blendFactor),
      secondary: blendColors(baseTheme.colors.secondary, accentTheme.colors.secondary, blendFactor),
      accent: blendColors(baseTheme.colors.accent, accentTheme.colors.accent, blendFactor),
      background: blendColors(baseTheme.colors.background, accentTheme.colors.background, blendFactor),
      text: blendColors(baseTheme.colors.text, accentTheme.colors.text, blendFactor),
      heading: blendColors(baseTheme.colors.heading, accentTheme.colors.heading, blendFactor),
    },
    fonts: {
      headingFont: baseTheme.fonts.headingFont,
      bodyFont: baseTheme.fonts.bodyFont,
    },
    borderRadius: baseTheme.borderRadius,
    isDark: baseTheme.isDark,
    currencySymbol: baseTheme.currencySymbol || accentTheme.currencySymbol || "₹", // Add the missing currencySymbol property
  };
};
