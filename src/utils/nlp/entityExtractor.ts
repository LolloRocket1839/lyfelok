
import { Entity } from './types';

/**
 * Estrae entità significative dall'input (importi, date, descrizioni)
 */
export function extractEntities(input: string): Entity {
  const entities: Entity = {
    amount: null,
    currency: 'EUR', // Default
    date: new Date(), // Default a oggi
    description: '',
    keywords: []
  };
  
  // Estrai importo
  const amountMatch = input.match(/\b(\d+(?:\.\d{1,2})?)\b/);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1]);
    // Rimuovi l'importo per l'elaborazione successiva
    input = input.replace(amountMatch[0], '');
  }
  
  // Estrai valuta
  const currencyMatches: Record<string, string> = {
    'euro': 'EUR',
    'dollari': 'USD',
    'sterline': 'GBP'
  };
  
  for (const [term, code] of Object.entries(currencyMatches)) {
    if (input.includes(term)) {
      entities.currency = code;
      // Rimuovi il termine valuta
      input = input.replace(term, '');
      break;
    }
  }
  
  // Estrai parole chiave significative (stop words rimosse)
  const stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra'];
  entities.keywords = input.split(' ')
    .filter(word => word.length > 2) // Parole troppo brevi ignorate
    .filter(word => !stopWords.includes(word)) // Rimuovi stop words
    .filter(word => !/^\d+$/.test(word)); // Rimuovi numeri puri
  
  // Usa le parole rimanenti come descrizione
  entities.description = input.trim();
  
  return entities;
}
