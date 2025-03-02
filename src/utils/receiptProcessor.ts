
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
    
    // Extract amount using regex - looking for currency symbols and numbers
    let amount: number | null = null;
    const amountMatches = normalizedText.match(/(?:€|eur|euro)?\s*(\d+(?:[.,]\d{1,2})?)(?:\s*(?:€|eur|euro))?/gi);
    if (amountMatches) {
      // Find the largest amount - usually the total
      const amounts = amountMatches.map(match => {
        const numStr = match.replace(/[^0-9,.]/g, '').replace(',', '.');
        return parseFloat(numStr);
      }).filter(num => !isNaN(num));
      
      if (amounts.length > 0) {
        // Sort amounts and take the largest as it's likely the total
        amount = Math.max(...amounts);
      }
    }
    
    // Try to extract date using regex
    let date = new Date().toISOString().split('T')[0]; // Default to today
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
      // DD MMM YYYY (like 15 Gen 2023)
      /(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\w*\s+(\d{2,4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        // Try to parse the date, falling back to today if invalid
        try {
          const day = parseInt(match[1]);
          let month = 0;
          
          if (match[2].match(/^\d+$/)) {
            // If month is numeric
            month = parseInt(match[2]) - 1; // JS months are 0-based
          } else {
            // If month is textual (Italian abbreviation)
            const monthNames = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
            const monthAbbr = match[2].substring(0, 3).toLowerCase();
            month = monthNames.indexOf(monthAbbr);
          }
          
          let year = parseInt(match[3]);
          if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
          
          const dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            date = dateObj.toISOString().split('T')[0];
          }
        } catch (err) {
          console.warn('Date parsing error:', err);
        }
        break;
      }
    }
    
    // Try to extract merchant/store name with improved detection
    let merchantName = '';
    const lines = normalizedText.split('\n');
    
    // Common merchant indicators
    const merchantKeywords = [
      'esselunga', 'conad', 'coop', 'carrefour', 'lidl', 'aldi', 
      'eurospin', 'iper', 'pam', 'simply', 'auchan', 'penny market',
      'despar', 'tigros', 'md', 'bennet', 'famila', 'interspar',
      'supermercato', 'market', 'negozio', 'ristorante', 'pizzeria',
      'bar', 'caffè', 'farmacia', 'libreria', 'tabacchi'
    ];
    
    // First try to find known merchants
    for (const keyword of merchantKeywords) {
      if (normalizedText.includes(keyword)) {
        // Find the line containing the keyword
        const merchantLine = lines.find(line => line.includes(keyword));
        if (merchantLine) {
          merchantName = merchantLine.trim();
          break;
        } else {
          merchantName = keyword;
          break;
        }
      }
    }
    
    // If no known merchant, try first line heuristic
    if (!merchantName && lines.length > 0) {
      // Usually the first line of a receipt is the store name if it's not a number or date
      const firstLine = lines[0].trim();
      if (firstLine && !firstLine.match(/^\d/) && firstLine.length > 3) {
        merchantName = firstLine;
      }
    }
    
    // Determine confidence level
    let confidence = 'Bassa affidabilità';
    if (amount && merchantName) {
      confidence = 'Alta affidabilità';
    } else if (amount || merchantName) {
      confidence = 'Media affidabilità';
    }
    
    // Build description combining merchant and amount
    const description = merchantName 
      ? `${merchantName.charAt(0).toUpperCase() + merchantName.slice(1)} ${amount ? `€${amount.toFixed(2)}` : ''}`
      : receiptText.split('\n')[0];
    
    // Create a transaction object using the extracted data
    const transaction: Transaction = {
      type: 'USCITA',
      amount: amount || 0,
      description: description.trim(),
      date: date,
      metadata: {
        source: 'receipt_image',
        rawText: receiptText,
        merchant: merchantName || undefined,
        confidence: confidence
      }
    };
    
    // Use the enhanced NLP processor to categorize the transaction
    const processedTransaction = enhancedNlpProcessor.processText(transaction.description);
    
    // Combine the NLP categorization with our receipt data
    if (processedTransaction) {
      return {
        ...processedTransaction,
        metadata: {
          ...processedTransaction.metadata,
          ...transaction.metadata
        }
      };
    }
    
    return transaction;
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
        description += ` e altri ${receiptData.items.length - 1} articoli`;
      }
    }
    
    // If we still don't have a description, use the text
    if (!description && receiptData.text) {
      description = receiptData.text.split('\n')[0];
    }
    
    // Determine confidence level
    let confidence = 'Bassa affidabilità';
    if (receiptData.amount && receiptData.merchant) {
      confidence = 'Alta affidabilità';
    } else if (receiptData.amount || receiptData.merchant) {
      confidence = 'Media affidabilità';
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
        items: receiptData.items,
        confidence: confidence
      }
    };
    
    // Use the enhanced NLP processor to categorize the transaction
    const processedTransaction = enhancedNlpProcessor.processText(transaction.description);
    
    // Combine the NLP categorization with our receipt data
    if (processedTransaction) {
      return {
        ...processedTransaction,
        metadata: {
          ...processedTransaction.metadata,
          ...transaction.metadata
        }
      };
    }
    
    return transaction;
  }
};

export default receiptProcessor;
