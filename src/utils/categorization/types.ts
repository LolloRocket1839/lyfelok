
import React from 'react';

export interface CategoryRule {
  category: string;
  patterns: RegExp[];
  iconType: string;
  emoji?: string; // Add emoji field
}

export interface CategorizationResult {
  category: string;
  icon: React.ReactElement;
  emoji?: string; // Add emoji field
}

// Categories enum to ensure consistency
export enum ExpenseCategories {
  Food = "Cibo",
  Housing = "Alloggio",
  Transport = "Trasporto",
  Entertainment = "Intrattenimento",
  Utilities = "Utenze",
  Shopping = "Shopping",
  Health = "Salute",
  Education = "Istruzione",
  Travel = "Viaggi",
  PersonalCare = "Cura Personale",
  Subscriptions = "Abbonamenti",
  Other = "Altro"
}

// Mapping from category to emoji
export const categoryEmojis: Record<string, string> = {
  [ExpenseCategories.Food]: "🍕",
  [ExpenseCategories.Housing]: "🏠",
  [ExpenseCategories.Transport]: "🚗",
  [ExpenseCategories.Entertainment]: "🎬",
  [ExpenseCategories.Utilities]: "💡",
  [ExpenseCategories.Shopping]: "🛍️",
  [ExpenseCategories.Health]: "⚕️",
  [ExpenseCategories.Education]: "📚",
  [ExpenseCategories.Travel]: "✈️",
  [ExpenseCategories.PersonalCare]: "💇",
  [ExpenseCategories.Subscriptions]: "📱",
  [ExpenseCategories.Other]: "📌"
};
