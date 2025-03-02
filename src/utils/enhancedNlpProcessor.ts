
import { Transaction } from './transactionRouter';
import { transactionStore } from './transactionStore';
import { KnowledgeBase } from './nlp/knowledgeBase';
import { Classifier } from './nlp/classifier';
import { EntityExtractor } from './nlp/entityExtractor';
import { TransactionProcessor } from './nlp/transactionProcessor';
import { TextProcessor } from './nlp/textProcessor';
import { ProcessedText, ClassificationResult, ExtractedEntities } from './nlp/types';

// Enhanced NLP processor with more advanced capabilities
const enhancedNlpProcessor = {
  initialize: () => {
    console.log('Enhanced NLP processor initialized');
    // Any initialization logic here
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
  }
};

export default enhancedNlpProcessor;
