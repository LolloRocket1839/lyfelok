
import React from 'react';
import { Home, ShoppingBag, Coffee, Car, Smartphone, BookOpen, Plane, Heart, Tv } from 'lucide-react';

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
    case 'book':
      return <BookOpen size={18} />;
    case 'plane':
      return <Plane size={18} />;
    case 'heart':
      return <Heart size={18} />;
    case 'tv':
      return <Tv size={18} />;
    default:
      return <Smartphone size={18} />;
  }
}
