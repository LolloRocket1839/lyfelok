
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
 * Class implementing a rule-based categorizer for transactions
 */
class RuleBasedCategorizer {
  categoryRules: {
    category: string;
    patterns: RegExp[];
    iconType: string;
  }[];
  defaultCategory: string;
  defaultIconType: string;

  constructor() {
    // Initialize with our existing mappings
    this.categoryRules = expenseMappings.map(mapping => ({
      category: mapping.category,
      patterns: [mapping.regex],
      iconType: mapping.iconType
    }));
    
    this.defaultCategory = "Other";
    this.defaultIconType = "smartphone";
  }

  // Find category for a merchant
  categorize(merchantName: string): { category: string; iconType: string } {
    if (!merchantName) return { category: this.defaultCategory, iconType: this.defaultIconType };
    
    // Try to match each pattern
    for (const rule of this.categoryRules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(merchantName)) {
          return { 
            category: rule.category, 
            iconType: rule.iconType 
          };
        }
      }
    }
    
    // No match found
    return { 
      category: this.defaultCategory, 
      iconType: this.defaultIconType 
    };
  }
  
  // Add custom rule
  addCustomRule(category: string, iconType: string, patterns: RegExp[]): void {
    // Check if category already exists
    const existingRule = this.categoryRules.find(rule => rule.category === category);
    
    if (existingRule) {
      // Add patterns to existing category
      existingRule.patterns = [...existingRule.patterns, ...patterns];
    } else {
      // Create new category
      this.categoryRules.push({
        category,
        patterns,
        iconType
      });
    }
  }
}

// Create a singleton instance of the categorizer
const categorizer = new RuleBasedCategorizer();

/**
 * Auto-categorizes an expense based on the merchant name.
 * @param {string} merchantName - The name of the merchant.
 * @returns Object containing category and appropriate icon
 */
export function autoCategorize(merchantName: string): { category: string; icon: React.ReactElement } {
  const result = categorizer.categorize(merchantName);
  
  return {
    category: result.category,
    icon: getIconByType(result.iconType)
  };
}

/**
 * Add a custom categorization rule
 * @param {string} category - The category name
 * @param {string} iconType - The icon type to use (car, shopping-bag, etc.)
 * @param {RegExp[]} patterns - Array of regex patterns to match
 */
export function addCustomRule(category: string, iconType: string, patterns: RegExp[]): void {
  categorizer.addCustomRule(category, iconType, patterns);
}

/**
 * Create a pattern from a merchant name string (escaping special characters)
 * @param {string} merchantName - The merchant name to convert to a pattern
 * @returns RegExp object for the merchant name
 */
export function createMerchantPattern(merchantName: string): RegExp {
  // Escape special regex characters
  const escaped = merchantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}
