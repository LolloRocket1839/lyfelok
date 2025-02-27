
import React from 'react';
import { Home, ShoppingBag, Coffee, Car, Smartphone } from 'lucide-react';

/**
 * A list of mappings between common merchant keywords and expense categories.
 * Each mapping contains a regex pattern for matching and the corresponding category and icon type.
 */
const expenseMappings = [
  { regex: /uber|lyft|taxi|cab|metro|subway|train|bus|transit/i, category: "Trasporto", iconType: "car" },
  { regex: /grocery|food|restaurant|cafe|starbucks|coffee|mcdonald|burger|pizza|taco|chipotle|panera/i, category: "Cibo", iconType: "shopping-bag" },
  { regex: /amazon|walmart|target|shopping|store|shop|mall|clothing|electronics|apple/i, category: "Shopping", iconType: "shopping-bag" },
  { regex: /movie|netflix|spotify|hulu|disney|theater|concert|entertainment|game|steam/i, category: "Intrattenimento", iconType: "coffee" },
  { regex: /rent|mortgage|apartment|housing|home|condo|lease|property/i, category: "Alloggio", iconType: "home" },
  { regex: /phone|internet|cable|utility|electric|water|gas|bill|subscription/i, category: "Utenze", iconType: "smartphone" },
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
    
    this.defaultCategory = "Altro";
    this.defaultIconType = "smartphone";
    
    // Log the rules for debugging
    console.log("Initialized categorizer with rules:", this.categoryRules);
  }

  // Find category for a merchant
  categorize(merchantName: string): { category: string; iconType: string } {
    if (!merchantName) return { category: this.defaultCategory, iconType: this.defaultIconType };
    
    console.log(`Attempting to categorize: "${merchantName}"`);
    
    // Try to match each pattern
    for (const rule of this.categoryRules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(merchantName)) {
          console.log(`Match found: "${merchantName}" matches pattern ${pattern}, category: ${rule.category}`);
          return { 
            category: rule.category, 
            iconType: rule.iconType 
          };
        }
      }
    }
    
    // No match found
    console.log(`No match found for: "${merchantName}", using default category: ${this.defaultCategory}`);
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
      console.log(`Added new patterns to existing category "${category}":`, patterns);
    } else {
      // Create new category
      this.categoryRules.push({
        category,
        patterns,
        iconType
      });
      console.log(`Created new category "${category}" with patterns:`, patterns);
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

// Add some additional common merchants for better coverage
(function initializeAdditionalMerchants() {
  // Shopping
  addCustomRule("Shopping", "shopping-bag", [
    /costco/i,
    /best buy/i,
    /home depot/i,
    /lowe's/i,
    /ikea/i,
    /macy's/i,
    /nordstrom/i,
    /tj ?maxx/i,
    /marshalls/i,
    /ross/i,
    /kohl's/i,
    /dollar (tree|general|store)/i
  ]);
  
  // Food/Cibo
  addCustomRule("Cibo", "shopping-bag", [
    /kroger/i,
    /safeway/i,
    /publix/i,
    /whole foods/i,
    /trader joe's/i,
    /aldi/i,
    /save-a-lot/i,
    /wendy's/i,
    /burger king/i,
    /taco bell/i,
    /domino's/i,
    /papa john's/i,
    /kfc/i,
    /popeyes/i,
    /chick-fil-a/i,
    /dunkin'? donuts/i,
    /ristorante/i,
    /pizzeria/i,
    /trattoria/i,
    /osteria/i,
    /panetteria/i,
    /pasticceria/i
  ]);
  
  // Entertainment/Intrattenimento
  addCustomRule("Intrattenimento", "coffee", [
    /amc/i,
    /regal/i,
    /cinemark/i,
    /playstation/i,
    /xbox/i,
    /nintendo/i,
    /apple tv/i,
    /amazon prime/i,
    /paramount\+/i,
    /peacock/i,
    /eventbrite/i,
    /ticketmaster/i,
    /stubhub/i,
    /cinema/i,
    /teatro/i,
    /concerto/i,
    /museo/i
  ]);
  
  // Transport/Trasporto
  addCustomRule("Trasporto", "car", [
    /gas station/i,
    /shell/i,
    /chevron/i,
    /exxon/i,
    /mobil/i,
    /bp/i,
    /delta/i,
    /southwest/i,
    /united/i,
    /american airlines/i,
    /hertz/i,
    /enterprise/i,
    /avis/i,
    /amtrak/i,
    /greyhound/i,
    /parking/i,
    /toll/i,
    /benzina/i,
    /autostrada/i,
    /treno/i,
    /aereo/i,
    /volo/i,
    /trenitalia/i,
    /italo/i,
    /metro/i,
    /autobus/i
  ]);
  
  // Utilities/Utenze
  addCustomRule("Utenze", "smartphone", [
    /at&t/i,
    /verizon/i,
    /t-mobile/i,
    /sprint/i,
    /xfinity/i,
    /comcast/i,
    /spectrum/i,
    /cox/i,
    /pg&e/i,
    /edison/i,
    /water bill/i,
    /sewer/i,
    /trash/i,
    /waste management/i,
    /telefono/i,
    /telecom/i,
    /tim/i,
    /vodafone/i,
    /wind/i,
    /iliad/i,
    /fastweb/i,
    /enel/i,
    /luce/i,
    /gas/i,
    /acqua/i,
    /rifiuti/i
  ]);
  
  // Housing/Alloggio
  addCustomRule("Alloggio", "home", [
    /affitto/i,
    /mutuo/i,
    /condominio/i,
    /casa/i,
    /appartamento/i
  ]);
  
  console.log("Initialized additional merchant patterns");
})();
