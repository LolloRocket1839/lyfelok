
// Aggiungo le definizioni dei tipi per NlpAnalysisResult
export interface NlpAnalysisResult {
  type: 'spesa' | 'entrata' | 'investimento';
  amount: number;
  category: string;
  date: string;
  baselineAmount: number;
  confidence: 'high' | 'medium' | 'low';
}

// Classe del processore NLP migliorato
class AdaptiveNlpProcessor {
  private userId: string | null = null;
  private initialized: boolean = false;
  private userPreferences: Record<string, any> = {};
  private transactionHistory: any[] = [];
  private categoryMappings: Record<string, string> = {};

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
        'treno': 'Trasporto',
        'bus': 'Trasporto',
        'taxi': 'Trasporto',
        'benzina': 'Trasporto',
        'affitto': 'Alloggio',
        'bolletta': 'Alloggio',
        'netflix': 'Intrattenimento',
        'cinema': 'Intrattenimento',
        'spotify': 'Intrattenimento'
      };
      
      this.initialized = true;
      console.log('NLP Processor inizializzato per utente:', this.userId);
    } else {
      console.warn('Impossibile inizializzare NLP Processor: ID utente mancante');
    }
  }

  // Analizza il testo e restituisce un risultato strutturato
  analyzeText(text: string): NlpAnalysisResult {
    if (!this.initialized) {
      console.warn('NLP Processor non inizializzato, risultati potrebbero essere imprecisi');
    }
    
    // Utilizziamo una funzione di analisi testuale più avanzata
    const baseResult = this.performTextAnalysis(text);
    
    // Verifica che il tipo sia valido
    const validTypes = ['spesa', 'entrata', 'investimento'] as const;
    let validatedType: 'spesa' | 'entrata' | 'investimento' = 'spesa'; // Valore predefinito
    
    if (validTypes.includes(baseResult.type as any)) {
      validatedType = baseResult.type as 'spesa' | 'entrata' | 'investimento';
    } else {
      console.warn(`Tipo non valido: ${baseResult.type}, impostato a 'spesa'`);
    }
    
    // Costruiamo un oggetto di risposta correttamente tipizzato
    const result: NlpAnalysisResult = {
      type: validatedType,
      amount: baseResult.amount,
      category: baseResult.category,
      date: baseResult.date,
      baselineAmount: baseResult.baselineAmount,
      confidence: baseResult.confidence
    };
    
    // Memorizza questa transazione nella cronologia
    this.transactionHistory.push({
      ...result,
      originalText: text,
      timestamp: new Date()
    });
    
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
      confidence: 'medium' as 'high' | 'medium' | 'low'
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
    
    // Determina il tipo con il punteggio più alto
    if (typeScore.entrata > typeScore.spesa && typeScore.entrata > typeScore.investimento) {
      result.type = 'entrata';
    } else if (typeScore.investimento > typeScore.spesa && typeScore.investimento > typeScore.entrata) {
      result.type = 'investimento';
    } else {
      result.type = 'spesa'; // Default o se il punteggio di spesa è più alto
    }
    
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
        "spesa", "alimentari", "cibo", "alimentar", "grocery", "mangiato", "bevuto"
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
    
    // Idealmente, questo feedback verrebbe salvato in un database per migliorare l'algoritmo
  }
}

const nlpProcessor = new AdaptiveNlpProcessor();
export default nlpProcessor;
