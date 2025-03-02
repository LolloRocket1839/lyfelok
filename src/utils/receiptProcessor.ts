
// A utility to process receipt data extracted from images
import enhancedNlpProcessor from './enhancedNlpProcessor';
import { Transaction } from './transactionRouter';

interface ReceiptData {
  text: string;
  amount?: number;
  date?: string;
  merchant?: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
}

const receiptProcessor = {
  /**
   * Process raw receipt text to extract transaction data
   */
  processReceiptText: (receiptText: string): Transaction | null => {
    console.log('Processing receipt text:', receiptText);
    
    if (!receiptText || receiptText.trim() === '') {
      console.error('Empty receipt text provided');
      return null;
    }
    
    // Preprocess the receipt text
    const normalizedText = receiptText.toLowerCase().trim();
    
    // Extract amount using regex
    let amount: number | null = null;
    const amountMatch = normalizedText.match(/(?:€|eur|euro)?\s*(\d+(?:[.,]\d{1,2})?)(?:\s*(?:€|eur|euro))?/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(',', '.'));
    }
    
    // Try to extract merchant/store name
    let merchantName = '';
    const lines = normalizedText.split('\n');
    
    // Usually the first line of a receipt is the store name
    if (lines.length > 0) {
      merchantName = lines[0].trim();
      
      // If the first line contains currency symbols or numbers, it's probably not the store name
      if (/[€$£0-9]/.test(merchantName)) {
        // Look for known store name patterns
        const storePatterns = [
          /(?:supermercato|supermarket)\s+([a-z0-9\s]+)/i,
          /(?:negozio|store)\s+([a-z0-9\s]+)/i,
          /(?:ristorante|restaurant)\s+([a-z0-9\s]+)/i
        ];
        
        for (const pattern of storePatterns) {
          const match = normalizedText.match(pattern);
          if (match) {
            merchantName = match[1].trim();
            break;
          }
        }
      }
    }
    
    // If we can't extract merchant name, look for key words
    if (!merchantName) {
      const merchantKeywords = [
        'esselunga', 'conad', 'coop', 'carrefour', 'lidl', 'aldi', 
        'eurospin', 'iper', 'pam', 'simply', 'auchan', 'penny market',
        'despar', 'tigros', 'md', 'bennet', 'famila', 'interspar'
      ];
      
      for (const keyword of merchantKeywords) {
        if (normalizedText.includes(keyword)) {
          merchantName = keyword;
          break;
        }
      }
    }
    
    // Build description combining merchant and amount
    const description = merchantName 
      ? `${merchantName.charAt(0).toUpperCase() + merchantName.slice(1)} ${amount ? `€${amount}` : ''}`
      : receiptText.split('\n')[0];
    
    // Create a transaction object using the extracted data
    const transaction: Transaction = {
      type: 'USCITA',
      amount: amount || 0,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      metadata: {
        source: 'receipt_image',
        rawText: receiptText
      }
    };
    
    // Use the enhanced NLP processor to categorize the transaction
    return enhancedNlpProcessor.processText(transaction.description);
  },
  
  /**
   * Process structured receipt data from OCR service
   */
  processReceiptData: (receiptData: ReceiptData): Transaction | null => {
    // If we only have text, use the text processor
    if (receiptData.text && !receiptData.amount) {
      return receiptProcessor.processReceiptText(receiptData.text);
    }
    
    // Create a description combining merchant and items if available
    let description = receiptData.merchant || '';
    
    if (receiptData.items && receiptData.items.length > 0) {
      const mainItem = receiptData.items[0];
      if (description) {
        description += ` - ${mainItem.name}`;
      } else {
        description = mainItem.name;
      }
      
      if (receiptData.items.length > 1) {
        description += ` and ${receiptData.items.length - 1} more items`;
      }
    }
    
    // If we still don't have a description, use the text
    if (!description && receiptData.text) {
      description = receiptData.text.split('\n')[0];
    }
    
    // Create a transaction object
    const transaction: Transaction = {
      type: 'USCITA',
      amount: receiptData.amount || 0,
      description: description.trim(),
      date: receiptData.date || new Date().toISOString().split('T')[0],
      metadata: {
        source: 'receipt_image',
        rawText: receiptData.text,
        merchant: receiptData.merchant,
        items: receiptData.items
      }
    };
    
    // Use the enhanced NLP processor to categorize the transaction
    return enhancedNlpProcessor.processText(transaction.description);
  }
};

export default receiptProcessor;
