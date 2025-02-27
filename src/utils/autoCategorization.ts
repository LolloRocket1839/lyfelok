
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';

/**
 * A list of mappings between common merchant keywords and expense categories.
 * Each mapping contains a regex pattern for matching and the corresponding category with icon.
 */
const expenseMappings = [
  { regex: /uber|lyft|taxi|cab|metro|subway|train|bus|transit/i, category: "Transport", icon: <Car size={18} /> },
  { regex: /grocery|food|restaurant|cafe|starbucks|coffee|mcdonald|burger|pizza|taco|chipotle|panera/i, category: "Food", icon: <ShoppingBag size={18} /> },
  { regex: /amazon|walmart|target|shopping|store|shop|mall|clothing|electronics|apple/i, category: "Shopping", icon: <ShoppingBag size={18} /> },
  { regex: /movie|netflix|spotify|hulu|disney|theater|concert|entertainment|game|steam/i, category: "Entertainment", icon: <Coffee size={18} /> },
  { regex: /rent|mortgage|apartment|housing|home|condo|lease|property/i, category: "Housing", icon: <Home size={18} /> },
  { regex: /phone|internet|cable|utility|electric|water|gas|bill|subscription/i, category: "Utilities", icon: <Smartphone size={18} /> },
];

/**
 * Auto-categorizes an expense based on the merchant name.
 * @param {string} merchantName - The name of the merchant.
 * @returns Object containing category and appropriate icon
 */
export function autoCategorize(merchantName: string) {
  for (const mapping of expenseMappings) {
    if (mapping.regex.test(merchantName)) {
      return {
        category: mapping.category,
        icon: mapping.icon
      };
    }
  }
  
  // Default category if no mapping is found
  return { 
    category: "Other", 
    icon: <Smartphone size={18} /> 
  };
}
