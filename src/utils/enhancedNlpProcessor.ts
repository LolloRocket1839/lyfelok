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
  
  processText: (text: string): Transaction | null => {
    try {
      if (!text || text.trim() === '') {
        console.warn('Empty text provided to NLP processor');
        return null;
      }
      
      const preprocessedText = enhancedNlpProcessor.preprocessText(text);
      console.log('Preprocessed text:', preprocessedText);
      
      const processedText: ProcessedText = TextProcessor.processText(preprocessedText);
      
      const classification: ClassificationResult = Classifier.classify(processedText);
      
      const entities: ExtractedEntities = EntityExtractor.extract(processedText, classification);
      
      let transaction = TransactionProcessor.processIntoTransaction(processedText, classification, entities);
      
      if (transaction) {
        if (!transaction.description || transaction.description.trim() === '') {
          transaction.description = enhancedNlpProcessor.generateDefaultDescription(
            classification.type || 'expense', 
            classification.subcategory || 'Altro',
            entities
          );
        }
        
        if (!transaction.amount || transaction.amount <= 0) {
          transaction.amount = 0.01;
        }
        
        transaction = EntityExtractor.enrichTransactionData(transaction, preprocessedText);
        
        console.log('NLP processed transaction:', transaction);
        
        const processedTransaction = transactionStore.addTransaction(transaction);
        
        enhancedNlpProcessor.learnFromTransaction(preprocessedText, transaction);
        
        return processedTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error processing text in enhanced NLP processor:', error);
      return null;
    }
  },
  
  preprocessText: (text: string): string => {
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
      'medic': 'farmacia',
      'spesa': 'supermercato'
    };
    
    const normalizedText = text.toLowerCase();
    
    for (const [abbr, full] of Object.entries(abbreviations)) {
      if (normalizedText.startsWith(abbr)) {
        console.log(`Expanded abbreviation: ${abbr} -> ${full}`);
        return `spesa ${full} ${text.substring(abbr.length).trim()}`;
      }
    }
    
    const moneyRegex = /^\s*(\d+(?:[.,]\d+)?)\s*(?:€|eur|euro)?\s*$/i;
    const moneyMatch = normalizedText.match(moneyRegex);
    if (moneyMatch) {
      console.log('Detected money-only input, adding default verb');
      return `spesa di ${moneyMatch[0]}`;
    }
    
    if (/^\s*\d+(?:[.,]\d+)?\s*$/.test(normalizedText)) {
      console.log('Detected number-only input, adding default verb and currency');
      return `spesa di ${normalizedText} euro`;
    }
    
    let processedText = normalizedText;
    for (const [abbr, full] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      processedText = processedText.replace(regex, full);
    }
    
    if (processedText !== normalizedText) {
      console.log(`Expanded text: "${normalizedText}" -> "${processedText}"`);
      return processedText;
    }
    
    return text;
  },
  
  generateDefaultDescription: (type: string, category: string, entities: ExtractedEntities): string => {
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
  
  extractEmojisFromText: (text: string): { emoji: string, category: string } | null => {
    const emojiToCategory: Record<string, string> = {};
    
    Object.entries(categoryEmojis).forEach(([category, emoji]) => {
      emojiToCategory[emoji] = category;
    });
    
    for (const emoji of Object.values(categoryEmojis)) {
      if (text.includes(emoji)) {
        return {
          emoji, 
          category: emojiToCategory[emoji]
        };
      }
    }
    
    if (text.includes(':)') || text.includes(':-)')) {
      return { emoji: '🙂', category: 'Intrattenimento' };
    } else if (text.includes(':(') || text.includes(':-(')) {
      return { emoji: '🙁', category: 'Salute' };
    } else if (text.includes('<3')) {
      return { emoji: '❤️', category: 'PersonalCare' };
    }
    
    return null;
  },
  
  learnFromTransaction: (text: string, transaction: Transaction): void => {
    if (!transaction.category || transaction.category === 'Altro') {
      return;
    }
    
    try {
      const words = text.split(/\s+/);
      
      const emojis = words.filter(word => 
        /\p{Emoji}/u.test(word) && 
        !word.match(/[\p{L}\p{N}]/u)
      );
      
      const potentialMerchants = words.filter(word => 
        word.length > 2 && 
        !/^\d+$/.test(word) && 
        !/\p{Emoji}/u.test(word) && 
        !['euro', 'eur', '€', 'per', 'con', 'dal', 'del', 'che', 'non', 'come', 'cosa', 'sono', 'alla', 'alle', 'nella', 'nelle'].includes(word.toLowerCase())
      );
      
      if (emojis.length > 0) {
        console.log(`Learning emoji-category association: "${emojis[0]}" -> ${transaction.category}`);
      }
      
      if (potentialMerchants.length > 0) {
        const merchantCandidates = potentialMerchants
          .sort((a, b) => b.length - a.length)
          .slice(0, 3);
        
        for (const merchantCandidate of merchantCandidates) {
          console.log(`Learning category association: "${merchantCandidate}" -> ${transaction.category}`);
          
          const merchantPattern = createMerchantPattern(merchantCandidate);
          
          let iconType = 'smartphone';
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
          
          addCustomRule(transaction.category, iconType, [merchantPattern]);
        }
      }
    } catch (error) {
      console.error('Error learning from transaction:', error);
    }
  },
  
  analyzeText: (text: string): any => {
    try {
      const preprocessedText = enhancedNlpProcessor.preprocessText(text);
      
      const processedText = TextProcessor.processText(preprocessedText);
      const classification = Classifier.classify(processedText);
      const entities = EntityExtractor.extract(processedText, classification);
      
      const emojiMatch = enhancedNlpProcessor.extractEmojisFromText(preprocessedText);
      if (emojiMatch) {
        console.log(`Analysis found emoji: ${emojiMatch.emoji} for category ${emojiMatch.category}`);
      }
      
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
  },
  
  processReceiptData: (data: { text: string, amount?: number, merchant?: string }): Transaction | null => {
    try {
      if (!data.text || data.text.trim() === '') {
        console.warn('Empty text provided from receipt OCR');
        return null;
      }
      
      const transaction: Transaction = {
        type: 'USCITA',
        amount: data.amount || 0,
        description: data.merchant || data.text.split('\n')[0] || 'Receipt scan',
        date: new Date().toISOString().split('T')[0],
        metadata: {
          source: 'receipt_image',
          rawText: data.text
        }
      };
      
      const processedText = TextProcessor.processText(transaction.description);
      const classification = Classifier.classify(processedText);
      
      if (classification.subcategory) {
        transaction.category = classification.subcategory;
      }
      
      console.log('Receipt OCR processed transaction:', transaction);
      
      const processedTransaction = transactionStore.addTransaction(transaction);
      
      enhancedNlpProcessor.learnFromTransaction(data.text, transaction);
      
      return processedTransaction;
    } catch (error) {
      console.error('Error processing receipt data in NLP processor:', error);
      return null;
    }
  }
};

export default enhancedNlpProcessor;
