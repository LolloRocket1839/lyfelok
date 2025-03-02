
import React from 'react';

export interface CategoryRule {
  category: string;
  patterns: RegExp[];
  iconType: string;
}

export interface CategorizationResult {
  category: string;
  icon: React.ReactElement;
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
