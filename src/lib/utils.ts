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
  
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(value);
}
