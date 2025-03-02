
import { ProcessedText } from './types';
import { KnowledgeBase } from './knowledgeBase';

export class TextProcessor {
  static processText(input: string): ProcessedText {
    // Convert to lowercase for easier processing
    const normalizedText = input.toLowerCase().trim();
    
    // Remove punctuation and extra whitespace
    const cleanText = normalizedText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into tokens (words)
    const tokens = cleanText.split(' ').filter(token => token.length > 0);
    
    // Return processed text object
    return {
      originalText: input,
      normalizedText,
      cleanText,
      tokens,
      language: this.detectLanguage(normalizedText)
    };
  }
  
  static detectLanguage(text: string): 'en' | 'it' {
    // Simplified language detection based on common Italian words
    const italianIndicators = KnowledgeBase.languageDetection.italian;
    
    let italianWordCount = 0;
    italianIndicators.forEach(word => {
      if (text.includes(word)) {
        italianWordCount++;
      }
    });
    
    // If the text contains more than a threshold of Italian indicators, consider it Italian
    return italianWordCount >= 2 ? 'it' : 'en';
  }
}
