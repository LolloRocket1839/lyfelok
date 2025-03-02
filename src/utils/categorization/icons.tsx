
import React from 'react';
import { Home, ShoppingBag, Coffee, Car, Smartphone, BookOpen, Plane, Heart, Tv, TrendingUp, DollarSign } from 'lucide-react';
import { categoryEmojis, ExpenseCategories } from './types';

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
    case 'trending-up':
      return <TrendingUp size={18} />;
    case 'dollar-sign':
      return <DollarSign size={18} />;
    default:
      return <Smartphone size={18} />;
  }
}

/**
 * Get emoji for a category
 * @param category The category name
 * @returns The emoji string for the category
 */
export function getEmojiForCategory(category: string): string {
  // First check if we have an exact match
  if (category in categoryEmojis) {
    return categoryEmojis[category];
  }
  
  // Try to match based on partial category name
  const lowerCategory = category.toLowerCase();
  
  // Check for partial matches
  if (lowerCategory.includes('cibo') || lowerCategory.includes('food') || lowerCategory.includes('restaurant')) {
    return categoryEmojis[ExpenseCategories.Food];
  } else if (lowerCategory.includes('casa') || lowerCategory.includes('alloggio') || lowerCategory.includes('hous')) {
    return categoryEmojis[ExpenseCategories.Housing];
  } else if (lowerCategory.includes('trasporto') || lowerCategory.includes('transport') || lowerCategory.includes('car')) {
    return categoryEmojis[ExpenseCategories.Transport];
  } else if (lowerCategory.includes('divert') || lowerCategory.includes('entertain') || lowerCategory.includes('intratt')) {
    return categoryEmojis[ExpenseCategories.Entertainment];
  } else if (lowerCategory.includes('utenz') || lowerCategory.includes('util') || lowerCategory.includes('bill')) {
    return categoryEmojis[ExpenseCategories.Utilities];
  } else if (lowerCategory.includes('shop') || lowerCategory.includes('acquist')) {
    return categoryEmojis[ExpenseCategories.Shopping];
  } else if (lowerCategory.includes('salute') || lowerCategory.includes('health') || lowerCategory.includes('medic')) {
    return categoryEmojis[ExpenseCategories.Health];
  } else if (lowerCategory.includes('istruz') || lowerCategory.includes('edu') || lowerCategory.includes('scuola')) {
    return categoryEmojis[ExpenseCategories.Education];
  } else if (lowerCategory.includes('viagg') || lowerCategory.includes('travel') || lowerCategory.includes('trip')) {
    return categoryEmojis[ExpenseCategories.Travel];
  } else if (lowerCategory.includes('cura') || lowerCategory.includes('person') || lowerCategory.includes('beauty')) {
    return categoryEmojis[ExpenseCategories.PersonalCare];
  } else if (lowerCategory.includes('abbona') || lowerCategory.includes('subscript') || lowerCategory.includes('serviz')) {
    return categoryEmojis[ExpenseCategories.Subscriptions];
  } else if (lowerCategory.includes('invest') || lowerCategory.includes('etf') || lowerCategory.includes('stock') || lowerCategory.includes('bond')) {
    return categoryEmojis[ExpenseCategories.Investment];
  } else if (lowerCategory.includes('stipend') || lowerCategory.includes('income') || lowerCategory.includes('salary') || lowerCategory.includes('reddito')) {
    return categoryEmojis[ExpenseCategories.Income];
  }
  
  // Default emoji if no match found
  return categoryEmojis[ExpenseCategories.Other];
}

