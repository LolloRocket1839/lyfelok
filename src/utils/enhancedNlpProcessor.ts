
import { Transaction, TransactionType } from './transactionRouter';
import { textProcessor } from './nlp/textProcessor';
import { knowledgeBaseData } from './nlp/knowledgeBase';
import { extractEntities } from './nlp/entityExtractor';
import { enrichTransaction, validateTransaction, mapTypeToTransactionType } from './nlp/transactionProcessor';
import { Entity } from './nlp/types';

const enhancedNlpProcessor = async (text: string): Promise<Transaction | null> => {
  try {
    // Preprocess the input text
    const processedText = textProcessor(text);
    
    // Extract entities from the text
    const extractedEntities = extractEntities(processedText);
    
    // Process the transaction with the extracted entities
    const transaction = processTransaction(extractedEntities);
    
    return transaction;
  } catch (error) {
    console.error("Error in Enhanced NLP Processor:", error);
    return null;
  }
};

// Helper function to process the extracted entities into a transaction
const processTransaction = (entities: Entity): Transaction | null => {
  if (!entities || entities.amount === null) {
    return null;
  }
  
  // Create a basic transaction object
  const basicTransaction = {
    type: 'USCITA' as TransactionType, // Default to expense
    amount: entities.amount,
    description: entities.description || '',
    category: 'Altro', // Default category
    date: entities.date.toISOString().split('T')[0],
    confidence: 0.7,
    metadata: {
      keywords: entities.keywords,
      currency: entities.currency
    }
  };
  
  // Enrich transaction with additional data
  const enrichedTransaction = enrichTransaction(entities, {
    type: 'SPESA',
    confidence: 0.7,
    subcategory: null,
    allScores: {}
  });
  
  // Validate the transaction
  const validatedTransaction = validateTransaction(enrichedTransaction);
  
  // Map internal type to TransactionType
  const transactionType = mapTypeToTransactionType(validatedTransaction.type);
  
  return {
    ...validatedTransaction,
    type: transactionType,
  };
};

// No initialize method needed
export default enhancedNlpProcessor;
