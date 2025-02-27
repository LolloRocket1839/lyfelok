
import React from 'react';
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';

/**
 * A list of mappings between common merchant keywords and expense categories.
 * Each mapping contains a regex pattern for matching and the corresponding category and icon type.
 */
const expenseMappings = [
  { regex: /uber|lyft|taxi|cab|metro|subway|train|bus|transit/i, category: "Transport", iconType: "car" },
  { regex: /grocery|food|restaurant|cafe|starbucks|coffee|mcdonald|burger|pizza|taco|chipotle|panera/i, category: "Food", iconType: "shopping-bag" },
  { regex: /amazon|walmart|target|shopping|store|shop|mall|clothing|electronics|apple/i, category: "Shopping", iconType: "shopping-bag" },
  { regex: /movie|netflix|spotify|hulu|disney|theater|concert|entertainment|game|steam/i, category: "Entertainment", iconType: "coffee" },
  { regex: /rent|mortgage|apartment|housing|home|condo|lease|property/i, category: "Housing", iconType: "home" },
  { regex: /phone|internet|cable|utility|electric|water|gas|bill|subscription/i, category: "Utilities", iconType: "smartphone" },
];

/**
 * Helper function to get the appropriate icon based on iconType
 * @param {string} iconType - The type of icon to use
 * @returns JSX Element representing the icon
 */
function getIconByType(iconType: string): React.ReactElement {
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

/**
 * Auto-categorizes an expense based on the merchant name.
 * @param {string} merchantName - The name of the merchant.
 * @returns Object containing category and appropriate icon
 */
export function autoCategorize(merchantName: string): { category: string; icon: React.ReactElement } {
  for (const mapping of expenseMappings) {
    if (mapping.regex.test(merchantName)) {
      return {
        category: mapping.category,
        icon: getIconByType(mapping.iconType)
      };
    }
  }
  
  // Default category if no mapping is found
  return { 
    category: "Other", 
    icon: getIconByType("smartphone") 
  };
}
