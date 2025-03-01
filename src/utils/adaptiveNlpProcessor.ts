
// Aggiungo le definizioni dei tipi per NlpAnalysisResult
export interface NlpAnalysisResult {
  type: 'spesa' | 'entrata' | 'investimento';
  amount: number;
  category: string;
  date: string;
  baselineAmount: number;
  confidence: 'high' | 'medium' | 'low';
  needsFeedback?: boolean; // Aggiunto campo needsFeedback
  unknownWords?: string[]; // Parole che potrebbero richiedere feedback
  description?: string;    // Descrizione della transazione
  metadata?: {             // Metadati aggiuntivi per la transazione
    rawInput?: string;     // Input originale
    processingTime?: Date; // Timestamp dell'elaborazione
    corrected?: boolean;   // Se la transazione è stata corretta
  };
  alternativeCategories?: string[]; // Categorie alternative suggerite
}

// Classe del processore NLP migliorato con funzionalità di CashTalk v2.0
class AdaptiveNlpProcessor {
  private userId: string | null = null;
  private initialized: boolean = false;
  private userPreferences: Record<string, any> = {};
  private transactionHistory: any[] = [];
  private categoryMappings: Record<string, string> = {};
  private pendingFeedbackWords: Array<{word: string, guessedCategory: string}> = []; // Parole in attesa di feedback
  private userPatterns: Array<{description: string, category: string, similarity: number}> = []; // Pattern di transazioni dell'utente

  // Imposta l'ID utente
  setUserId(id: string): void {
    this.userId = id;
  }

  // Inizializza il processore
  initialize(): void {
    if (this.userId) {
      // Qui potremmo caricare preferenze utente da un database
      this.userPreferences = {
        preferredCategories: ['Cibo', 'Trasporto', 'Alloggio', 'Intrattenimento'],
        defaultCurrency: 'EUR',
        language: 'it',
      };
      
      // Inizializza mappature di categoria personalizzate
      this.categoryMappings = {
        'ristorante': 'Cibo',
        'bar': 'Cibo',
        'pizza': 'Cibo',
        'pranzo': 'Cibo',
        'cena': 'Cibo',
        'colazione': 'Cibo',
        'caffè': 'Cibo',
        'gelato': 'Cibo',
        'spesa': 'Cibo',
        'supermercato': 'Cibo',
        'dolce': 'Cibo',
        
        'treno': 'Trasporto',
        'bus': 'Trasporto',
        'taxi': 'Trasporto',
        'benzina': 'Trasporto',
        'carburante': 'Trasporto',
        'metro': 'Trasporto',
        'biglietto': 'Trasporto',
        'aereo': 'Trasporto',
        'volo': 'Trasporto',
        'parcheggio': 'Trasporto',
        'autostrada': 'Trasporto',
        'pedaggio': 'Trasporto',
        
        'affitto': 'Alloggio',
        'bolletta': 'Alloggio',
        'luce': 'Alloggio',
        'gas': 'Alloggio',
        'acqua': 'Alloggio',
        'internet': 'Alloggio',
        'telefono': 'Alloggio',
        'wifi': 'Alloggio',
        'condominio': 'Alloggio',
        'mutuo': 'Alloggio',
        
        'netflix': 'Intrattenimento',
        'cinema': 'Intrattenimento',
        'concerto': 'Intrattenimento',
        'teatro': 'Intrattenimento',
        'spotify': 'Intrattenimento',
        'abbonamento': 'Intrattenimento',
        'videogioco': 'Intrattenimento',
        'libro': 'Intrattenimento',
        'musica': 'Intrattenimento',
        'streaming': 'Intrattenimento',
        'evento': 'Intrattenimento',
        'mostra': 'Intrattenimento',
        'museo': 'Intrattenimento',
        
        'farmacia': 'Salute',
        'medico': 'Salute',
        'dottore': 'Salute',
        'visita': 'Salute',
        'esame': 'Salute',
        'dentista': 'Salute',
        'medicinale': 'Salute',
        'farmaco': 'Salute',
        'terapia': 'Salute',
        'ospedale': 'Salute',
        'palestra': 'Salute',
        
        'vestiti': 'Shopping',
        'scarpe': 'Shopping',
        'camicia': 'Shopping',
        'pantaloni': 'Shopping',
        'maglia': 'Shopping',
        'giacca': 'Shopping',
        'accessorio': 'Shopping',
        'borsa': 'Shopping',
        'zaino': 'Shopping',
        'negozio': 'Shopping',
        'abbigliamento': 'Shopping',
        
        'stipendio': 'Stipendio',
        'salario': 'Stipendio',
        'bonus': 'Bonus',
        'rimborso': 'Rimborsi',
        'premio': 'Bonus',
        
        'investimento': 'ETF',
        'azioni': 'Azioni',
        'etf': 'ETF',
        'fondo': 'Fondi',
        'crypto': 'Crypto',
        'bitcoin': 'Crypto',
        'obbligazioni': 'Obbligazioni',
        'bond': 'Obbligazioni',
      };
      
      this.initialized = true;
      console.log('NLP Processor inizializzato per utente:', this.userId);
    } else {
      console.warn('Impossibile inizializzare NLP Processor: ID utente mancante');
    }
  }

