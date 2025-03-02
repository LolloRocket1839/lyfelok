
import { Transaction } from './transactionRouter';
import { transactionStore } from './transactionStore';
import { knowledgeBase } from './nlp/knowledgeBase';
import { Classifier } from './nlp/classifier';
import { EntityExtractor } from './nlp/entityExtractor';
import { TransactionProcessor } from './nlp/transactionProcessor';
import { TextProcessor } from './nlp/textProcessor';
import { ProcessedText, ClassificationResult, ExtractedEntities } from './nlp/types';
import { autoCategorize, addCustomRule, createMerchantPattern } from './categorization';
import { ExpenseCategories, categoryEmojis } from './categorization/types';

const enhancedNlpProcessor = {
  userId: null as string | null,
  
  initialize: () => {
    console.log('Enhanced NLP processor initialized');
    // Any initialization logic here
  },
  
  setUserId: (userId: string) => {
    enhancedNlpProcessor.userId = userId;
    console.log('NLP processor user ID set:', userId);
  },
  
  // Process natural language input from the user
  processText: (text: string): Transaction | null => {
    try {
      if (!text || text.trim() === '') {
        console.warn('Empty text provided to NLP processor');
        return null;
      }
      
      // Preprocess text to handle common Italian abbreviations and partial words
      const preprocessedText = enhancedNlpProcessor.preprocessText(text);
      console.log('Preprocessed text:', preprocessedText);
      
      // Step 1: Basic text processing
      const processedText: ProcessedText = TextProcessor.processText(preprocessedText);
      
      // Step 2: Classify the intent
      const classification: ClassificationResult = Classifier.classify(processedText);
      
      // Step 3: Extract entities
      const entities: ExtractedEntities = EntityExtractor.extract(processedText, classification);
      
      // Step 4: Check for emoji indicators in text which might help with categorization
      const emojiMatch = enhancedNlpProcessor.extractEmojisFromText(preprocessedText);
      if (emojiMatch && !classification.subcategory) {
        console.log(`Found emoji indicator: ${emojiMatch.emoji} for category ${emojiMatch.category}`);
        classification.subcategory = emojiMatch.category;
      }
      
      // Step 5: Process into a transaction
      let transaction = TransactionProcessor.processIntoTransaction(processedText, classification, entities);
      
      if (transaction) {
        // Handle potential missing fields with smart defaults
        if (!transaction.description || transaction.description.trim() === '') {
          transaction.description = enhancedNlpProcessor.generateDefaultDescription(
            classification.type || 'expense', 
            classification.subcategory || 'Altro',
            entities
          );
        }
        
        if (!transaction.amount || transaction.amount <= 0) {
          // Provide a default placeholder amount that clearly indicates it's a placeholder
          transaction.amount = 0.01;
        }
        
        // Step 6: Enrich transaction with additional data
        transaction = EntityExtractor.enrichTransactionData(transaction, preprocessedText);
        
        // Log the transaction for debugging purposes
        console.log('NLP processed transaction:', transaction);
        
        // Add the transaction to the store
        const processedTransaction = transactionStore.addTransaction(transaction);
        
        // Step 7: Learn from this transaction to improve future categorization
        enhancedNlpProcessor.learnFromTransaction(preprocessedText, transaction);
        
        return processedTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error processing text in enhanced NLP processor:', error);
      return null;
    }
  },
  
  // Preprocess text to handle Italian abbreviations and partial words
  preprocessText: (text: string): string => {
    // Common Italian abbreviations and their full forms
    const abbreviations: {[key: string]: string} = {
      'rest': 'ristorante',
      'ristr': 'ristorante',
      'rist': 'ristorante',
      'risto': 'ristorante',
      'alim': 'alimentari',
      'aliment': 'alimentari',
      'farm': 'farmacia',
      'superm': 'supermercato',
      'super': 'supermercato',
      'benzin': 'benzina',
      'carb': 'carburante',
      'benz': 'benzina',
      'esp': 'espresso',
      'caff': 'caffè',
      'cola': 'colazione',
      'pranz': 'pranzo',
      'pizz': 'pizza',
      'cin': 'cinema',
      'tea': 'teatro',
      'cons': 'concerto',
      'tren': 'treno',
      'metro': 'metropolitana',
      'abb': 'abbonamento',
      'mens': 'mensile',
      'stip': 'stipendio',
      'sal': 'salario',
      'bon': 'bonifico',
      'inv': 'investimento',
      'acq': 'acquisto',
      'verd': 'verdura',
      'frut': 'frutta',
      'veggy': 'verdura',
      'carn': 'carne',
      'latt': 'latticini',
      'pan': 'pane',
      'past': 'pasta',
      'boll': 'bolletta',
      'usc': 'uscita',
      'ing': 'ingresso',
      'acqu': 'acqua',
      'luz': 'luce',
      'lu': 'luce',
      'el': 'elettricità',
      'ele': 'elettricità',
      'gas': 'gas metano',
      'tel': 'telefono',
      'cell': 'cellulare',
      'internet': 'connessione internet',
      'net': 'internet',
      'aff': 'affitto',
      'mut': 'mutuo',
      'doc': 'dottore',
      'med': 'medico',
      'ospe': 'ospedale',
      'medic': 'farmacia', // Changed from duplicate 'farm' to 'medic'
      'spesa': 'supermercato'
    };
    
    // Special handling for mini-snippets that could be expense descriptions
    const normalizedText = text.toLowerCase();
    
    // Check if the text is just a category name or abbreviation
    for (const [abbr, full] of Object.entries(abbreviations)) {
      // Check if the text starts with this abbreviation
      if (normalizedText.startsWith(abbr)) {
        console.log(`Expanded abbreviation: ${abbr} -> ${full}`);
        return `spesa ${full} ${text.substring(abbr.length).trim()}`;
      }
    }
    
    // Handle common Italian formats for money with default verb
    const moneyRegex = /^\s*(\d+(?:[.,]\d+)?)\s*(?:€|eur|euro)?\s*$/i;
    const moneyMatch = normalizedText.match(moneyRegex);
    if (moneyMatch) {
      console.log('Detected money-only input, adding default verb');
      return `spesa di ${moneyMatch[0]}`;
    }
    
    // Handle snippet with just a number (likely an amount)
    if (/^\s*\d+(?:[.,]\d+)?\s*$/.test(normalizedText)) {
      console.log('Detected number-only input, adding default verb and currency');
      return `spesa di ${normalizedText} euro`;
    }
    
    // Search and replace abbreviations in text
    let processedText = normalizedText;
    for (const [abbr, full] of Object.entries(abbreviations)) {
      // Replace abbreviated forms with their full forms
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      processedText = processedText.replace(regex, full);
    }
    
    // If processed text is different, we've made expansions
    if (processedText !== normalizedText) {
      console.log(`Expanded text: "${normalizedText}" -> "${processedText}"`);
      return processedText;
    }
    
    return text;
  },
  
  // Generate a default description when one isn't available
  generateDefaultDescription: (type: string, category: string, entities: ExtractedEntities): string => {
    // Create a reasonable default description based on category and any available info
    const amount = entities.amount ? `${entities.amount} ${entities.currency}` : '';
    const keywords = entities.keywords.slice(0, 3).join(' ');
    
    if (keywords) {
      return keywords;
    } else if (amount) {
      return `${category} ${amount}`;
    } else {
      return category;
    }
  },
  
  // Extract emojis from text and identify potential categories
  extractEmojisFromText: (text: string): { emoji: string, category: string } | null => {
    // Create a reverse mapping of emoji to category
    const emojiToCategory: Record<string, string> = {};
    
    Object.entries(categoryEmojis).forEach(([category, emoji]) => {
      emojiToCategory[emoji] = category;
    });
    
    // Search for any emojis in the text
    for (const emoji of Object.values(categoryEmojis)) {
      if (text.includes(emoji)) {
        return {
          emoji, 
          category: emojiToCategory[emoji]
        };
      }
    }
    
    // Check for emoji-like symbols
    if (text.includes(':)') || text.includes(':-)')) {
      return { emoji: '🙂', category: 'Intrattenimento' };
    } else if (text.includes(':(') || text.includes(':-(')) {
      return { emoji: '🙁', category: 'Salute' };
    } else if (text.includes('<3')) {
      return { emoji: '❤️', category: 'PersonalCare' };
    }
    
    return null;
  },
  
  // Learn from successful transactions to improve future categorization
  learnFromTransaction: (text: string, transaction: Transaction): void => {
    if (!transaction.category || transaction.category === 'Altro') {
      // No category learning needed for uncategorized transactions
      return;
    }
    
    try {
      // Extract potential merchant names or key terms from the text
      const words = text.split(/\s+/);
      
      // Filter out emojis for separate processing
      const emojis = words.filter(word => 
        /\p{Emoji}/u.test(word) && 
        !word.match(/[\p{L}\p{N}]/u) // Only pure emoji characters
      );
      
      const potentialMerchants = words.filter(word => 
        word.length > 2 && 
        !/^\d+$/.test(word) && // Exclude numbers
        !/\p{Emoji}/u.test(word) && // Exclude emoji-only words
        !['euro', 'eur', '€', 'per', 'con', 'dal', 'del', 'che', 'non', 'come', 'cosa', 'sono', 'alla', 'alle', 'nella', 'nelle'].includes(word.toLowerCase()) // Exclude common words
      );
      
      // If we found emojis in the text, associate them with this category
      if (emojis.length > 0) {
        console.log(`Learning emoji-category association: "${emojis[0]}" -> ${transaction.category}`);
        // This could be used to enhance the emoji-category mapping in the future
      }
      
      if (potentialMerchants.length > 0) {
        // Sort by length and take the longest words as potential merchant names
        const merchantCandidates = potentialMerchants
          .sort((a, b) => b.length - a.length)
          .slice(0, 3); // Take top 3 longest words
        
        for (const merchantCandidate of merchantCandidates) {
          console.log(`Learning category association: "${merchantCandidate}" -> ${transaction.category}`);
          
          // Add this merchant-category association to our categorization rules
          const merchantPattern = createMerchantPattern(merchantCandidate);
          
          // Determine icon type based on category
          let iconType = 'smartphone'; // default
          switch (transaction.category.toLowerCase()) {
            case ExpenseCategories.Food.toLowerCase():
              iconType = 'shopping-bag';
              break;
            case ExpenseCategories.Housing.toLowerCase():
              iconType = 'home';
              break;
            case ExpenseCategories.Transport.toLowerCase():
              iconType = 'car';
              break;
            case ExpenseCategories.Entertainment.toLowerCase():
              iconType = 'coffee';
              break;
            case ExpenseCategories.Shopping.toLowerCase():
              iconType = 'shopping-bag';
              break;
            case ExpenseCategories.Utilities.toLowerCase():
              iconType = 'smartphone';
              break;
            case ExpenseCategories.Health.toLowerCase():
              iconType = 'heart';
              break;
            case ExpenseCategories.Education.toLowerCase():
              iconType = 'book';
              break;
            case ExpenseCategories.Travel.toLowerCase():
              iconType = 'plane';
              break;
            case ExpenseCategories.PersonalCare.toLowerCase():
              iconType = 'heart';
              break;
            case ExpenseCategories.Subscriptions.toLowerCase():
              iconType = 'tv';
              break;
            default:
              iconType = 'smartphone';
              break;
          }
          
          // Add the rule to our auto-categorization system
          addCustomRule(transaction.category, iconType, [merchantPattern]);
        }
      }
    } catch (error) {
      console.error('Error learning from transaction:', error);
    }
  },
  
  // Analyze text and provide detailed NLP analysis
  analyzeText: (text: string): any => {
    try {
      // Preprocess text to handle Italian abbreviations and snippet words
      const preprocessedText = enhancedNlpProcessor.preprocessText(text);
      
      const processedText = TextProcessor.processText(preprocessedText);
      const classification = Classifier.classify(processedText);
      const entities = EntityExtractor.extract(processedText, classification);
      
      // Check for emoji indicators
      const emojiMatch = enhancedNlpProcessor.extractEmojisFromText(preprocessedText);
      if (emojiMatch) {
        console.log(`Analysis found emoji: ${emojiMatch.emoji} for category ${emojiMatch.category}`);
      }
      
      // Return detailed analysis
      return {
        processed: processedText,
        classification: classification,
        entities: entities,
        emojiIndicator: emojiMatch,
        preprocessedText,
        originalText: text,
        summary: {
          type: classification.type,
          amount: entities.amount,
          category: classification.subcategory,
          confidence: classification.confidence
        }
      };
    } catch (error) {
      console.error('Error in NLP text analysis:', error);
      return {
        error: 'Failed to analyze text',
        details: error
      };
    }
  }
};

export default enhancedNlpProcessor;
