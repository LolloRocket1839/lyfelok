
import { EntityType } from './types';
import { knowledgeBase } from './knowledgeBase';

// Function to preprocess text before entity extraction
export const textProcessor = (text: string): string => {
  // Normalize text: convert to lowercase
  let processedText = text.toLowerCase();
  
  // Remove extra whitespaces
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  // Replace common abbreviations
  processedText = processedText.replace(/€/g, ' euro ');
  processedText = processedText.replace(/\$/g, ' dollari ');
  processedText = processedText.replace(/\bk\b/g, '000');
  
  return processedText;
};

// Function to clean extracted amount
export const cleanAmount = (amount: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleanedAmount = amount.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleanedAmount);
};

// Function to normalize category based on knowledge base
export const normalizeCategory = (category: string): string => {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Check if the category exists in knowledge base
  for (const [key, synonyms] of Object.entries(knowledgeBase.categories)) {
    if (synonyms.includes(normalizedCategory)) {
      return key;
    }
  }
  
  // If no match found, return as is
  return normalizedCategory;
};

// Function to extract date from text, returns ISO string or null
export const extractDateFromText = (text: string): string | null => {
  // Common date patterns in Italian
  const datePatterns = [
    // Today, yesterday, tomorrow
    { pattern: /oggi/i, handler: () => new Date() },
    { pattern: /ieri/i, handler: () => { 
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }},
    { pattern: /domani/i, handler: () => { 
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }},
    
    // dd/mm/yyyy or dd-mm-yyyy
    { 
      pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      handler: (match: RegExpMatchArray) => {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Months are 0-indexed in JS
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      }
    },
    
    // dd/mm or dd-mm (current year assumed)
    { 
      pattern: /(\d{1,2})[\/\-](\d{1,2})(?![\/\-]\d)/,
      handler: (match: RegExpMatchArray) => {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = new Date().getFullYear();
        return new Date(year, month, day);
      }
    },
    
    // Italian month names: "10 gennaio 2023" or "10 gennaio"
    {
      pattern: /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/i,
      handler: (match: RegExpMatchArray) => {
        const day = parseInt(match[1]);
        const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                            'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
        const month = monthNames.indexOf(match[2].toLowerCase());
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        return new Date(year, month, day);
      }
    }
  ];
  
  // Try each pattern
  for (const { pattern, handler } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = handler(match);
        return date.toISOString().split('T')[0]; // Return as YYYY-MM-DD
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }
  
  return null;
};
