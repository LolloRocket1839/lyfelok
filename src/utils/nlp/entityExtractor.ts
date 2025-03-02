
import { Entity } from './types';
import { extractDateFromText } from './textProcessor';

// Function to extract entities from processed text
export function extractEntities(text: string): Entity {
  const entities: Entity = {
    amount: null,
    currency: 'EUR', // Default
    date: new Date(), // Default to today
    description: '',
    keywords: []
  };
  
  // Extract amount - look for numbers optionally followed by € or euro
  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euro|eur)?/i);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1].replace(',', '.'));
    // Remove the amount for further processing
    text = text.replace(amountMatch[0], '');
  }
  
  // Extract currency
  if (text.includes('euro') || text.includes('€')) {
    entities.currency = 'EUR';
  } else if (text.includes('dollari') || text.includes('$')) {
    entities.currency = 'USD';
  }
  
  // Extract date
  const dateString = extractDateFromText(text);
  if (dateString) {
    entities.date = new Date(dateString);
  }
  
  // Extract description and keywords
  // Remove common words for better keyword extraction
  const stopWords = ['ho', 'speso', 'pagato', 'per', 'il', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra'];
  
  // Split text into words
  const words = text.toLowerCase().split(/\s+/);
  
  // Filter out stop words and words shorter than 3 characters
  entities.keywords = words.filter(word => 
    word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word)
  );
  
  // Set the cleaned description
  entities.description = text.trim();
  
  return entities;
}