  // Normalizza il testo dell'input (nuova funzionalità da CashTalk v2.0)
  normalizeText(text: string): string {
    // Rimuovi caratteri speciali 
    let normalized = text.toLowerCase().trim();
    
    // Normalizza formati numerici (1.000,00 -> 1000.00)
    const euroFormat = /(\d{1,3}(?:\.\d{3})+),(\d{2})/g;
    normalized = normalized.replace(euroFormat, (match, intPart, decimalPart) => {
      return intPart.replace(/\./g, '') + '.' + decimalPart;
    });
    
    // Gestione casi con solo virgola (10,50)
    const commaFormat = /(\d+),(\d{2})\b/g;
    normalized = normalized.replace(commaFormat, '$1.$2');
    
    // Espandi abbreviazioni comuni
    const abbreviations: Record<string, string> = {
      'stip': 'stipendio',
      'rist': 'ristorante',
      'risc': 'riscaldamento',
      'sup': 'supermercato',
      'carb': 'carburante',
      'benzina': 'carburante',
      'bolla': 'bolletta',
      'spesa': 'supermercato',
    };
    
    for (const [abbr, full] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      normalized = normalized.replace(regex, full);
    }
    
    // Normalizza simboli di valuta
    const currencyMap: Record<string, string> = {
      '€': 'euro',
      '$': 'dollari',
      '£': 'sterline',
      'eur': 'euro',
      'usd': 'dollari',
      'gbp': 'sterline',
    };
    
    for (const [symbol, name] of Object.entries(currencyMap)) {
      // Sostituisci sia prima che dopo il numero
      normalized = normalized.replace(new RegExp(`${symbol}\\s*(\\d+)`, 'g'), `$1 ${name}`);
      normalized = normalized.replace(new RegExp(`(\\d+)\\s*${symbol}`, 'g'), `$1 ${name}`);
    }
    
    return normalized;
  }

