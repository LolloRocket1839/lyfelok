
import { Transaction } from './transactionRouter';
import { transactionStore } from './transactionStore';
import { knowledgeBase } from './nlp/knowledgeBase';
import { Classifier } from './nlp/classifier';
import { EntityExtractor } from './nlp/entityExtractor';
import { TransactionProcessor } from './nlp/transactionProcessor';
import { TextProcessor } from './nlp/textProcessor';
import { ProcessedText, ClassificationResult, ExtractedEntities } from './nlp/types';

// Enhanced NLP processor with more advanced capabilities
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
      const transaction = TransactionProcessor.processIntoTransaction(processedText, classification, entities);
      
      if (transaction) {
        // Log the transaction for debugging purposes
        console.log('NLP processed transaction:', transaction);
        
        // Add the transaction to the store
        transactionStore.addTransaction(transaction);
        
        return transaction;
      }
      return null;
    } catch (error) {
      console.error('Error processing text in enhanced NLP processor:', error);
      return null;
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
