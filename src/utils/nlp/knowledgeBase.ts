export interface VariationMap {
  [key: string]: string;
}

export interface CategoryTerms {
  [key: string]: string[];
}

export interface CategoryVariations {
  [key: string]: string[];
}

export interface KnowledgeCategory {
  base: string[];
  variations: VariationMap;
  categories?: CategoryTerms;
  categoriesVariations?: CategoryVariations;
  instruments?: CategoryTerms;
  instrumentsVariations?: VariationMap;
  sources?: CategoryTerms;
  sourcesVariations?: VariationMap;
}

export interface KnowledgeBaseData {
  expenses: KnowledgeCategory;
  investments: KnowledgeCategory;
  income: KnowledgeCategory;
  incomeIncrease: KnowledgeCategory;
}

export class NlpKnowledgeBase {
  private knowledgeBase: KnowledgeBaseData;
  private localDictionary: any;
  
  constructor() {
    // Inizializzazione del knowledge base
    this.knowledgeBase = {
      expenses: {
        base: ['spesa', 'pagato', 'comprato', 'acquistato', 'speso', 'costo'],
        variations: {
          'spesa': 'speso',
          'pagato': 'pagamento',
          'comprato': 'compro',
          'acquistato': 'acquisto'
        },
        categories: {
          food: ['alimentari', 'cibo', 'ristorante', 'supermercato', 'spesa', 'mangiare', 'pranzo', 'cena', 'colazione', 'caffè'],
          rent: ['affitto', 'casa', 'appartamento', 'stanza', 'alloggio'],
          utility: ['bolletta', 'luce', 'gas', 'acqua', 'internet', 'telefono', 'elettricità'],
          transport: ['trasporto', 'autobus', 'treno', 'metro', 'taxi', 'carburante', 'benzina', 'diesel'],
          entertainment: ['divertimento', 'cinema', 'concerto', 'teatro', 'giochi', 'abbonamento', 'netflix', 'spotify'],
          health: ['salute', 'medico', 'farmacia', 'medicinale', 'visita', 'dottore', 'dentista'],
          education: ['educazione', 'corso', 'università', 'libri', 'scuola', 'lezioni']
        },
        categoriesVariations: {
          food: ['alimentare', 'ristoranti', 'supermercati'],
          rent: ['affitti', 'case', 'appartamenti', 'abitazione'],
          utility: ['bollette', 'fattura', 'utenze'],
          transport: ['trasporti', 'mezzi', 'viaggio', 'spostamenti'],
          entertainment: ['intrattenimento', 'svago', 'tempo libero', 'abbonamenti'],
          health: ['sanitario', 'sanitarie', 'medicine', 'farmaci'],
          education: ['formazione', 'studio', 'università', 'master']
        }
      },
      investments: {
        base: ['investimento', 'investito', 'azioni', 'etf', 'obbligazioni', 'fondo', 'risparmi'],
        variations: {
          'investimento': 'investito',
          'investire': 'investimento',
          'azioni': 'azionario',
          'obbligazioni': 'obbligazionario',
          'fondo': 'fondi'
        },
        categories: {
          stocks: ['azioni', 'titoli', 'borsa', 'nasdaq', 'dow jones', 'ftse', 'azionario'],
          etf: ['etf', 'exchange traded fund', 'index fund', 'indice', 'msci world', 'sp500', 'nasdaq'],
          bonds: ['obbligazioni', 'btp', 'treasury', 'bond', 'tasso fisso', 'governativo', 'corporate'],
          realestate: ['immobiliare', 'immobile', 'casa', 'appartamento', 'affitto', 'reit'],
          crypto: ['crypto', 'bitcoin', 'ethereum', 'altcoin', 'criptovalute', 'token', 'blockchain'],
          savings: ['risparmio', 'conto deposito', 'liquidità', 'salvadanaio', 'accantonare'],
          p2p: ['prestito', 'p2p', 'lending', 'crowdfunding', 'marketplace lending']
        },
        categoriesVariations: {
          stocks: ['azionario', 'società', 'aziende', 'mercato azionario'],
          etf: ['fondi indicizzati', 'tracker', 'etfs'],
          bonds: ['obbligazionario', 'titoli di stato', 'cedola', 'rendimento fisso'],
          realestate: ['real estate', 'proprietà', 'immobili', 'terreni'],
          crypto: ['criptovaluta', 'cripto', 'satoshi', 'mining', 'staking'],
          savings: ['risparmi', 'deposito', 'accumulare', 'accantonamento'],
          p2p: ['prestiti', 'credito', 'finanziamento', 'microfinanza']
        },
        instruments: {
          platforms: ['degiro', 'directa', 'fineco', 'ing', 'binance', 'coinbase', 'mintos', 'kraken']
        },
        instrumentsVariations: {
          'degiro': 'degiro bank',
          'directa': 'directa sim',
          'fineco': 'finecobank'
        }
      },
      income: {
        base: ['stipendio', 'entrata', 'ricevuto', 'incassato', 'guadagnato', 'reddito', 'salario'],
        variations: {
          'stipendio': 'stipendiato',
          'entrata': 'entrate',
          'ricevuto': 'ricevere',
          'incassato': 'incassare',
          'guadagnato': 'guadagno'
        },
        sources: {
          salary: ['stipendio', 'salario', 'busta paga', 'lavoro', 'mensile', 'fisso'],
          freelance: ['freelance', 'lavoro autonomo', 'partita iva', 'consulenza', 'progetto', 'cliente'],
          passive: ['passivo', 'dividendi', 'interessi', 'rendita', 'affitto', 'royalty', 'cedolare'],
          gifts: ['regalo', 'donazione', 'eredità', 'vincita', 'bonus', 'cashback']
        },
        sourcesVariations: {
          'salary': 'stipendi',
          'freelance': 'professionista',
          'passive': 'passivi',
          'gifts': 'regali'
        }
      },
      incomeIncrease: {
        base: ['aumento', 'promozione', 'incremento', 'maggiorazione', 'adeguamento', 'contratto', 'rinnovo'],
        variations: {
          'aumento': 'aumentato',
          'promozione': 'promosso',
          'incremento': 'incrementato',
          'maggiorazione': 'maggiorato'
        }
      }
    };
    
    // Vocabolario locale per correzione di specifici errori comuni in italiano
    this.localDictionary = {
      'speza': 'spesa',
      'investimento': 'investimento',
      'stippendio': 'stipendio',
      'afitto': 'affitto',
      'risparmi': 'risparmi',
      'azioni': 'azioni',
      'obbligazioni': 'obbligazioni',
      'etf': 'etf',
      'guadagno': 'guadagno',
      'mangiato': 'mangiato',
      'bolletta': 'bolletta',
      'boleta': 'bolletta',
      'bonifico': 'bonifico',
      'bonnifico': 'bonifico',
      'aquisto': 'acquisto',
      'pagatto': 'pagato',
      'riceuto': 'ricevuto',
      'aumento': 'aumento',
      'promosione': 'promozione'
    };
  }
  
  /**
   * Ottieni la base di conoscenza
   */
  getKnowledgeBase(): KnowledgeBaseData {
    return this.knowledgeBase;
  }
  
  /**
   * Ottieni il vocabolario locale
   */
  getLocalDictionary(): any {
    return this.localDictionary;
  }
}