  // Analizza il testo e restituisce un risultato strutturato
  analyzeText(text: string): NlpAnalysisResult {
    if (!this.initialized) {
      console.warn('NLP Processor non inizializzato, risultati potrebbero essere imprecisi');
    }
    
    // Normalizza il testo prima dell'analisi (nuova funzionalità)
    const normalizedText = this.normalizeText(text);
    console.log('Testo normalizzato:', normalizedText);
    
    // Utilizziamo una funzione di analisi testuale più avanzata
    const baseResult = this.performTextAnalysis(normalizedText);
    
    // Verifica che il tipo sia valido
    const validTypes = ['spesa', 'entrata', 'investimento'] as const;
    let validatedType: 'spesa' | 'entrata' | 'investimento' = 'spesa'; // Valore predefinito
    
    if (validTypes.includes(baseResult.type as any)) {
      validatedType = baseResult.type as 'spesa' | 'entrata' | 'investimento';
    } else {
      console.warn(`Tipo non valido: ${baseResult.type}, impostato a 'spesa'`);
    }
    
    // Cerchiamo pattern simili tra le transazioni precedenti
    let alternativeCategories: string[] = [];
    if (this.userPatterns.length > 0 && baseResult.description) {
      const similarPatterns = this.findSimilarPatterns(baseResult.description);
      
      // Se troviamo pattern simili, aggiungiamo le loro categorie come alternative
      if (similarPatterns.length > 0) {
        alternativeCategories = similarPatterns
          .map(p => p.category)
          .filter((c, i, self) => self.indexOf(c) === i); // Rimuovi duplicati
      }
    }
    
    // Costruiamo un oggetto di risposta correttamente tipizzato
    const result: NlpAnalysisResult = {
      type: validatedType,
      amount: baseResult.amount,
      category: baseResult.category,
      date: baseResult.date,
      baselineAmount: baseResult.baselineAmount,
      confidence: baseResult.confidence,
      needsFeedback: baseResult.needsFeedback || false,
      unknownWords: baseResult.unknownWords || [],
      description: baseResult.description,
      metadata: {
        rawInput: normalizedText,
        processingTime: new Date(),
        corrected: false
      },
      alternativeCategories: alternativeCategories.length > 0 ? alternativeCategories : undefined
    };
    
    // Memorizza questa transazione nella cronologia
    this.transactionHistory.push({
      ...result,
      originalText: text,
      timestamp: new Date()
    });
    
    // Se ci sono parole sconosciute, aggiungiamole alle parole in attesa di feedback
    if (result.needsFeedback && result.unknownWords && result.unknownWords.length > 0) {
      result.unknownWords.forEach(word => {
        // Verifica se la parola è già in attesa di feedback
        const alreadyPending = this.pendingFeedbackWords.some(item => item.word === word);
        if (!alreadyPending) {
          this.pendingFeedbackWords.push({
            word: word,
            guessedCategory: result.category
          });
        }
      });
    }
    
    return result;
  }

