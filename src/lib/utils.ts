
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to format currency values
 */
export function formatCurrency(value: number, currency: string = 'EUR'): string {
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  
  const symbol = currencySymbols[currency] || '€';
  
  // Use Intl.NumberFormat for consistent currency formatting
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(value);
}

/**
 * Gets a display-friendly category name
 */
export function getCategory(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    'cibo': 'Cibo',
    'alloggio': 'Alloggio',
    'trasporto': 'Trasporti',
    'intrattenimento': 'Intrattenimento',
    'utenze': 'Utenze',
    'shopping': 'Shopping',
    'salute': 'Salute',
    'istruzione': 'Istruzione',
    'investimenti': 'Investimenti',
    'stipendio': 'Stipendio',
    'altro': 'Altro'
  };
  
  return categoryMap[categoryId.toLowerCase()] || categoryId;
}
