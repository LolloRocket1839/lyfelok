
import React from 'react';
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';

/**
 * Helper function to get the appropriate icon based on iconType
 * @param {string} iconType - The type of icon to use
 * @returns JSX Element representing the icon
 */
export function getIconByType(iconType: string): React.ReactElement {
  switch (iconType) {
    case 'car':
      return <Car size={18} />;
    case 'shopping-bag':
      return <ShoppingBag size={18} />;
    case 'coffee':
      return <Coffee size={18} />;
    case 'home':
      return <Home size={18} />;
    case 'smartphone':
      return <Smartphone size={18} />;
    default:
      return <Smartphone size={18} />;
  }
}