  // Funzione interna per analizzare il testo
  private performTextAnalysis(text: string): any {
    const lowerText = text.toLowerCase();
    
    // Oggetto risultato predefinito
    let result = {
      unknownWords: [] as string[],
      needsFeedback: false,
      type: 'spesa', // Default a spesa
      amount: 0,
      category: 'Altro',
      date: new Date().toISOString().split('T')[0], // Data odierna
      baselineAmount: 0, // Per le spese, sarà uguale all'amount come valore predefinito
      confidence: 'medium' as 'high' | 'medium' | 'low',
      description: '' // Descrizione della transazione
    };
    
    // Dizionari estesi per tipi di transazione
    const spesaPatterns = [
      "spes[ao]", "pagat[ao]", "comprat[ao]", "acquistat[ao]", "pres[ao]", 
      "pagamento", "bolletta", "fattura", "conto", "rata", "addebito", "prelevato",
      "addebitato", "scalato", "acquisto", "prelievo", "estratto", "bancomat", "pos"
    ];

    const entrataPatterns = [
      "ricevut[ao]", "stipendio", "salario", "entrat[ao]", "guadagnat[ao]", 
      "incassat[ao]", "bonific[ao]", "entrate", "accredit[ao]", "ricevut[ea]", 
      "percepito", "ottenuto", "guadagno", "profitto", "incasso", "rendita"
    ];

    const investimentoPatterns = [
      "investit[ao]", "comprato azioni", "comprato etf", "acquistat[ao] azioni", 
      "messo da parte", "risparmiat[ao]", "deposit[ao]", "versament[ao]",
      "allocat[ao]", "crypto", "trading", "investiment[io]", "fond[io]"
    ];
    
    // Determina il tipo di transazione con pattern matching più avanzato
    let typeScore = {
      spesa: 0,
      entrata: 0,
      investimento: 0
    };
    
    // Verifica pattern di spesa
    spesaPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        typeScore.spesa += 1;
      }
    });
    
    // Verifica semplice per parole chiave di spesa
    ["speso", "pagato", "comprato", "acquistato", "bolletta", "fattura"].forEach(word => {
      if (lowerText.includes(word)) {
        typeScore.spesa += 2;
      }
    });
    
    // Verifica pattern di entrata
    entrataPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        typeScore.entrata += 1;
      }
    });
    
    // Verifica semplice per parole chiave di entrata
    ["ricevuto", "stipendio", "salario", "guadagnato", "incassato", "accreditato", "bonifico"].forEach(word => {
      if (lowerText.includes(word)) {
        typeScore.entrata += 2;
      }
    });
    
    // Verifica pattern di investimento
    investimentoPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        typeScore.investimento += 1;
      }
    });
    
    // Verifica semplice per parole chiave di investimento
    ["investito", "etf", "azioni", "bond", "crypto", "bitcoin", "ethereum", "obbligazioni"].forEach(word => {
      if (lowerText.includes(word)) {
        typeScore.investimento += 2;
      }
    });
    
    // Estrai importo con pattern matching avanzato per vari formati
    const amountPatterns = [
      /(\d+[.,]?\d*)[ ]?[€$]/g,                    // 25€, 25.50€
      /[€$][ ]?(\d+[.,]?\d*)/g,                    // €25, € 25.50
      /(\d+[.,]?\d*)[ ]?euro/gi,                   // 25 euro
      /(\d+[.,]?\d*)[ ]?€uro/gi,                   // 25 €uro (variante)
      /(\d+[.,]?\d*)(?: |-)?(eur|euro|euri|euros)/gi, // 25 eur, 25-euro, 25euro
      /(\d+)[.,](\d{1,2})[ ]?(?:euro|eur|€)/gi,   // 25,50 euro o 25.50 euro
      /(?:euro|eur|€)[ ]?(\d+)[.,](\d{1,2})/gi,   // euro 25,50 o € 25.50
      /(?:speso|pagato|costa|costato|prezzo|costo|importo di) (?:circa |quasi |poco più di |poco meno di )?(?:€|euro|eur)? ?(\d+[.,]?\d*)(?: ?€| ?euro| ?eur)?/gi // ho speso circa 25 euro, ho pagato 25€
    ];
    
    let amountMatch = null;
    let highestConfidence = 0;
    
    for (const pattern of amountPatterns) {
      const matches = [...lowerText.matchAll(pattern)];
      if (matches.length > 0) {
        // Assegna una confidenza alla corrispondenza in base alla posizione e alla completezza
        for (const match of matches) {
          const value = match[1];
          const confidence = value.length + (1 / (match.index + 1)); // Maggiore lunghezza e posizione anticipata = maggiore confidenza
          
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            if (match[2] && match[1].indexOf(',') === -1 && match[1].indexOf('.') === -1) {
              // Se abbiamo catturato separatamente il numero e i decimali (es: 25,50)
              amountMatch = `${match[1]}.${match[2]}`;
            } else {
              amountMatch = match[1];
            }
          }
        }
      }
    }
    
    // NUOVA FUNZIONALITÀ: Pattern semplici senza verbo (analisi ellittica)
    // Se non abbiamo trovato un importo, cerchiamo pattern come "30 pizza" o "pizza 30"
    if (!amountMatch) {
      // Pattern: NUMERO + PAROLA (es: "30 pizza")
      const importoOggettoPattern = /(\d+[.,]?\d*)\s+([a-z]+)/i;
      const importoOggettoMatch = lowerText.match(importoOggettoPattern);
      
      if (importoOggettoMatch) {
        amountMatch = importoOggettoMatch[1].replace(',', '.');
        // Aggiungiamo bonus al contesto della categoria
        const possibleCategory = importoOggettoMatch[2];
        if (this.categoryMappings[possibleCategory]) {
          result.category = this.categoryMappings[possibleCategory];
          result.confidence = 'high';
        } else {
          // Se non conosciamo questa parola, potremmo richiedere feedback
          result.unknownWords.push(possibleCategory);
          result.needsFeedback = true;
        }
      } else {
        // Pattern: PAROLA + NUMERO (es: "pizza 30")
        const oggettoImportoPattern = /([a-z]+)\s+(\d+[.,]?\d*)/i;
        const oggettoImportoMatch = lowerText.match(oggettoImportoPattern);
        
        if (oggettoImportoMatch) {
          amountMatch = oggettoImportoMatch[2].replace(',', '.');
          // Aggiungiamo bonus al contesto della categoria
          const possibleCategory = oggettoImportoMatch[1];
          if (this.categoryMappings[possibleCategory]) {
            result.category = this.categoryMappings[possibleCategory];
            result.confidence = 'high';
          } else {
            // Se non conosciamo questa parola, potremmo richiedere feedback
            result.unknownWords.push(possibleCategory);
            result.needsFeedback = true;
          }
          
          // Determina il tipo di transazione basato sulla parola
          if (['stipendio', 'salario', 'bonus', 'rimborso'].includes(possibleCategory)) {
            result.type = 'entrata';
            result.confidence = 'high';
          } else if (['investimento', 'azioni', 'etf', 'fondo', 'crypto', 'bitcoin'].includes(possibleCategory)) {
            result.type = 'investimento';
            result.confidence = 'high';
          }
        }
      }
    }
    
    if (amountMatch) {
      // Normalizza il formato dell'importo (virgola -> punto)
      amountMatch = amountMatch.replace(',', '.');
      result.amount = parseFloat(amountMatch);
    }
    
    // Dizionari estesi per categorie di spesa
    const expenseCategories = {
      'Cibo': [
        "ristorante", "trattoria", "pizzeria", "sushi", "fast food", "mcdonald", 
        "pranzo", "cena", "colazione", "brunch", "aperitivo", "bar", "caffè", "caffetteria",
        "espresso", "cappuccino", "pasticceria", "cornetto", "gelato", "supermercato", 
        "spesa", "alimentari", "cibo", "alimentar", "grocery", "mangiato", "bevuto", "pizza"
      ],
      'Alloggio': [
        "affitto", "mutuo", "condominio", "casa", "bolletta", "utenze", "luce", 
        "elettricità", "gas", "metano", "riscaldamento", "acqua", "tari", "rifiuti",
        "immondizia", "imu", "tasi", "wifi", "internet", "telefono", "fibra"
      ],
      'Trasporto': [
        "benzina", "carburante", "diesel", "gasolio", "rifornimento", "distributore",
        "parcheggio", "autostrada", "pedaggio", "telepass", "treno", "biglietto", 
        "abbonamento", "mensile", "annuale", "bus", "metro", "metropolitana", "tram",
        "taxi", "uber", "lyft", "car sharing", "sharing", "monopattino", "bici",
        "aereo", "volo", "lowcost", "ryanair", "easyjet", "trenitalia", "italo"
      ],
      'Salute': [
        "farmacia", "medicinale", "medicina", "farmaco", "dottore", "medico", 
        "visita", "specialista", "analisi", "esame", "sangue", "radiografia",
        "dentista", "odontoiatra", "ottico", "occhiali", "lenti", "fisioterapia",
        "terapia", "massaggio", "cura", "intervento", "ricovero", "ospedale"
      ],
      'Intrattenimento': [
        "cinema", "film", "biglietto", "concerto", "teatro", "spettacolo", "museo",
        "mostra", "evento", "festival", "netflix", "spotify", "prime", "disney",
        "abbonamento", "streaming", "gioco", "videogioco", "console", "pc", "gaming",
        "book", "libro", "ebook", "kindle", "audible", "musica", "disco", "vinile",
        "bar", "pub", "club", "discoteca", "drink", "cocktail", "aperitivo"
      ],
      'Shopping': [
        "vestiti", "abbigliamento", "scarpe", "accessori", "borsa", "maglietta",
        "pantaloni", "jeans", "felpa", "giacca", "cappotto", "maglione", "camicia",
        "gonna", "vestito", "zaino", "h&m", "zara", "nike", "adidas", "negozio",
        "mall", "centro commerciale", "outlet", "saldi", "amazon", "online"
      ],
      'Tecnologia': [
        "telefono", "smartphone", "cellulare", "iphone", "samsung", "tablet", "ipad",
        "computer", "pc", "laptop", "notebook", "desktop", "monitor", "stampante",
        "scanner", "cuffie", "auricolari", "airpods", "accessorio", "caricatore",
        "usb", "hard disk", "ssd", "memoria", "app", "applicazione", "software"
      ],
      'Fitness': [
        "palestra", "abbonamento", "mensile", "annuale", "personal trainer", "allenamento",
        "fitness", "corso", "yoga", "pilates", "crossfit", "nuoto", "piscina", 
        "tennis", "padel", "calcetto", "calcio", "basket", "attrezzatura", "scarpe"
      ]
    };
    
    // Dizionari per categorie di investimento
    const investmentCategories = {
      'ETF': [
        "etf", "msci", "vanguard", "ishares", "lyxor", "amundi", "invesco", "xtrackers",
        "world", "emerging", "markets", "europe", "usa", "america", "asia", "global",
        "index", "indice", "dividendi", "growth", "value", "small", "mid", "large", "cap"
      ],
      'Azioni': [
        "azioni", "azione", "azionario", "titolo", "titoli", "stock", "stocks", "share",
        "shares", "equity", "equities", "borsa", "nasdaq", "nyse", "ftse", "mib", "dax",
        "piazza affari", "blue chip", "dividend", "dividendo", "cedola", "stacco"
      ],
      'Obbligazioni': [
        "obbligazioni", "obbligazione", "bond", "bonds", "corporate", "governative",
        "government", "treasury", "btp", "bot", "cct", "ctz", "buono", "tesoro",
        "cedola", "duration", "scadenza", "maturity", "high yield", "investment grade",
        "rating", "coupon", "nominale", "emissione", "rimborso"
      ],
      'Crypto': [
        "crypto", "criptovaluta", "bitcoin", "btc", "ethereum", "eth", "altcoin",
        "token", "blockchain", "wallet", "exchange", "binance", "coinbase", "kraken",
        "mining", "staking", "defi", "nft", "ledger", "trezor", "cold storage"
      ],
      'Immobiliare': [
        "immobiliare", "immobile", "casa", "appartamento", "terreno", "property",
        "real estate", "reit", "siiq", "fondi immobiliari", "mattone", "affitto",
        "rendita", "locazione", "nuda proprietà", "usufrutto"
      ],
      'Fondi': [
        "fondo", "fondi", "gestito", "comune", "attivo", "passivo", "investimento",
        "sicav", "bilanciato", "obbligazionario", "azionario", "flessibile", "prudente",
        "dinamico", "aggressive", "defensivo", "strategia", "asset allocation"
      ],
      'Previdenza': [
        "pensione", "previdenza", "integrativa", "complementare", "pip", "fondo pensione",
        "tfr", "contributivo", "rendita", "vitalizio", "vecchiaia", "futuro"
      ]
    };
    
    // Dizionari per categorie di entrata
    const incomeCategories = {
      'Stipendio': [
        "stipendio", "salario", "busta paga", "mensile", "mensili", "paga", "retribuzione",
        "compenso", "emolumenti", "netto", "lordo", "ral", "reddito", "entrata principale"
      ],
      'Bonus': [
        "bonus", "premio", "incentivo", "produzione", "risultato", "una tantum", "gratifica",
        "tredicesima", "quattordicesima", "mensilità aggiuntiva", "straordinari", "extra"
      ],
      'Dividendi': [
        "dividendo", "dividendi", "cedola", "cedole", "stacco", "distribuzione", "utile",
        "profitto", "rendita", "yield", "rendimento", "investimento", "azioni", "titoli"
      ],
      'Freelance': [
        "fattura", "fatturato", "compenso", "onorario", "parcella", "consulenza", 
        "prestazione", "professionale", "autonomo", "p.iva", "partita iva", "cliente"
      ],
      'Affitto': [
        "affitto", "canone", "locazione", "inquilino", "immobile", "rendita", "immobiliare",
        "casa", "appartamento", "entrata", "passiva", "reddito passivo", "proprietà"
      ],
      'Rimborsi': [
        "rimborso", "spese", "trasferta", "viaggio", "missione", "730", "irpef", "tasse",
        "f24", "restituzione", "risarcimento", "indennizzo", "cashback"
      ]
    };
    
    // Determina categoria in base al tipo con punteggio di somiglianza
    let categoryScores: Record<string, number> = {};
    
    if (result.type === 'spesa') {
      // Calcola punteggi per categorie di spesa
      for (const [category, keywords] of Object.entries(expenseCategories)) {
        categoryScores[category] = 0;
        
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            categoryScores[category] += 1;
            // Bonus per parole chiave più specifiche o più lunghe
            if (keyword.length > 6) {
              categoryScores[category] += 0.5;
            }
          }
        }
      }
    } else if (result.type === 'investimento') {
      // Calcola punteggi per categorie di investimento
      for (const [category, keywords] of Object.entries(investmentCategories)) {
        categoryScores[category] = 0;
        
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            categoryScores[category] += 1;
            // Bonus per parole chiave più specifiche
            if (keyword.length > 6) {
              categoryScores[category] += 0.5;
            }
          }
        }
      }
    } else if (result.type === 'entrata') {
      // Calcola punteggi per categorie di entrata
      for (const [category, keywords] of Object.entries(incomeCategories)) {
        categoryScores[category] = 0;
        
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            categoryScores[category] += 1;
            // Bonus per parole chiave più specifiche
            if (keyword.length > 6) {
              categoryScores[category] += 0.5;
            }
          }
        }
      }
    }
    
    // Trova la categoria con il punteggio più alto
    let bestCategory = 'Altro';
    let highestCategoryScore = 0;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > highestCategoryScore) {
        highestCategoryScore = score;
        bestCategory = category;
      }
    }
    
    // Assegna categoria solo se il punteggio è sopra una soglia minima
    if (highestCategoryScore >= 1) {
      result.category = bestCategory;
    } else {
      // Categorie predefinite per ogni tipo se non ne viene trovata una specifica
      if (result.type === 'spesa') {
        result.category = 'Altro';
      } else if (result.type === 'investimento') {
        result.category = 'ETF'; // Categoria di investimento predefinita
      } else if (result.type === 'entrata') {
        result.category = 'Stipendio'; // Categoria di entrata predefinita
      }
    }
    
    // Estrazione descrizione migliorata
    result.description = this.extractDescription(lowerText, result.amount);
    
    // Estrazione data (implementazione base - potrebbe essere estesa)
    const datePatterns = [
      /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/g, // formati come 25/12/2023, 25-12-2023, 25.12.2023
      /(ieri|oggi|domani)/gi, // date relative semplici
      /(luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica)( scorso| prossimo)?/gi // giorni della settimana
    ];
    
    // Imposta il baselineAmount uguale all'amount per le spese
    if (result.type === 'spesa') {
      result.baselineAmount = result.amount;
    }
    
    // Determina la confidenza dell'interpretazione in modo più sofisticato
    let confidenceScore = 0;
    
    // Confidenza sul tipo
    if (typeScore[result.type] >= 3) {
      confidenceScore += 2;
    } else if (typeScore[result.type] > 0) {
      confidenceScore += 1;
    }
    
    // Confidenza sull'importo
    if (result.amount > 0) {
      confidenceScore += 2;
      
      // Bonus per importi "ragionevoli" (evita valori probabilmente errati)
      if (result.amount >= 1 && result.amount <= 10000) {
        confidenceScore += 0.5;
      }
    }
    
    // Confidenza sulla categoria
    if (result.category !== 'Altro' && highestCategoryScore >= 2) {
      confidenceScore += 2;
    } else if (result.category !== 'Altro') {
      confidenceScore += 1;
    }
    
    // Assegna livello di confidenza
    if (confidenceScore >= 4) {
      result.confidence = 'high';
    } else if (confidenceScore >= 2) {
      result.confidence = 'medium';
    } else {
      result.confidence = 'low';
    }
    
    return result;
  }

  // Nuova funzione per estrarre descrizione della transazione
  private extractDescription(text: string, amount: number): string {
    // Rimuovi riferimenti all'importo e alla valuta
    let cleanText = text;
    
    if (amount !== null) {
      cleanText = cleanText.replace(new RegExp(`\\b${amount}\\b`), '');
    }
    
    const currencyTerms = ['euro', 'eur', '€', 'dollari', '$', 'sterline', '£'];
    for (const term of currencyTerms) {
      cleanText = cleanText.replace(new RegExp(`\\b${term}\\b`, 'gi'), '');
    }
    
    // Rimuovi date comuni
    const dateTerms = ['oggi', 'ieri', 'domani', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
    for (const term of dateTerms) {
      cleanText = cleanText.replace(new RegExp(`\\b${term}\\b`, 'gi'), '');
    }
    
    // Rimuovi parole comuni (stopwords italiane)
    const stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'sono', 'sei', 'è', 'siamo', 'siete', 'nel', 'nella', 'nello', 'negli', 'nelle'];
    
    for (const word of stopWords) {
      cleanText = cleanText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    }
    
    // Normalizza spazi
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText || "transazione generica";
  }

  // Memorizza feedback dell'utente per migliorare le future analisi
  storeFeedback(originalAnalysis: NlpAnalysisResult, correctedAnalysis: NlpAnalysisResult): void {
    if (!this.initialized) {
      console.warn('NLP Processor non inizializzato, feedback non memorizzato');
      return;
    }
    
    // Qui potremmo memorizzare il feedback dell'utente per migliorare l'analisi in futuro
    console.log('Feedback ricevuto:', {
      originale: originalAnalysis,
      corretto: correctedAnalysis
    });
    
    // Aggiorna i pattern utente con la descrizione corretta
    if (originalAnalysis.description && correctedAnalysis.category) {
      this.addUserPattern(
        originalAnalysis.description,
        correctedAnalysis.category,
        1.0 // Alta confidenza perché è un feedback esplicito dell'utente
      );
    }
    
    // Idealmente, questo feedback verrebbe salvato in un database per migliorare l'algoritmo
  }

  // NUOVI METODI PER GESTIRE IL FEEDBACK
  
  // Restituisce le parole in attesa di feedback
  getPendingFeedbackWords(): Array<{word: string, guessedCategory: string}> {
    return this.pendingFeedbackWords;
  }

  // Elabora il feedback dell'utente
  processFeedback(word: string, suggestedCategory: string, isCorrect: boolean, correctCategory?: string): void {
    console.log(`Feedback ricevuto per "${word}": categoria suggerita "${suggestedCategory}" è ${isCorrect ? 'corretta' : 'errata'}`);
    
    // Rimuovi la parola dalle parole in attesa
    this.pendingFeedbackWords = this.pendingFeedbackWords.filter(item => item.word !== word);
    
    // Se la categoria suggerita è corretta, aggiungiamo questa parola al dizionario
    if (isCorrect) {
      this.categoryMappings[word.toLowerCase()] = suggestedCategory;
      console.log(`Aggiunta mappatura: "${word}" -> "${suggestedCategory}"`);
    } 
    // Se è fornita una categoria corretta, aggiungiamo questa mappatura
    else if (correctCategory) {
      this.categoryMappings[word.toLowerCase()] = correctCategory;
      console.log(`Corretta mappatura: "${word}" -> "${correctCategory}" (era "${suggestedCategory}")`);
    }
    
    // In un'implementazione reale, salveremmo queste mappature personalizzate in un database
  }

  // NUOVI METODI DAL SISTEMA DI CASHTALK V2.0
  
  // Aggiunge un pattern utente
  addUserPattern(description: string, category: string, similarity: number): void {
    // Controlla se esiste già un pattern simile
    const existingPatternIndex = this.userPatterns.findIndex(
      p => this.calculateSimilarity(p.description, description) > 0.8
    );
    
    if (existingPatternIndex >= 0) {
      // Aggiorna il pattern esistente
      this.userPatterns[existingPatternIndex] = {
        description,
        category,
        similarity: Math.max(similarity, this.userPatterns[existingPatternIndex].similarity)
      };
    } else {
      // Aggiungi nuovo pattern
      this.userPatterns.push({
        description,
        category,
        similarity
      });
    }
    
    console.log(`Pattern utente aggiunto/aggiornato: "${description}" -> ${category}`);
  }
  
  // Trova pattern simili a una descrizione
  findSimilarPatterns(description: string): Array<{description: string, category: string, similarity: number}> {
    const results: Array<{description: string, category: string, similarity: number}> = [];
    
    for (const pattern of this.userPatterns) {
      const similarity = this.calculateSimilarity(description, pattern.description);
      
      if (similarity > 0.5) { // Soglia minima di somiglianza
        results.push({
          description: pattern.description,
          category: pattern.category,
          similarity
        });
      }
    }
    
    // Ordina per similarità in ordine decrescente
    return results.sort((a, b) => b.similarity - a.similarity);
  }
  
  // Calcola similarità tra due testi (Metodo Jaccard semplificato)
  calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    // Tokenizza i testi
    const tokens1 = text1.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const tokens2 = text2.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    
    // Conta i token in comune
    let commonTokens = 0;
    for (const token of tokens1) {
      if (tokens2.includes(token)) {
        commonTokens++;
      }
    }
    
    // Calcola similarità Jaccard
    const totalUniqueTokens = new Set([...tokens1, ...tokens2]).size;
    return totalUniqueTokens > 0 ? commonTokens / totalUniqueTokens : 0;
  }
}

const nlpProcessor = new AdaptiveNlpProcessor();
export default nlpProcessor;
