
import { CategoryRule } from './types';
import { expenseMappings } from './defaultMappings';

/**
 * Class implementing a rule-based categorizer for transactions
 */
export class RuleBasedCategorizer {
  categoryRules: CategoryRule[];
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
export const categorizer = new RuleBasedCategorizer();
