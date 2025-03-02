
import { Transaction } from './transactionRouter';
import { transactionStore } from './transactionStore';
import { knowledgeBase } from './nlp/knowledgeBase';
import { Classifier } from './nlp/classifier';
import { EntityExtractor } from './nlp/entityExtractor';
import { TransactionProcessor } from './nlp/transactionProcessor';
import { TextProcessor } from './nlp/textProcessor';
import { ProcessedText, ClassificationResult, ExtractedEntities } from './nlp/types';
import { autoCategorize, addCustomRule, createMerchantPattern } from './categorization';
import { ExpenseCategories } from './categorization/types';

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
      // Step 1: Basic text processing
      const processedText: ProcessedText = TextProcessor.processText(text);
      
      // Step 2: Classify the intent
      const classification: ClassificationResult = Classifier.classify(processedText);
      
      // Step 3: Extract entities
      const entities: ExtractedEntities = EntityExtractor.extract(processedText, classification);
      
      // Step 4: Process into a transaction
      let transaction = TransactionProcessor.processIntoTransaction(processedText, classification, entities);
      
      if (transaction) {
        // Step 5: Enrich transaction with additional data
        transaction = EntityExtractor.enrichTransactionData(transaction, text);
        
        // Log the transaction for debugging purposes
        console.log('NLP processed transaction:', transaction);
        
        // Add the transaction to the store
        const processedTransaction = transactionStore.addTransaction(transaction);
        
        // Step 6: Learn from this transaction to improve future categorization
        enhancedNlpProcessor.learnFromTransaction(text, transaction);
        
        return processedTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error processing text in enhanced NLP processor:', error);
      return null;
    }
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
      const potentialMerchants = words.filter(word => 
        word.length > 3 && 
        !/^\d+$/.test(word) && // Exclude numbers
        !['euro', 'eur', '€', 'per', 'con', 'dal', 'del', 'che', 'non', 'come', 'cosa', 'sono', 'alla', 'alle', 'nella', 'nelle'].includes(word.toLowerCase()) // Exclude common words
      );
      
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
      const processedText = TextProcessor.processText(text);
      const classification = Classifier.classify(processedText);
      const entities = EntityExtractor.extract(processedText, classification);
      
      // Return detailed analysis
      return {
        processed: processedText,
        classification: classification,
        entities: entities,
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
