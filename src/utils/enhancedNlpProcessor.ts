
import { Transaction, TransactionType } from './transactionRouter';

interface Entity {
  amount: number | null;
  currency: string;
  date: Date;
  description: string;
  keywords: string[];
  wasTypoCorrected?: boolean;
  originalInput?: string;
}

interface ClassificationResult {
  type: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';
  confidence: number;
  subcategory: string | null;
  allScores: Record<string, number>;
}

interface TransactionHistory {
  timestamp: Date;
  entities: {
    description: string;
    amount: number;
  };
  classification: {
    type: string;
    category: string | null;
  };
}

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
  private knowledgeBase: any;
  private confidenceThreshold: number;
  private userTransactionHistory: TransactionHistory[];
  private userSpecificRules: Record<string, any>;
  private userId: string | null;
  
  constructor() {
    this.userId = null;
    this.confidenceThreshold = 0.65;
    this.userTransactionHistory = [];
    this.userSpecificRules = {};
    
    // Database di conoscenza finanziaria
    this.knowledgeBase = {
      // Termini relativi alle SPESE con possibili errori di battitura
      expenses: {
        base: ['spesa', 'pagato', 'comprato', 'acquistato', 'costo', 'uscita'],
        variations: {
          'spsa': 'spesa', 'speza': 'spesa', 'spessa': 'spesa',
          'pagto': 'pagato', 'paggato': 'pagato', 'paghato': 'pagato',
          'conprato': 'comprato', 'comprao': 'comprato', 'comperato': 'comprato',
          'acquistao': 'acquistato', 'acquistto': 'acquistato', 'aquistat': 'acquistato',
          'costo': 'costo', 'coto': 'costo', 'cst': 'costo',
          'uscta': 'uscita', 'usita': 'uscita', 'uscit': 'uscita'
        },
        categories: {
          'cibo': ['pizza', 'ristorante', 'pranzo', 'cena', 'supermercato', 'spesa', 'bar', 'caffè', 'gelato', 'panino'],
          'casa': ['affitto', 'mutuo', 'bolletta', 'luce', 'gas', 'acqua', 'wifi', 'condominio', 'riparazione'],
          'trasporti': ['benzina', 'carburante', 'treno', 'bus', 'metro', 'taxi', 'uber', 'aereo', 'biglietto'],
          'intrattenimento': ['cinema', 'teatro', 'concerto', 'netflix', 'spotify', 'disney', 'abbonamento', 'videogioco'],
          'salute': ['farmacia', 'medico', 'dottore', 'visita', 'esame', 'analisi', 'dentista', 'terapia', 'palestra'],
          'abbigliamento': ['vestiti', 'scarpe', 'giacca', 'pantaloni', 'camicia', 'maglia', 'jeans', 'cappotto']
        },
        categoriesVariations: {
          "cibo": ["food", "groceries", "cibo", "alimentari", "supermercato", "spesa", "pranzo", "cena", "colazione", "pizza", "ristorante"],
          "trasporti": ["transport", "travel", "trasporti", "trasporto", "treno", "metro", "bus", "taxi", "uber", "carburante", "benzina", "gasolio", "autostrada", "pedaggio"],
          "casa": ["house", "home", "casa", "affitto", "mutuo", "bollette", "condominio", "arredamento", "manutenzione"],
          "salute": ["health", "medical", "salute", "medico", "farmacia", "dottore", "dentista", "terapia", "visita"],
          "entertainment": ["entertainment", "leisure", "intrattenimento", "svago", "divertimento", "cinema", "teatro", "concerto", "hobby", "streaming", "abbonamento"],
          "educazione": ["education", "learning", "educazione", "formazione", "corso", "università", "libri", "studio"],
          "abbigliamento": ["clothing", "abbigliamento", "vestiti", "scarpe", "accessori", "moda"],
          "tecnologia": ["technology", "tech", "tecnologia", "elettronica", "dispositivi", "computer", "smartphone", "gadget"],
          "altro": ["other", "altro", "varie", "extra", "misc"]
        }
      },
      
      // Termini relativi agli INVESTIMENTI con possibili errori di battitura
      investments: {
        base: ['investito', 'investimento', 'depositato', 'risparmiato', 'messo', 'comprato'],
        variations: {
          'invstito': 'investito', 'investio': 'investito', 'ivestito': 'investito',
          'investimeno': 'investimento', 'invstimento': 'investimento', 'investmento': 'investimento',
          'depstato': 'depositato', 'depositao': 'depositato', 'depostato': 'depositato',
          'risparmato': 'risparmiato', 'risparmito': 'risparmiato', 'rispariato': 'risparmiato',
          'mess': 'messo', 'meso': 'messo', 'mezzo': 'messo'
        },
        instruments: {
          'azioni': ['azione', 'azioni', 'titolo', 'titoli', 'borsa', 'azionario'],
          'etf': ['etf', 'fondo', 'index', 'indice', 'indicizzato', 'vanguard', 'ishares', 'lyxor'],
          'crypto': ['bitcoin', 'ethereum', 'crypto', 'criptovaluta', 'btc', 'eth', 'altcoin'],
          'obbligazioni': ['obbligazione', 'bond', 'btp', 'cct', 'buono', 'tesoro', 'governativo'],
          'immobiliare': ['immobile', 'casa', 'terreno', 'reit', 'affitto', 'rent', 'noleggio'],
          'liquidità': ['conto', 'deposito', 'liquidità', 'risparmio', 'cd', 'certificato', 'bancario']
        },
        instrumentsVariations: {
          'azone': 'azione', 'azzione': 'azione', 'titol': 'titolo',
          'ef': 'etf', 'bitcon': 'bitcoin', 'bitcoi': 'bitcoin',
          'cripto': 'crypto', 'obligazione': 'obbligazione', 'obbl': 'obbligazione',
          'imobile': 'immobile', 'imobiliare': 'immobiliare'
        }
      },
      
      // Termini relativi agli ENTRATE con possibili errori di battitura
      income: {
        base: ['ricevuto', 'guadagnato', 'incassato', 'entrata', 'stipendio', 'rimborso', 'pagamento'],
        variations: {
          'ricevto': 'ricevuto', 'ricevuo': 'ricevuto', 'ricevut': 'ricevuto',
          'guadagnto': 'guadagnato', 'guadagnat': 'guadagnato', 'guadagno': 'guadagnato',
          'incasato': 'incassato', 'incassao': 'incassato', 'incassatoo': 'incassato',
          'entata': 'entrata', 'entrta': 'entrata', 'entrataa': 'entrata',
          'stipendo': 'stipendio', 'stipendyo': 'stipendio', 'stipndio': 'stipendio',
          'rimborzo': 'rimborso', 'rimborsso': 'rimborso', 'rimbrso': 'rimborso',
          'pagameno': 'pagamento', 'pagament': 'pagamento', 'pagamneto': 'pagamento'
        },
        sources: {
          'lavoro': ['stipendio', 'salario', 'compenso', 'consulenza', 'freelance', 'parcella', 'fattura'],
          'extra': ['bonus', 'premio', 'incentivo', 'commissione', 'straordinario', 'tredicesima', 'quattordicesima'],
          'passivo': ['affitto', 'rendita', 'dividendo', 'royalty', 'interesse', 'cedola'],
          'occasionale': ['vendita', 'regalo', 'rimborso', 'cashback', 'lotteria', 'vincita', 'donazione']
        },
        sourcesVariations: {
          'stpendio': 'stipendio', 'salrio': 'salario', 'bonuss': 'bonus',
          'divdendo': 'dividendo', 'divident': 'dividendo', 'intresse': 'interesse'
        }
      },
      
      // Termini relativi agli AUMENTI DI REDDITO con possibili errori di battitura
      incomeIncrease: {
        base: ['aumento', 'promozione', 'avanzamento', 'incremento', 'adeguamento', 'nuovo stipendio', 'nuovo lavoro'],
        variations: {
          'aumeto': 'aumento', 'aumnt': 'aumento', 'aumennto': 'aumento',
          'promzione': 'promozione', 'promozine': 'promozione', 'promzione': 'promozione',
          'avanzameto': 'avanzamento', 'avanzment': 'avanzamento', 'avanzament': 'avanzamento',
          'incremeto': 'incremento', 'incr': 'incremento', 'increment': 'incremento',
          'adeguameto': 'adeguamento', 'adegument': 'adeguamento', 'adeg': 'adeguamento',
          'nuovostipendio': 'nuovo stipendio', 'nuovolavoro': 'nuovo lavoro'
        }
      }
    };
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
    const normalizedInput = this.normalizeInput(input);
    const originalInput = input;
    
    // Fase 2: Correzione degli errori di battitura
    const correctedInput = this.correctTypos(normalizedInput);
    const wasTypoCorrected = correctedInput !== normalizedInput;
    
    // Fase 3: Estrazione delle entità (importi, date, descrizioni)
    const extractedEntities = this.extractEntities(correctedInput);
    extractedEntities.originalInput = originalInput;
    extractedEntities.wasTypoCorrected = wasTypoCorrected;
    
    // Fase 4: Classificazione del tipo di transazione
    const classificationResult = this.classifyTransactionType(correctedInput, extractedEntities);
    
    // Fase 5: Arricchimento e normalizzazione delle entità
    const enrichedTransaction = this.enrichTransaction(extractedEntities, classificationResult);
    
    // Fase 6: Validazione e controllo di coerenza
    const validatedTransaction = this.validateTransaction(enrichedTransaction);
    
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
   * Normalizza l'input dell'utente (lowercase, rimozione spazi extra, ecc.)
   */
  private normalizeInput(input: string): string {
    let normalized = input.toLowerCase().trim();
    // Normalizza spazi multipli
    normalized = normalized.replace(/\s+/g, ' ');
    // Normalizza formati numerici (1.000,50 -> 1000.50)
    normalized = normalized.replace(/(\d+)\.(\d{3}),(\d{1,2})/g, '$1$2.$3');
    // Normalizza anche formato con virgola (1000,50 -> 1000.50)
    normalized = normalized.replace(/(\d+),(\d{1,2})/g, '$1.$2');
    // Normalizza simboli di valuta
    normalized = normalized.replace(/€/g, 'euro');
    normalized = normalized.replace(/\$/g, 'dollari');
    normalized = normalized.replace(/£/g, 'sterline');
    
    return normalized;
  }
  
  /**
   * Corregge gli errori di battitura confrontando con i termini noti
   */
  private correctTypos(input: string): string {
    let corrected = input;
    const words = input.split(' ');
    
    // Per ogni parola dell'input
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let correctedWord = null;
      
      // Controlla in tutte le categorie di conoscenza
      for (const category of ['expenses', 'investments', 'income', 'incomeIncrease']) {
        // Controlla nelle variazioni dirette
        if (this.knowledgeBase[category].variations[word]) {
          correctedWord = this.knowledgeBase[category].variations[word];
          break;
        }
        
        // Controlla nelle sottocategorie se presenti
        if (this.knowledgeBase[category].categoriesVariations && 
            this.knowledgeBase[category].categoriesVariations[word]) {
          correctedWord = this.knowledgeBase[category].categoriesVariations[word];
          break;
        }
        
        // Controlla nelle variazioni degli strumenti se presenti
        if (this.knowledgeBase[category].instrumentsVariations && 
            this.knowledgeBase[category].instrumentsVariations[word]) {
          correctedWord = this.knowledgeBase[category].instrumentsVariations[word];
          break;
        }
        
        // Controlla nelle variazioni delle fonti se presenti
        if (this.knowledgeBase[category].sourcesVariations && 
            this.knowledgeBase[category].sourcesVariations[word]) {
          correctedWord = this.knowledgeBase[category].sourcesVariations[word];
          break;
        }
      }
      
      // Se è stata trovata una correzione, sostituisci la parola
      if (correctedWord) {
        words[i] = correctedWord;
      }
    }
    
    return words.join(' ');
  }
  
  /**
   * Estrae entità significative dall'input (importi, date, descrizioni)
   */
  private extractEntities(input: string): Entity {
    const entities: Entity = {
      amount: null,
      currency: 'EUR', // Default
      date: new Date(), // Default a oggi
      description: '',
      keywords: []
    };
    
    // Estrai importo
    const amountMatch = input.match(/\b(\d+(?:\.\d{1,2})?)\b/);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1]);
      // Rimuovi l'importo per l'elaborazione successiva
      input = input.replace(amountMatch[0], '');
    }
    
    // Estrai valuta
    const currencyMatches: Record<string, string> = {
      'euro': 'EUR',
      'dollari': 'USD',
      'sterline': 'GBP'
    };
    
    for (const [term, code] of Object.entries(currencyMatches)) {
      if (input.includes(term)) {
        entities.currency = code;
        // Rimuovi il termine valuta
        input = input.replace(term, '');
        break;
      }
    }
    
    // Estrai parole chiave significative (stop words rimosse)
    const stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra'];
    entities.keywords = input.split(' ')
      .filter(word => word.length > 2) // Parole troppo brevi ignorate
      .filter(word => !stopWords.includes(word)) // Rimuovi stop words
      .filter(word => !/^\d+$/.test(word)); // Rimuovi numeri puri
    
    // Usa le parole rimanenti come descrizione
    entities.description = input.trim();
    
    return entities;
  }
  
  /**
   * Classifica il tipo di transazione tra SPESA, ENTRATA, INVESTIMENTO, AUMENTO_REDDITO
   */
  private classifyTransactionType(input: string, entities: Entity): ClassificationResult {
    // Calcola punteggi per ogni categoria
    const scores: Record<string, number> = {
      SPESA: this.calculateCategoryScore(input, entities, 'expenses'),
      ENTRATA: this.calculateCategoryScore(input, entities, 'income'),
      INVESTIMENTO: this.calculateCategoryScore(input, entities, 'investments'),
      AUMENTO_REDDITO: this.calculateCategoryScore(input, entities, 'incomeIncrease')
    };
    
    // Normalizza i punteggi
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const normalizedScores: Record<string, number> = {};
    
    for (const [category, score] of Object.entries(scores)) {
      normalizedScores[category] = total > 0 ? score / total : 0;
    }
    
    // Trova la categoria con il punteggio più alto
    let maxCategory: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO' = 'SPESA'; // Default
    let maxScore = 0;
    
    for (const [category, score] of Object.entries(normalizedScores)) {
      if (score > maxScore) {
        maxScore = score;
        maxCategory = category as any;
      }
    }
    
    // Determina la sottocategoria (se applicabile)
    let subcategory = null;
    
    if (maxCategory === 'SPESA') {
      subcategory = this.determineSubcategory(input, entities, this.knowledgeBase.expenses.categories);
    } else if (maxCategory === 'INVESTIMENTO') {
      subcategory = this.determineSubcategory(input, entities, this.knowledgeBase.investments.instruments);
    } else if (maxCategory === 'ENTRATA') {
      subcategory = this.determineSubcategory(input, entities, this.knowledgeBase.income.sources);
    }
    
    return {
      type: maxCategory,
      confidence: maxScore,
      subcategory: subcategory,
      allScores: normalizedScores
    };
  }
  
  /**
   * Calcola il punteggio di una categoria in base all'input e alle entità
   */
  private calculateCategoryScore(input: string, entities: Entity, category: string): number {
    let score = 0;
    const words = input.split(' ');
    
    // Punteggio per termini base
    for (const term of this.knowledgeBase[category].base) {
      if (input.includes(term)) {
        score += 10; // Peso maggiore per termini base
      }
    }
    
    // Punteggio per parole chiave in sottocategorie/strumenti/fonti
    for (const subcategoryKey in this.knowledgeBase[category]) {
      if (typeof this.knowledgeBase[category][subcategoryKey] === 'object' && 
          !Array.isArray(this.knowledgeBase[category][subcategoryKey])) {
        
        for (const subcat in this.knowledgeBase[category][subcategoryKey]) {
          if (Array.isArray(this.knowledgeBase[category][subcategoryKey][subcat])) {
            for (const term of this.knowledgeBase[category][subcategoryKey][subcat]) {
              if (input.includes(term)) {
                score += 5; // Peso per termini di sottocategoria
              }
            }
          }
        }
      }
    }
    
    // Considera anche lo storico dell'utente
    score += this.getUserHistoryScore(entities, category);
    
    return score;
  }
  
  /**
   * Determina la sottocategoria più probabile
   */
  private determineSubcategory(input: string, entities: Entity, subcategories: Record<string, string[]>): string | null {
    let maxScore = 0;
    let bestSubcategory = null;
    
    for (const [subcategory, terms] of Object.entries(subcategories)) {
      let score = 0;
      
      for (const term of terms) {
        if (input.includes(term)) {
          score += 1;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestSubcategory = subcategory;
      }
    }
    
    return bestSubcategory;
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
   * Arricchisce la transazione con informazioni aggiuntive
   */
  private enrichTransaction(entities: Entity, classification: ClassificationResult): any {
    const transaction = {
      type: classification.type,
      amount: entities.amount,
      currency: entities.currency,
      date: entities.date,
      description: entities.description,
      category: classification.subcategory,
      confidence: classification.confidence,
      metadata: {
        corrected: (entities.wasTypoCorrected === true),
        originalInput: entities.originalInput,
        allScores: classification.allScores,
        extractedKeywords: entities.keywords,
        warnings: [] as string[],
        corrections: [] as string[]
      }
    };
    
    // Modifica l'importo in base al tipo di transazione
    if (transaction.type === 'SPESA') {
      // Per le spese, l'importo è negativo se non lo è già
      transaction.amount = Math.abs(transaction.amount as number) * -1;
    } else {
      // Per altri tipi, l'importo è positivo
      transaction.amount = Math.abs(transaction.amount as number);
    }
    
    return transaction;
  }
  
  /**
   * Valida la transazione e controlla la coerenza dei dati
   */
  private validateTransaction(transaction: any): any {
    const validated = { ...transaction };
    const currentDate = new Date();
    
    // Controlla la presenza dell'importo
    if (validated.amount === null || isNaN(validated.amount)) {
      validated.amount = 0; // Default
      validated.metadata.warnings.push('missing_amount');
    }
    
    // Controlla la validità della data
    if (!(validated.date instanceof Date) || isNaN(validated.date.getTime())) {
      validated.date = currentDate; // Default a oggi
      validated.metadata.warnings.push('invalid_date');
    }
    
    // Non permettere date future (a meno che non sia un'entrata ricorrente)
    if (validated.date > currentDate && validated.type !== 'ENTRATA') {
      validated.date = currentDate;
      validated.metadata.warnings.push('future_date');
    }
    
    // Controlla la coerenza tra tipo e importo
    if (validated.type === 'SPESA' && validated.amount > 0) {
      validated.amount *= -1;
      validated.metadata.corrections.push('amount_sign_corrected');
    }
    
    return validated;
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
      type: this.mapTypeToTransactionType(transaction.type),
      amount: transaction.amount || 0,
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.description || 'Transazione',
      category: transaction.category || undefined,
      metadata: transaction.metadata
    };
    
    // Preparazione del risultato per il routing
    const routingResult: RoutingResult = {
      transaction: routedTransaction,
      destination: this.determineDestination(transaction),
      success: true
    };
    
    return routingResult;
  }
  
  /**
   * Maps the internal type to TransactionType enum
   */
  private mapTypeToTransactionType(type: string): TransactionType {
    switch(type) {
      case 'SPESA':
        return 'USCITA';
      case 'ENTRATA':
        return 'ENTRATA';
      case 'INVESTIMENTO':
        return 'INVESTIMENTO';
      case 'AUMENTO_REDDITO':
        return 'AUMENTO_REDDITO';
      default:
        return 'USCITA'; // Default fallback
    }
  }
  
  /**
   * Determina la destinazione appropriata per la transazione
   */
  private determineDestination(transaction: any): { module: string, action: string } {
    switch (transaction.type) {
      case 'SPESA':
        return { module: 'expenses', action: 'add' };
      case 'ENTRATA':
        return { module: 'income', action: 'add' };
      case 'INVESTIMENTO':
        return { module: 'investments', action: 'add' };
      case 'AUMENTO_REDDITO':
        return { module: 'income', action: 'update_base' };
      default:
        return { module: 'transactions', action: 'add' };
    }
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
