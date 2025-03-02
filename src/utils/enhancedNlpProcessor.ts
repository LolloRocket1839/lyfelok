
import { Transaction, TransactionType } from './transactionRouter';
import { NlpKnowledgeBase } from './nlp/knowledgeBase';
import { extractEntities } from './nlp/entityExtractor';
import { classifyTransactionType, determineSubcategory } from './nlp/classifier';
import { normalizeInput, correctTypos } from './nlp/textProcessor';
import { 
  enrichTransaction, 
  validateTransaction, 
  mapTypeToTransactionType, 
  determineDestination 
} from './nlp/transactionProcessor';
import { Entity, ClassificationResult, TransactionHistory } from './nlp/types';

interface RoutingResult {
  transaction: Transaction;
  destination: {
    module: string;
    action: string;
  };
  success: boolean;
}

/**
 * EnhancedNlpProcessor - Sistema avanzato per l'elaborazione di input in linguaggio naturale
 * con correzione automatica di errori, comprensione contestuale e categorizzazione finanziaria
 */
export class EnhancedNlpProcessor {
  private knowledgeBase: NlpKnowledgeBase;
  private confidenceThreshold: number;
  private userTransactionHistory: TransactionHistory[];
  private userSpecificRules: Record<string, any>;
  private userId: string | null;
  
  constructor() {
    this.userId = null;
    this.confidenceThreshold = 0.65;
    this.userTransactionHistory = [];
    this.userSpecificRules = {};
    this.knowledgeBase = new NlpKnowledgeBase();
  }
  
  /**
   * Imposta l'ID dell'utente per personalizzare l'elaborazione
   */
  setUserId(id: string): void {
    this.userId = id;
  }
  
  /**
   * Inizializza il processore NLP
   */
  initialize(): void {
    console.log('NLP Processor inizializzato per utente:', this.userId);
  }
  
  /**
   * Analizza l'input dell'utente e lo classifica nella categoria appropriata
   */
  analyzeText(input: string): any {
    // Fase 1: Normalizzazione e preprocessing
    const normalizedInput = normalizeInput(input);
    const originalInput = input;
    
    // Fase 2: Correzione degli errori di battitura
    const correctedInput = correctTypos(normalizedInput, this.knowledgeBase);
    const wasTypoCorrected = correctedInput !== normalizedInput;
    
    // Fase 3: Estrazione delle entità (importi, date, descrizioni)
    const extractedEntities = extractEntities(correctedInput);
    extractedEntities.originalInput = originalInput;
    extractedEntities.wasTypoCorrected = wasTypoCorrected;
    
    // Fase 4: Classificazione del tipo di transazione
    const classificationResult = classifyTransactionType(
      correctedInput, 
      extractedEntities, 
      this.knowledgeBase, 
      (entities, category) => this.getUserHistoryScore(entities, category)
    );
    
    // Fase 5: Arricchimento e normalizzazione delle entità
    const enrichedTransaction = enrichTransaction(extractedEntities, classificationResult);
    
    // Fase 6: Validazione e controllo di coerenza
    const validatedTransaction = validateTransaction(enrichedTransaction);
    
    // Fase 7: Routing della transazione alla funzionalità appropriata
    const result = this.routeTransaction(validatedTransaction);
    
    // Log dei risultati
    console.log('NLP Analysis result:', {
      input: originalInput,
      corrected: correctedInput,
      type: result.transaction.type,
      amount: result.transaction.amount,
      category: result.transaction.category,
      confidence: Math.round(result.transaction.confidence * 100) + '%'
    });
    
    return result.transaction;
  }
  
  /**
   * Calcola un punteggio basato sullo storico dell'utente
   */
  private getUserHistoryScore(entities: Entity, category: string): number {
    // Implementazione semplificata
    let score = 0;
    
    // Analizza lo storico dell'utente per pattern simili
    for (const transaction of this.userTransactionHistory) {
      // Se c'è una transazione simile nel passato
      if (transaction.entities.description.includes(entities.description) && 
          transaction.classification.type === this.getCategoryMapping(category)) {
        score += 3;
      }
    }
    
    return score;
  }
  
  /**
   * Mappa i nomi interni delle categorie ai tipi di transazione
   */
  private getCategoryMapping(category: string): string {
    const mapping: Record<string, string> = {
      'expenses': 'SPESA',
      'investments': 'INVESTIMENTO',
      'income': 'ENTRATA',
      'incomeIncrease': 'AUMENTO_REDDITO'
    };
    
    return mapping[category] || category;
  }
  
  /**
   * Instrada la transazione alla funzionalità appropriata dell'app
   */
  private routeTransaction(transaction: any): RoutingResult {
    // Aggiungi timestamp di elaborazione
    transaction.processedAt = new Date();
    
    // Aggiungi la transazione allo storico dell'utente
    this.updateUserHistory(transaction);
    
    // Formatta la transazione nel formato atteso dal router
    const routedTransaction: Transaction = {
      type: mapTypeToTransactionType(transaction.type),
      amount: transaction.amount || 0,
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.description || 'Transazione',
      category: transaction.category || undefined,
      metadata: transaction.metadata
    };
    
    // Preparazione del risultato per il routing
    const routingResult: RoutingResult = {
      transaction: routedTransaction,
      destination: determineDestination(transaction),
      success: true
    };
    
    return routingResult;
  }
  
  /**
   * Aggiorna lo storico dell'utente con la nuova transazione
   */
  private updateUserHistory(transaction: any): void {
    // Limitiamo lo storico a 50 transazioni per non sovraccaricare la memoria
    if (this.userTransactionHistory.length >= 50) {
      this.userTransactionHistory.shift(); // Rimuove l'elemento più vecchio
    }
    
    this.userTransactionHistory.push({
      timestamp: new Date(),
      entities: {
        description: transaction.description,
        amount: transaction.amount
      },
      classification: {
        type: transaction.type,
        category: transaction.category
      }
    });
  }
}

export default new EnhancedNlpProcessor();
