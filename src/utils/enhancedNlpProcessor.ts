
import { TransactionType } from './nlp/types';
import { textProcessor } from './nlp/textProcessor';
import { knowledgeBase } from './nlp/knowledgeBase';
import { entityExtractor } from './nlp/entityExtractor';
import { transactionProcessor } from './nlp/transactionProcessor';

const enhancedNlpProcessor = async (text: string): Promise<TransactionType | null> => {
  try {
    // Preprocess the input text
    const processedText = textProcessor(text);
    
    // Extract entities from the text
    const extractedEntities = entityExtractor(processedText);
    
    // Process the transaction with the extracted entities
    const transaction = transactionProcessor(extractedEntities);
    
    return transaction;
  } catch (error) {
    console.error("Error in Enhanced NLP Processor:", error);
    return null;
  }
};

export default enhancedNlpProcessor;
