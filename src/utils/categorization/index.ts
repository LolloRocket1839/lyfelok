
import React from 'react';
import { categorizer } from './RuleBasedCategorizer';
import { getIconByType } from './icons';
import { CategorizationResult } from './types';
import { initializeAdditionalMerchants } from './additionalMerchants';

/**
 * Auto-categorizes an expense based on the merchant name.
 * @param {string} merchantName - The name of the merchant.
 * @returns Object containing category and appropriate icon
 */
export function autoCategorize(merchantName: string): CategorizationResult {
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

// Initialize additional merchants on module load
initializeAdditionalMerchants();

// Re-export everything needed from this module
export { getIconByType } from './icons';
export { categorizer } from './RuleBasedCategorizer';
export type { CategorizationResult, CategoryRule } from './types';
